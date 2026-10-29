import React, { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { LogOut, Mail, CheckCircle2, ChevronDown } from 'lucide-react';
import {
  signInWithGoogle,
  signOutGoogle,
  subscribeToAuthChanges,
  hasActiveGoogleToken,
} from '../../services/googleAuth';

interface GoogleSignInButtonProps {
  onAuthSuccess?: (user: FirebaseUser) => void;
  className?: string;
  compact?: boolean;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onAuthSuccess,
  className = '',
  compact = false,
}) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((user) => {
      setCurrentUser(user);
      if (user && onAuthSuccess) {
        onAuthSuccess(user);
      }
    });
    return () => unsubscribe();
  }, [onAuthSuccess]);

  const handleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { user } = await signInWithGoogle();
      setCurrentUser(user);
      if (onAuthSuccess) {
        onAuthSuccess(user);
      }
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      // Friendly message
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in cancelled');
      } else {
        setError(err.message || 'Failed to authenticate with Google');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOutGoogle();
      setMenuOpen(false);
    } catch (err: any) {
      console.error('Sign Out Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // If user is authenticated
  if (currentUser) {
    const hasToken = hasActiveGoogleToken();

    return (
      <div className={`relative inline-block ${className}`}>
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-medium border border-slate-700 shadow-sm transition cursor-pointer"
          title={`Connected: ${currentUser.email}`}
        >
          {currentUser.photoURL ? (
            <img
              src={currentUser.photoURL}
              alt={currentUser.displayName || 'Google User'}
              className="w-5 h-5 rounded-full border border-amber-400"
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-amber-500 text-slate-900 font-bold flex items-center justify-center text-[10px]">
              {(currentUser.email || 'G')[0].toUpperCase()}
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <span className="max-w-[120px] sm:max-w-[160px] truncate">
              {currentUser.displayName || currentUser.email}
            </span>
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                hasToken ? 'bg-emerald-400 ring-2 ring-emerald-400/20' : 'bg-amber-400'
              }`}
              title={hasToken ? 'Gmail API Active' : 'Token expired, click to refresh'}
            />
          </div>

          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-50 p-3 text-xs text-slate-200">
            <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-800">
              {currentUser.photoURL && (
                <img
                  src={currentUser.photoURL}
                  alt=""
                  className="w-8 h-8 rounded-full border border-slate-700"
                />
              )}
              <div className="truncate">
                <div className="font-semibold text-white truncate">
                  {currentUser.displayName || 'Google User'}
                </div>
                <div className="text-[11px] text-slate-400 truncate">{currentUser.email}</div>
              </div>
            </div>

            <div className="py-2.5 space-y-1.5 text-[11px] text-slate-300">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Gmail dispatch enabled</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <span>efrickenhub@gmail.com</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={handleSignIn}
                className="text-[11px] text-amber-400 hover:text-amber-300 font-medium cursor-pointer"
              >
                Switch Account
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={isLoading}
                className="inline-flex items-center gap-1 text-[11px] text-red-400 hover:text-red-300 font-medium cursor-pointer"
              >
                <LogOut className="w-3 h-3" />
                Disconnect
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Official Google Sign-In Button Styling
  return (
    <div className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={handleSignIn}
        disabled={isLoading}
        className={`inline-flex items-center gap-2.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-lg border border-slate-300 shadow-sm transition active:scale-[0.98] cursor-pointer ${
          compact ? 'text-xs' : 'text-xs sm:text-sm'
        } ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
        aria-label="Sign in with Google"
      >
        {/* Official Google G Logo SVG */}
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z"
          />
          <path
            fill="#FBBC05"
            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
          />
        </svg>

        <span>{isLoading ? 'Connecting...' : 'Sign in with Google'}</span>
      </button>

      {error && (
        <div className="absolute top-full left-0 mt-1 text-[11px] text-red-500 whitespace-nowrap bg-red-50 border border-red-200 rounded px-2 py-0.5">
          {error}
        </div>
      )}
    </div>
  );
};
