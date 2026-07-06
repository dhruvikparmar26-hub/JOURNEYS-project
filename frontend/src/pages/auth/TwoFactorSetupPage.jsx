import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api.js';
import Card from '../../components/ui/Card.jsx';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';
import AppShell from '../../components/ui/AppShell.jsx';
import useAuth from '../../hooks/useAuth.js';
import { Shield, CheckCircle, Smartphone } from 'lucide-react';

const TwoFactorSetupPage = () => {
  const { restoreSession } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = init, 2 = qr, 3 = success
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed. Please double check the code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-md mx-auto px-4 py-16 flex-grow flex flex-col justify-center animate-fade-in w-full">
        <Card elevated className="border border-border-subtle p-8 bg-bg-surface shadow-md">
          {step === 1 && (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-12 h-12 rounded-xl bg-accent-gold/15 border border-accent-gold-dark/20 flex items-center justify-center text-[#006d35]">
                  <Shield className="w-6 h-6" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-extrabold text-text-primary tracking-tight">Enable Two-Factor Auth</h2>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Secure your JOURNEYS account by requiring a code from your mobile authenticator app.
                </p>
              </div>
              {error && <div className="text-xs font-bold text-danger bg-[#fce8e6] border border-[#ba1a1a]/20 p-2.5 rounded-lg">{error}</div>}
              <Button fullWidth onClick={handleStartEnroll} loading={loading} className="font-bold cursor-pointer">
                Configure Authenticator
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-xl font-extrabold text-text-primary tracking-tight">Scan QR Code</h2>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Scan the QR code using Google Authenticator, Authy, or any TOTP app.
                </p>
              </div>

              {qrCode && (
                <div className="flex justify-center p-4 bg-white rounded-2xl w-fit mx-auto border border-border-subtle shadow-sm">
                  <img src={qrCode} alt="TOTP QR Code" className="w-48 h-48" />
                </div>
              )}

              <div className="p-3 bg-bg-elevated border border-border/40 rounded-xl text-center">
                <div className="text-[10px] uppercase font-bold text-text-muted mb-1">Backup Key</div>
                <div className="font-mono text-xs select-all text-[#006d35] font-bold tracking-wide">{secret}</div>
              </div>

              {error && <div className="text-xs font-bold text-danger bg-[#fce8e6] border border-[#ba1a1a]/20 p-2.5 rounded-lg text-center">{error}</div>}

              <form onSubmit={handleVerify} className="space-y-4">
                <Input
                  label="Enter 6-Digit Code"
                  type="text"
                  icon={Smartphone}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength="6"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  required
                  disabled={loading}
                  className="text-center tracking-[0.5em] text-base font-mono placeholder:tracking-normal placeholder:font-sans"
                />
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    fullWidth
                    disabled={loading}
                    onClick={() => setStep(1)}
                    className="font-bold cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    fullWidth
                    loading={loading}
                    disabled={code.length !== 6}
                    className="font-bold cursor-pointer"
                  >
                    Verify
                  </Button>
                </div>
              </form>
            </div>
          )}

          {step === 3 && (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-12 h-12 rounded-full bg-[#e6f4ea] border border-[#3bc48a]/20 text-[#006d35] flex items-center justify-center">
                  <CheckCircle className="w-6 h-6" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-extrabold text-text-primary tracking-tight font-sans">2FA Enabled!</h2>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Your account is now protected. The next time you log in, you will be prompted for a verification code.
                </p>
              </div>
              <Button fullWidth onClick={() => navigate('/')} className="font-bold cursor-pointer">
                Go to Dashboard
              </Button>
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
};

export default TwoFactorSetupPage;
