import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api.js';
import LandingLayout from '../../components/ui/LandingLayout.jsx';
import { Shield, CheckCircle, Smartphone } from 'lucide-react';
import { useToast } from '../../components/ui/Toast.jsx';

const TwoFactorSetupPage = () => {
  const { restoreSession } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [step, setStep] = useState(1); // 1 = init, 2 = qr, 3 = success
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fallback helper for useAuth import structure
  function useAuth() {
    return React.useContext(require('../../context/AuthContext.jsx').AuthContext || {});
  }

  const handleStartEnroll = async () => {
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/auth/2fa/enroll');
      setQrCode(data.qrCode);
      setSecret(data.secret);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start 2FA enrollment.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/2fa/verify', { code });
      await restoreSession(); // Refresh context user status
      setStep(3);
      showToast('Two-Factor Authentication setup successful!', 'success');
      
      // Auto redirect to home page after 2.5 seconds
      setTimeout(() => {
        navigate('/');
      }, 2500);
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed. Please double check the code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LandingLayout>
      <div className="max-w-md mx-auto px-margin-mobile md:px-margin-desktop py-16 flex-grow flex flex-col justify-center animate-fade-in w-full">
        <div className="bg-white rounded-2xl p-8 border border-[#E5DED4] shadow-xl text-center space-y-6">
          
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="w-14 h-14 rounded-full bg-[#FAF6F0] flex items-center justify-center text-[#ffa630] border border-[#E5DED4] shadow-sm">
                  <Shield className="w-7 h-7" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="font-display-lg text-2xl text-[#0B1226]">Secure your account?</h2>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Enable two-factor authentication to secure your bookings, saved itineraries, and travel document vaults.
                </p>
              </div>
              {error && (
                <div className="text-xs font-bold text-[#ba1a1a] bg-[#ffdad6] border border-[#ba1a1a]/10 p-3 rounded-xl">
                  {error}
                </div>
              )}
              <button 
                onClick={handleStartEnroll} 
                disabled={loading}
                className="w-full h-13 bg-[#ffa630] text-[#0B1226] font-bold rounded-full cursor-pointer hover:brightness-105 active:scale-95 transition-all shadow-md font-label-caps text-xs uppercase tracking-wider flex items-center justify-center gap-2"
              >
                {loading ? 'Starting...' : 'Configure Authenticator'}
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 text-left">
              <div className="text-center space-y-2">
                <h2 className="font-display-lg text-2xl text-[#0B1226]">Scan QR Code</h2>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Scan the QR code below inside Google Authenticator, Authy, or any TOTP application on your mobile device.
                </p>
              </div>

              {qrCode && (
                <div className="flex justify-center p-4 bg-white rounded-2xl w-fit mx-auto border border-[#E5DED4] shadow-sm animate-scale-in">
                  <img src={qrCode} alt="TOTP QR Code" className="w-48 h-48 select-none" />
                </div>
              )}

              <div className="p-3 bg-[#FAF6F0] border border-[#E5DED4] rounded-xl text-center">
                <div className="text-[10px] uppercase font-bold text-outline mb-1 tracking-wider">Backup Key</div>
                <div className="font-mono text-xs select-all text-[#006875] font-bold tracking-wide break-all">{secret}</div>
              </div>

              {error && (
                <div className="text-xs font-bold text-[#ba1a1a] bg-[#ffdad6] border border-[#ba1a1a]/10 p-3 rounded-xl text-center animate-wiggle">
                  {error}
                </div>
              )}

              <form onSubmit={handleVerify} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] text-outline font-bold uppercase tracking-wider block ml-1">
                    Enter 6-Digit Code
                  </label>
                  <div className="relative">
                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline-variant" />
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength="6"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      required
                      disabled={loading}
                      className="w-full h-12 pl-12 pr-4 bg-white border border-[#D1C7BD] rounded-xl text-center text-lg font-bold tracking-[0.5em] focus:border-primary transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => setStep(1)}
                    className="w-1/2 h-13 border border-[#D1C7BD] text-outline font-bold rounded-full cursor-pointer hover:bg-[#FAF6F0] active:scale-95 transition-all text-xs font-label-caps uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    loading={loading}
                    disabled={code.length !== 6}
                    className="w-1/2 h-13 bg-[#ffa630] text-[#0B1226] font-bold rounded-full cursor-pointer hover:brightness-105 active:scale-95 transition-all shadow-md text-xs font-label-caps uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Verifying...' : 'Verify'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="w-14 h-14 rounded-full bg-success/20 border border-success/30 text-success flex items-center justify-center shadow-sm animate-scale-in">
                  <CheckCircle className="w-8 h-8" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="font-display-lg text-2xl text-success">Setup Successful!</h2>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Two-factor authentication is now active. You will be automatically redirected to the dashboard in a moment...
                </p>
              </div>
              <button 
                onClick={() => navigate('/')} 
                className="w-full h-13 bg-[#ffa630] text-[#0B1226] font-bold rounded-full cursor-pointer hover:brightness-105 active:scale-95 transition-all shadow-md font-label-caps text-xs uppercase tracking-wider"
              >
                Go to Dashboard
              </button>
            </div>
          )}

        </div>
      </div>
    </LandingLayout>
  );
};

export default TwoFactorSetupPage;
