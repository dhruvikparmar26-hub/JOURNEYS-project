import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import LandingLayout from '../../components/ui/LandingLayout.jsx';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginSuccess('');
    setLoginLoading(true);

    try {
      const res = await login({ email: loginEmail.toLowerCase(), password: loginPassword });
      if (res.requiresTOTP) {
        throw new Error('Two-factor authentication is required. Direct login from this client is temporarily restricted.');
      }
      setLoginSuccess('Logged in successfully!');
      setLoginEmail('');
      setLoginPassword('');
      setTimeout(() => {
        setLoginSuccess('');
        navigate('/');
      }, 1500);
    } catch (err) {
      setLoginError(err.response?.data?.error || err.message || 'Login failed.');
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <LandingLayout>
      <section className="min-h-[calc(100vh-280px)] flex items-center justify-center px-margin-mobile md:px-margin-desktop py-16">
        <div className="w-full max-w-[460px] bg-white border border-[#E5DED4] rounded-2xl p-8 md:p-10 shadow-xl flex flex-col items-center text-center">
          <span className="font-label-caps text-label-caps text-on-background uppercase tracking-widest mb-4 opacity-80">
            Welcome back
          </span>
          <h1 className="font-headline-md text-headline-md text-on-background mb-8">
            Log in to Journeys
          </h1>
          {loginSuccess ? (
            <div className="w-full bg-[#e6f4ea]/10 border border-[#3bc48a]/30 rounded-xl p-8 text-center flex flex-col items-center shadow-sm">
              <span className="material-symbols-outlined text-primary text-5xl mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <h3 className="font-headline-md text-xl mb-2 text-on-surface">Login Successful</h3>
              <p className="text-sm text-on-surface-variant mb-6">{loginSuccess}</p>
            </div>
          ) : (
            <form onSubmit={handleLoginSubmit} className="w-full space-y-6 text-left">
              {loginError && (
                <div className="p-4 bg-error/10 border border-error/20 text-[#ba1a1a] rounded-xl text-sm flex gap-2 items-center">
                  <span className="material-symbols-outlined text-lg flex-shrink-0">error</span>
                  <span>{loginError}</span>
                </div>
              )}

              {/* Email */}
              <div className="flex flex-col gap-2">
                <label className="font-label-caps text-label-caps text-on-surface-variant ml-1" htmlFor="login-email">
                  Email
                </label>
                <input
                  className="w-full h-12 px-4 rounded-xl border border-[#D1C7BD] bg-white focus:border-primary transition-all outline-none"
                  id="login-email"
                  placeholder="amelia@journeys.com"
                  required
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="font-label-caps text-label-caps text-on-surface-variant" htmlFor="login-password">
                    Password
                  </label>
                  <Link to="/reset-password" className="text-xs text-primary font-semibold hover:underline">Forgot password?</Link>
                </div>
                <input
                  className="w-full h-12 px-4 rounded-xl border border-[#D1C7BD] bg-white focus:border-primary transition-all outline-none"
                  id="login-password"
                  placeholder="••••••••"
                  required
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
              </div>

              {/* Submit Button */}
              <button
                className="w-full h-14 bg-[#ffa630] text-[#0B1226] font-bold rounded-full cursor-pointer active:scale-95 transition-all hover:brightness-110 shadow-sm mt-4 flex items-center justify-center gap-2"
                type="submit"
                disabled={loginLoading}
              >
                {loginLoading ? (
                  <span className="w-5 h-5 border-2 border-on-primary-container border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  'Log In'
                )}
              </button>
            </form>
          )}

          {!loginSuccess && (
            <div className="mt-8 font-body-md text-on-surface-variant">
              New to Journeys?
              <button onClick={() => navigate('/signup')} className="text-primary font-semibold hover:underline cursor-pointer ml-1">Create an account</button>
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

export default LoginPage;
