import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api.js';
import AppShell from '../components/ui/AppShell.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import StatusPill from '../components/ui/StatusPill.jsx';
import { User, Mail, Shield, LogOut, Camera, Check } from 'lucide-react';
import useAuth from '../hooks/useAuth.js';

const Settings = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setAvatar(user.avatar || '');
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      const payload = {};
      if (name !== (user?.name || '')) {
        payload.name = name;
      }
      if (avatar !== (user?.avatar || '')) {
        payload.avatar = avatar;
      }

      if (Object.keys(payload).length === 0) {
        setSaving(false);
        return;
      }

      const { data } = await api.patch('/auth/me', payload);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  const userInitials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() || 'U';

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="headline-md text-2xl font-bold tracking-tight text-text-primary mb-2">
            Account Settings
          </h1>
          <p className="text-sm text-text-secondary">
            Manage your profile and preferences
          </p>
        </div>

        {/* Profile Card */}
        <Card className="mb-6">
          <div className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-6">
              <div className="relative">
                {avatar ? (
                  <img
                    src={avatar}
                    alt="Avatar"
                    className="w-20 h-20 rounded-full object-cover border-2 border-border-light"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-primary-fixed/25 text-primary font-bold flex items-center justify-center border-2 border-border-light text-2xl">
                    {userInitials}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-text-primary mb-1">
                  {user?.name || 'User'}
                </h3>
                <p className="text-sm text-text-muted">{user?.email}</p>
              </div>
            </div>

            {/* Status Badges */}
            <div className="flex flex-wrap gap-3">
              <StatusPill
                label={user?.emailVerified ? 'Email Verified' : 'Email Not Verified'}
                color={user?.emailVerified ? 'success' : 'warning'}
                pulsing={false}
              />
              <StatusPill
                label={user?.totpEnabled ? '2FA Enabled' : '2FA Disabled'}
                color={user?.totpEnabled ? 'success' : 'info'}
                pulsing={false}
              />
            </div>
          </div>
        </Card>

        {/* Edit Profile Form */}
        <Card className="mb-6">
          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-text-primary mb-4 flex items-center gap-2">
                <User className="w-4 h-4" />
                Profile Information
              </h3>
              
              <Input
                label="Display Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
              />

              <Input
                label="Avatar URL"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                hint="Enter a URL for your profile picture"
              />

              {avatar && (
                <div className="mt-4">
                  <p className="text-xs text-text-muted mb-2">Preview:</p>
                  <img
                    src={avatar}
                    alt="Avatar preview"
                    className="w-16 h-16 rounded-full object-cover border border-border-light"
                    onError={() => setAvatar('')}
                  />
                </div>
              )}
            </div>

            {success && (
              <div className="flex items-center gap-2 text-sm text-success">
                <Check className="w-4 h-4" />
                Profile updated successfully
              </div>
            )}

            <Button
              type="submit"
              loading={saving}
              disabled={saving}
              className="w-full sm:w-auto"
            >
              Save Changes
            </Button>
          </form>
        </Card>

        {/* Email Section (Read-only) */}
        <Card className="mb-6">
          <div className="space-y-4">
            <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Address
            </h3>
            <div className="p-4 bg-bg-elevated rounded border border-border-light">
              <p className="text-sm text-text-primary">{user?.email}</p>
              <p className="text-xs text-text-muted mt-1">
                Email address cannot be changed. Contact support if you need to update it.
              </p>
            </div>
          </div>
        </Card>

        {/* 2FA Section */}
        <Card className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded bg-primary-fixed/10">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-base font-bold text-text-primary">
                  Two-Factor Authentication
                </h3>
                <p className="text-sm text-text-muted">
                  Add an extra layer of security to your account
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/settings/2fa')}
            >
              {user?.totpEnabled ? 'Manage' : 'Enable'}
            </Button>
          </div>
        </Card>

        {/* Sign Out */}
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded bg-danger/10">
                <LogOut className="w-5 h-5 text-danger" />
              </div>
              <div>
                <h3 className="text-base font-bold text-text-primary">
                  Sign Out
                </h3>
                <p className="text-sm text-text-muted">
                  Sign out of your account on this device
                </p>
              </div>
            </div>
            <Button
              variant="danger"
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          </div>
        </Card>
      </div>
    </AppShell>
  );
};

export default Settings;
