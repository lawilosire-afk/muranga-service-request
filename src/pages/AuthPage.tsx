import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import {
  Mail,
  Lock,
  User,
  Phone,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [isForgotPassword, setIsForgotPassword] = useState<boolean>(false);
  const [isResetPassword, setIsResetPassword] = useState<boolean>(
    window.location.hash.includes('type=recovery'),
  );
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [role, setRole] = useState<'citizen' | 'admin'>('citizen');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const clearMessages = () => {
    setError(null);
    setMessage(null);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearMessages();

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              phone,
              role,
            },
          },
        });

        if (error) throw error;

        setMessage('Registration successful! You are now logged in.');
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'An unexpected authentication error occurred.';

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearMessages();

    try {
      const redirectTo = `${window.location.origin}/`;

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (error) throw error;

      setMessage(
        'Password reset instructions have been sent to your email address.',
      );
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Unable to send password reset instructions.';

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearMessages();

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw error;

      setMessage('Your password has been updated successfully.');
      setPassword('');
      setConfirmPassword('');
      setIsResetPassword(false);

      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Unable to update your password.';

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const showLogin = () => {
    setIsLogin(true);
    setIsForgotPassword(false);
    setIsResetPassword(false);
    clearMessages();
  };

  if (isResetPassword) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <img
              src="/muranga-logo.png"
              alt="Murang'a County Logo"
              className="w-20 h-20 object-contain bg-white rounded-full p-1 shadow-lg border border-gray-100"
            />
          </div>

          <h2 className="mt-4 text-center text-3xl font-extrabold text-gray-900">
            Create New Password
          </h2>

          <p className="mt-1 text-center text-sm text-gray-600 font-medium">
            Enter your new password below
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border-t-4 border-county-green">
            {error && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 text-sm text-red-700 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {message && (
              <div className="mb-4 bg-green-50 border-l-4 border-county-green p-4 text-sm text-green-700 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <span>{message}</span>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleResetPassword}>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  New Password
                </label>

                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Lock className="w-5 h-5" />
                  </div>

                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-county-green focus:border-county-green sm:text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Confirm New Password
                </label>

                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Lock className="w-5 h-5" />
                  </div>

                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-county-green focus:border-county-green sm:text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-county-green hover:bg-county-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-county-green transition-colors disabled:opacity-50"
              >
                {loading ? 'Updating Password...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (isForgotPassword) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <img
              src="/muranga-logo.png"
              alt="Murang'a County Logo"
              className="w-20 h-20 object-contain bg-white rounded-full p-1 shadow-lg border border-gray-100"
            />
          </div>

          <h2 className="mt-4 text-center text-3xl font-extrabold text-gray-900">
            Forgot Password?
          </h2>

          <p className="mt-1 text-center text-sm text-gray-600 font-medium">
            Enter your email and we'll send you a password reset link.
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border-t-4 border-county-green">
            {error && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 text-sm text-red-700 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {message && (
              <div className="mb-4 bg-green-50 border-l-4 border-county-green p-4 text-sm text-green-700 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <span>{message}</span>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleForgotPassword}>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>

                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Mail className="w-5 h-5" />
                  </div>

                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-county-green focus:border-county-green sm:text-sm"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-county-green hover:bg-county-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-county-green transition-colors disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            <button
              type="button"
              onClick={showLogin}
              className="mt-6 w-full flex items-center justify-center gap-2 text-sm font-medium text-gray-600 hover:text-county-green"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <img
            src="/muranga-logo.png"
            alt="Murang'a County Logo"
            className="w-20 h-20 object-contain bg-white rounded-full p-1 shadow-lg border border-gray-100"
          />
        </div>

        <h2 className="mt-4 text-center text-3xl font-extrabold text-gray-900">
          Murang’a County
        </h2>

        <p className="mt-1 text-center text-sm text-gray-600 font-medium">
          Public Service Request & Tracking Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border-t-4 border-county-green">
          <div className="flex border-b border-gray-200 mb-6">
            <button
              type="button"
              className={`flex-1 pb-3 text-sm font-medium text-center ${
                isLogin
                  ? 'border-b-2 border-county-green text-county-green font-bold'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => {
                setIsLogin(true);
                clearMessages();
              }}
            >
              Sign In
            </button>

            <button
              type="button"
              className={`flex-1 pb-3 text-sm font-medium text-center ${
                !isLogin
                  ? 'border-b-2 border-county-green text-county-green font-bold'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => {
                setIsLogin(false);
                clearMessages();
              }}
            >
              Register Account
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 text-sm text-red-700 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="mb-4 bg-green-50 border-l-4 border-county-green p-4 text-sm text-green-700 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>{message}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleAuth}>
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>

                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <User className="w-5 h-5" />
                    </div>

                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-county-green focus:border-county-green sm:text-sm"
                      placeholder="John Kamau"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>

                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Phone className="w-5 h-5" />
                    </div>

                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-county-green focus:border-county-green sm:text-sm"
                      placeholder="0712345678"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Account Role
                  </label>

                  <select
                    value={role}
                    onChange={(e) =>
                      setRole(e.target.value as 'citizen' | 'admin')
                    }
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-county-green focus:border-county-green sm:text-sm"
                  >
                    <option value="citizen">Citizen</option>
                    <option value="admin">County Official / Admin</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email Address
              </label>

              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-5 h-5" />
                </div>

                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-county-green focus:border-county-green sm:text-sm"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>

              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-5 h-5" />
                </div>

                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-county-green focus:border-county-green sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {isLogin && (
              <div className="-mt-3 text-right">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(true);
                    clearMessages();
                  }}
                  className="text-sm font-medium text-county-green hover:text-county-dark"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-county-green hover:bg-county-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-county-green transition-colors disabled:opacity-50"
              >
                {loading
                  ? 'Processing...'
                  : isLogin
                    ? 'Sign In to Portal'
                    : 'Create Account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};