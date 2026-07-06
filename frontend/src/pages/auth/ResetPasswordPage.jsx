import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api.js';
import Card from '../../components/ui/Card.jsx';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. No token provided.');
    }
  }, [token]);

  // Password strength check
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.post('/auth/reset-password', { token, password });
      setSuccess(data.message || 'Password reset successfully.');
      setPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err) {
      const responseData = err.response?.data;
      if (responseData?.details) {
        const details = responseData.details;
        const msg = Object.values(details).flat().join(', ');
        setError(msg || 'Invalid password.');
      } else {
        setError(responseData?.error || 'Failed to reset password. The link may have expired or is invalid.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center px-4 py-12 bg-bg-primary">
      <div className="w-full max-w-md animate-fade-in">
        <Card elevated className="border border-border">
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-gold to-accent-gold-dark flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-bg-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-text-primary">Set New Password</h2>
            <p className="text-sm text-text-secondary mt-1">Please enter a new, secure password</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm flex gap-3">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>{error}</div>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-xl bg-success/10 border border-success/20 text-success text-sm flex gap-3">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>{success} Redirecting to login...</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Input
                label="New Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 12 characters"
                required
                disabled={loading || !token}
              />
              
              {password && (
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-text-muted">Password strength:</span>
                    <span className={
                      strength.label === 'Strong' ? 'text-success font-semibold' :
                      strength.label === 'Medium' ? 'text-warning font-semibold' :
                      'text-danger font-semibold'
                    }>
                      {strength.label}
                    </span>
                  </div>
                  <div className="h-1 w-full bg-bg-elevated rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${strength.color}`}
                      style={{ width: `${(strength.score / 4) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <Input
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
              disabled={loading || !token}
            />

            <Button
              type="submit"
              fullWidth
              loading={loading}
              disabled={!token}
              className="mt-4"
            >
              Reset Password
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
