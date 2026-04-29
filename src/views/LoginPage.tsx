import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, handleAuthError } from '../lib/firebase';
import { Building2 } from 'lucide-react';

export default function LoginPage() {
  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      const message = handleAuthError(error);
      alert(message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to CRM</h1>
          <p className="text-gray-600">Sign in to manage your customer relationships</p>
        </div>

        {/* Google Sign In Button */}
        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 rounded-lg px-6 py-3 text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Sign in with Google
        </button>

        {/* Features */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center mb-4">What you can do:</p>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center gap-2">
              <span className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs">✓</span>
              Manage leads and contacts
            </li>
            <li className="flex items-center gap-2">
              <span className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs">✓</span>
              Track deals and pipeline
            </li>
            <li className="flex items-center gap-2">
              <span className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs">✓</span>
              Organize tasks and activities
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
