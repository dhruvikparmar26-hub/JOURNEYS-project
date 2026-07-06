import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api.js';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('Verifying your email address...');
  const verifyAttempted = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. No token provided.');
      return;
    }

    // Prevent double verification attempts on StrictMode double-mount
    if (verifyAttempted.current) return;
    verifyAttempted.current = true;

    const verifyEmail = async () => {
      try {
        const { data } = await api.post('/auth/verify-email', { token });
        setStatus('success');
        setMessage(data.message || 'Email verified successfully!');
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.error || 'Email verification failed. The link may have expired or is invalid.');
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center px-4 py-12 bg-bg-primary">
      <div className="w-full max-w-md animate-fade-in">
        <Card elevated className="border border-border text-center">
          <div className="flex flex-col items-center mb-6">
            {status === 'verifying' && (
              <div className="w-12 h-12 rounded-full border-2 border-border border-t-accent-gold animate-spin mb-4" />
            )}

            {status === 'success' && (
              <div className="w-12 h-12 rounded-full bg-success/10 border border-success/20 text-success flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}

            {status === 'error' && (
              <div className="w-12 h-12 rounded-full bg-danger/10 border border-danger/20 text-danger flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            )}

            <h2 className="text-2xl font-bold tracking-tight text-text-primary">Email Verification</h2>
          </div>

          <p className="text-text-secondary mb-8 text-sm leading-relaxed">{message}</p>

          <Link to="/" replace>
            <Button variant={status === 'success' ? 'primary' : 'outline'} fullWidth>
              {status === 'success' ? 'Go to Dashboard' : 'Back to Dashboard'}
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
