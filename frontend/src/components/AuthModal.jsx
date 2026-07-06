import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth.js';
import Input from './ui/Input.jsx';
import Button from './ui/Button.jsx';
import Modal from './ui/Modal.jsx';
import { Mail, Lock, User, Shield, Sparkles, Navigation, AlertCircle, CheckCircle } from 'lucide-react';

/**
 * AuthModal - In-place login/signup/forgot-password/2FA verification overlay.
 *
 * Implements:
 * - Tabs (Login / Signup)
 * - Password strength meter for Signup
 * - Lockout countdown timers on repeated login failures
 * - Inline 2FA entry stage
 * - Inline forgot password request
 * - OAuth button
 * - Post-login guest itinerary claiming
 */
const AuthModal = ({ isOpen, onClose, contextMessage, onAuthed }) => {
  const { login, signup, validate2FA, claimGuestItineraries } = useAuth();
  const [activeTab, setActiveTab] = useState('login'); // login | signup | forgot | totp
  
  // Form fields
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // TOTP code state
  const [totpCode, setTotpCode] = useState('');
  const [tempToken, setTempToken] = useState('');

  // Lockout states
  const [lockoutTime, setLockoutTime] = useState(null);
  const [lockoutCountdown, setLockoutCountdown] = useState(0);

  // Status states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Password strength calculation
  const getPasswordStrength = (pwd) => {
    let score = 0;
    if (!pwd) return { score, label: '', color: 'bg-border' };

    if (pwd.length >= 12) score += 1;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    switch (score) {
      case 0:
      case 1:
        return { score, label: 'Weak', color: 'bg-danger' };
      case 2:
      case 3:
        return { score, label: 'Medium', color: 'bg-warning' };
      case 4:
        return { score, label: 'Strong', color: 'bg-success' };
      default:
        return { score, label: '', color: 'bg-border' };
    }
  };

  const strength = getPasswordStrength(password);

  // Reset fields on close or open
  useEffect(() => {
    if (isOpen) {
      setError('');
      setSuccess('');
      setPassword('');
      setConfirmPassword('');
      setTotpCode('');
      setTempToken('');
      setLoading(false);
    }
  }, [isOpen, activeTab]);

  // Lockout countdown timer
  useEffect(() => {
    if (!lockoutTime) return;

    const interval = setInterval(() => {
      const remaining = Math.ceil((new Date(lockoutTime).getTime() - Date.now()) / 1000);
      if (remaining <= 0) {
        setLockoutTime(null);
        setLockoutCountdown(0);
        setError('');
        clearInterval(interval);
      } else {
        setLockoutCountdown(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockoutTime]);

  const handleClaimAndDone = async () => {
    try {
      // Claim guest itineraries automatically
      if (claimGuestItineraries) {
        await claimGuestItineraries();
      }
    } catch (err) {
      console.error('Failed to claim guest itineraries:', err);
    }
    if (onAuthed) onAuthed();
    onClose();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (lockoutTime) return;
    setError('');
    setLoading(true);

    try {
      const result = await login({ email, password });
      if (result.requiresTOTP) {
        setTempToken(result.tempToken);
        setActiveTab('totp');
      } else {
        await handleClaimAndDone();
      }
    } catch (err) {
      const responseData = err.response?.data;
      if (responseData?.code === 'ACCOUNT_LOCKED') {
        const lockUntil = responseData.lockedUntil;
        setLockoutTime(lockUntil);
        const remaining = Math.ceil((new Date(lockUntil).getTime() - Date.now()) / 1000);
        setLockoutCountdown(remaining);
        setError(`Too many failed attempts. Account locked. Try again in ${Math.ceil(remaining / 60)} minutes.`);
      } else {
        setError(responseData?.error || 'Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await signup({ email, password, name });
      setSuccess('Account created successfully! Please check your email to verify your account.');
      setEmail('');
      setName('');
      setPassword('');
      // Auto toggle to login after short delay
      setTimeout(() => {
        setActiveTab('login');
        setSuccess('');
      }, 5000);
    } catch (err) {
      const responseData = err.response?.data;
      if (responseData?.details) {
        const details = responseData.details;
        const msg = Object.values(details).flat().join(', ');
        setError(msg || 'Invalid registration details.');
      } else {
        setError(responseData?.error || 'Registration failed. Try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handle2FA = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await validate2FA({ tempToken, code: totpCode });
      await handleClaimAndDone();
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid authentication code.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const apiModule = (await import('../utils/api.js')).default;
      const { data } = await apiModule.post('/auth/forgot-password', { email });
      setSuccess(data.message || 'If that email exists, a password reset link has been sent.');
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        activeTab === 'login' ? 'Sign In' :
        activeTab === 'signup' ? 'Create Account' :
        activeTab === 'forgot' ? 'Reset Password' :
        'Two-Factor Auth'
      }
      size="sm"
    >
      {/* Context/Prompt Banner */}
      {contextMessage && activeTab !== 'totp' && (
        <div className="mb-5 p-3 rounded-xl bg-accent-blue/15 border border-accent-blue/20 text-accent-blue text-xs font-semibold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#45655c] flex-shrink-0" />
          <span className="leading-relaxed">{contextMessage}</span>
        </div>
      )}

      {/* Tabs Selector */}
      {(activeTab === 'login' || activeTab === 'signup') && (
        <div className="flex bg-bg-elevated p-1 rounded-xl mb-6 border border-border/40">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'login' ? 'bg-bg-surface text-[#006d35] shadow-sm' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setActiveTab('signup')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'signup' ? 'bg-bg-surface text-[#006d35] shadow-sm' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Create Account
          </button>
        </div>
      )}

      {/* Alerts */}
      {error && (
        <div className="mb-4 p-3.5 rounded-xl bg-[#fce8e6] border border-[#ba1a1a]/20 text-[#ba1a1a] text-xs flex gap-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div className="leading-normal font-semibold">{error}</div>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3.5 rounded-xl bg-[#e6f4ea] border border-[#3bc48a]/20 text-[#006d35] text-xs flex gap-2.5">
          <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div className="leading-normal font-semibold">{success}</div>
        </div>
      )}

      {/* 1. Login View */}
      {activeTab === 'login' && (
        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            disabled={loading || lockoutTime !== null}
          />
          <div className="space-y-1">
            <div className="flex justify-between items-center mb-0.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Password</label>
              <button
                type="button"
                onClick={() => setActiveTab('forgot')}
                className="text-[10px] font-bold uppercase tracking-wider text-accent-blue hover:text-accent-blue-dark transition-colors cursor-pointer"
              >
                Forgot?
              </button>
            </div>
            <Input
              type="password"
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              disabled={loading || lockoutTime !== null}
            />
          </div>
          <Button
            type="submit"
            fullWidth
            loading={loading}
            disabled={lockoutTime !== null}
            className="mt-2 font-bold cursor-pointer"
          >
            {lockoutTime
              ? `Locked (${Math.floor(lockoutCountdown / 60)}m ${lockoutCountdown % 60}s)`
              : 'Sign In'}
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/40"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-bg-surface px-3 text-text-muted font-bold font-mono tracking-wider">Or</span>
            </div>
          </div>

          <Button
            variant="outline"
            fullWidth
            onClick={handleGoogleLogin}
            type="button"
            className="border-border hover:border-text-secondary text-text-primary cursor-pointer font-bold"
            icon={() => (
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
            )}
            iconPosition="left"
          >
            Sign in with Google
          </Button>
        </form>
      )}

      {/* 2. Signup View */}
      {activeTab === 'signup' && (
        <form onSubmit={handleSignup} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            icon={User}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Alex Mercer"
            required
            disabled={loading}
          />
          <Input
            label="Email Address"
            type="email"
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            disabled={loading}
          />
          <div className="space-y-1.5">
            <Input
              label="Password"
              type="password"
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 12 characters"
              required
              disabled={loading}
            />
            {password && (
              <div className="space-y-1 mt-1">
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="text-text-muted">Strength:</span>
                  <span className={`font-extrabold uppercase tracking-wide ${
                    strength.label === 'Strong' ? 'text-success' :
                    strength.label === 'Medium' ? 'text-[#b87a1e]' : 'text-danger'
                  }`}>{strength.label}</span>
                </div>
                <div className="h-1 w-full bg-bg-elevated rounded-full overflow-hidden border border-border/30">
                  <div
                    className={`h-full transition-all duration-300 ${strength.color}`}
                    style={{ width: `${(strength.score / 4) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
          <Button
            type="submit"
            fullWidth
            loading={loading}
            className="mt-2 font-bold cursor-pointer"
          >
            Create Account
          </Button>
        </form>
      )}

      {/* 3. Forgot Password View */}
      {activeTab === 'forgot' && (
        <form onSubmit={handleForgotPassword} className="space-y-4">
          <p className="text-xs text-text-secondary leading-relaxed mb-1">
            Enter your registered email address and we'll mail you instructions to reset your password.
          </p>
          <Input
            label="Email Address"
            type="email"
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            disabled={loading}
          />
          <Button
            type="submit"
            fullWidth
            loading={loading}
            className="mt-2 font-bold cursor-pointer"
          >
            Send Reset Link
          </Button>
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className="w-full text-center text-xs font-bold uppercase tracking-wider text-text-muted hover:text-text-primary transition-colors mt-2 cursor-pointer"
          >
            Back to Sign In
          </button>
        </form>
      )}

      {/* 4. 2FA Input View */}
      {activeTab === 'totp' && (
        <form onSubmit={handle2FA} className="space-y-5">
          <p className="text-xs text-text-secondary leading-relaxed text-center mb-1">
            Enter the 6-digit authentication code from your authenticator app to complete sign in.
          </p>
          <Input
            label="Verification Code"
            type="text"
            icon={Shield}
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength="6"
            value={totpCode}
            onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
            placeholder="000000"
            required
            disabled={loading}
            className="text-center tracking-[0.5em] text-base font-mono placeholder:tracking-normal placeholder:font-sans"
          />
          <Button
            type="submit"
            fullWidth
            loading={loading}
            disabled={totpCode.length !== 6}
            className="font-bold cursor-pointer"
          >
            Verify
          </Button>
          <button
            type="button"
            onClick={() => {
              setTempToken('');
              setActiveTab('login');
            }}
            className="w-full text-center text-xs font-bold uppercase tracking-wider text-text-muted hover:text-text-primary transition-colors mt-1 cursor-pointer"
          >
            Back to Sign In
          </button>
        </form>
      )}
    </Modal>
  );
};

export default AuthModal;
