import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import LandingLayout from '../../components/ui/LandingLayout.jsx';

const SignupPage = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState('');
  const [signupError, setSignupError] = useState('');

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setSignupError('');
    setSignupSuccess('');

    // Pre-validate password requirements
    const isLengthOk = signupPassword.length >= 12;
    const hasUpper = /[A-Z]/.test(signupPassword);
    const hasLower = /[a-z]/.test(signupPassword);
    const hasDigit = /[0-9]/.test(signupPassword);
    const hasSpecial = /[^a-zA-Z0-9]/.test(signupPassword);

    if (!isLengthOk || !hasUpper || !hasLower || !hasDigit || !hasSpecial) {
      setSignupError('Password does not meet all the security requirements.');
      return;
    }

    setSignupLoading(true);
    try {
      const res = await signup({ name: signupName, email: signupEmail.toLowerCase(), password: signupPassword });
      setSignupSuccess(res.message || 'Account created successfully! Please check your email to verify.');
      setSignupName('');
      setSignupEmail('');
      setSignupPassword('');
    } catch (err) {
      setSignupError(err.response?.data?.error || err.message || 'Registration failed.');
    } finally {
      setSignupLoading(false);
    }
  };

  return (
    <LandingLayout>
      <section className="min-h-[calc(100vh-280px)] flex items-center justify-center px-margin-mobile md:px-margin-desktop py-16">
        <div className="w-full max-w-[460px] bg-white border border-[#E5DED4] rounded-2xl p-8 md:p-10 shadow-xl flex flex-col items-center text-center">
          <span className="font-label-caps text-label-caps text-on-background uppercase tracking-widest mb-4 opacity-80">
            Get Started
          </span>
          <h1 className="font-headline-md text-headline-md text-on-background mb-8">
            Create your account
          </h1>
          {signupSuccess ? (
            <div className="w-full bg-[#e6f4ea]/10 border border-[#3bc48a]/30 rounded-xl p-8 text-center flex flex-col items-center shadow-sm">
              <span className="material-symbols-outlined text-primary text-5xl mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <h3 className="font-headline-md text-xl mb-2 text-on-surface">Registration Success</h3>
              <p className="text-sm text-on-surface-variant mb-6">{signupSuccess}</p>
              <button
                onClick={() => navigate('/login')}
                className="bg-primary-container text-on-primary-container px-6 py-2 rounded-lg font-label-caps text-label-caps hover:brightness-110 transition-all cursor-pointer font-bold"
              >
                Go to Log In
              </button>
            </div>
          ) : (
            <form onSubmit={handleSignupSubmit} className="w-full space-y-6 text-left">
              {signupError && (
                <div className="p-4 bg-error/10 border border-error/20 text-[#ba1a1a] rounded-xl text-sm flex gap-2 items-center">
                  <span className="material-symbols-outlined text-lg flex-shrink-0">error</span>
                  <span>{signupError}</span>
                </div>
              )}

              {/* Full Name */}
              <div className="flex flex-col gap-2">
                <label className="font-label-caps text-label-caps text-on-surface-variant ml-1" htmlFor="full-name">
                  Full name
                </label>
                <input
                  className="w-full h-12 px-4 rounded-xl border border-[#D1C7BD] bg-white focus:border-primary transition-all outline-none"
                  id="full-name"
                  placeholder="E.g. Amelia Earhart"
                  required
                  type="text"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-2">
                <label className="font-label-caps text-label-caps text-on-surface-variant ml-1" htmlFor="email">
                  Email
                </label>
                <input
                  className="w-full h-12 px-4 rounded-xl border border-[#D1C7BD] bg-white focus:border-primary transition-all outline-none"
                  id="email"
                  placeholder="amelia@journeys.com"
                  required
                  type="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-2">
                <label className="font-label-caps text-label-caps text-on-surface-variant ml-1" htmlFor="password">
                  Password
                </label>
                <input
                  className="w-full h-12 px-4 rounded-xl border border-[#D1C7BD] bg-white focus:border-primary transition-all outline-none"
                  id="password"
                  placeholder="••••••••"
                  required
                  type="password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                />

                {/* Password requirements visual indicator */}
                <div className="mt-2 space-y-1.5 text-xs text-on-surface-variant/80 ml-1">
                  <p className="font-bold font-label-caps text-[10px] text-outline uppercase tracking-wider mb-1">Requirements</p>
                  <div className="flex items-center gap-2">
                    <span className={`material-symbols-outlined text-[16px] ${signupPassword.length >= 12 ? 'text-[#006d35]' : 'text-outline/40'}`}>
                      {signupPassword.length >= 12 ? 'check_circle' : 'circle'}
                    </span>
                    <span>At least 12 characters</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`material-symbols-outlined text-[16px] ${/[A-Z]/.test(signupPassword) ? 'text-[#006d35]' : 'text-outline/40'}`}>
                      {/[A-Z]/.test(signupPassword) ? 'check_circle' : 'circle'}
                    </span>
                    <span>At least one uppercase letter</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`material-symbols-outlined text-[16px] ${/[a-z]/.test(signupPassword) ? 'text-[#006d35]' : 'text-outline/40'}`}>
                      {/[a-z]/.test(signupPassword) ? 'check_circle' : 'circle'}
                    </span>
                    <span>At least one lowercase letter</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`material-symbols-outlined text-[16px] ${/[0-9]/.test(signupPassword) ? 'text-[#006d35]' : 'text-outline/40'}`}>
                      {/[0-9]/.test(signupPassword) ? 'check_circle' : 'circle'}
                    </span>
                    <span>At least one number</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`material-symbols-outlined text-[16px] ${/[^a-zA-Z0-9]/.test(signupPassword) ? 'text-[#006d35]' : 'text-outline/40'}`}>
                      {/[^a-zA-Z0-9]/.test(signupPassword) ? 'check_circle' : 'circle'}
                    </span>
                    <span>At least one special character</span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                className="w-full h-14 bg-[#ffa630] text-[#0B1226] font-bold rounded-full cursor-pointer active:scale-95 transition-all hover:brightness-110 shadow-sm mt-4 flex items-center justify-center gap-2"
                type="submit"
                disabled={signupLoading}
              >
                {signupLoading ? (
                  <span className="w-5 h-5 border-2 border-on-primary-container border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>
          )}

          {!signupSuccess && (
            <div className="mt-8 font-body-md text-on-surface-variant">
              Already have an account?
              <button onClick={() => navigate('/login')} className="text-primary font-semibold hover:underline cursor-pointer ml-1">Log In</button>
            </div>
          )}

          {/* Ink Stamp Motif */}
          <div className="mt-10 border-2 border-primary/20 text-primary/20 px-4 py-1 font-label-caps text-label-caps rounded-full select-none rotate-[-3deg] inline-block">
            EST. 2026
          </div>
        </div>
      </section>
    </LandingLayout>
  );
};

export default SignupPage;
