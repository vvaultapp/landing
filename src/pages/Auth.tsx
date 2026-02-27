import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { ArrowRight } from '@/components/ui/icons';

export default function Auth() {
  const [googleLoading, setGoogleLoading] = useState(false);
  const { user, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (!user) return;
    // Route via Index so setters land in /messages and owners in /dashboard.
    navigate('/', { replace: true });
  }, [user, navigate]);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      // Main auth entrypoint is owner intent. Setter/client flows use their dedicated portal logins.
      sessionStorage.setItem('acq_signin_intent', 'owner');
    } catch {
      // ignore storage errors
    }
    const { error } = await signInWithGoogle();
    if (error) {
      toast.error('Failed to sign in with Google');
    }
    setGoogleLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Week Analytics style card */}
        <div 
          className="relative rounded-2xl p-8 overflow-hidden"
          style={{ background: '#0e0e0e' }}
        >
          {/* Fading border effect */}
          <div 
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              background: `linear-gradient(155deg, 
                rgba(255, 255, 255, 0.16) 0%, 
                rgba(255, 255, 255, 0.10) 20%, 
                rgba(255, 255, 255, 0.06) 40%, 
                rgba(255, 255, 255, 0.035) 60%,
                rgba(255, 255, 255, 0.02) 80%,
                rgba(255, 255, 255, 0.008) 95%,
                transparent 100%
              )`,
              padding: '1px',
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude'
            }}
          />
          
          {/* Inner glow fill from top-left corner */}
          <div 
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              background: `linear-gradient(155deg, 
                rgba(255, 255, 255, 0.035) 0%, 
                rgba(255, 255, 255, 0.012) 35%, 
                transparent 65%
              )`
            }}
          />

          {/* Content */}
          <div className="relative z-10 flex flex-col gap-6">
            {/* Title */}
            <h1 
              className="leading-tight text-white"
              style={{
                fontWeight: 400,
                fontSize: '2rem',
                letterSpacing: '0.005em',
                textShadow: '0 2px 4px rgba(0,0,0,0.65)'
              }}
            >
              Welcome<br />back
            </h1>

            {/* Continue with Google - Primary button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="group flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-300 w-full bg-white/5 border border-border hover:bg-white hover:border-border disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 500
              }}
            >
              <svg className="w-5 h-5 text-white/70 group-hover:text-black transition-colors duration-300" viewBox="0 0 24 24">
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
              <span className="text-white/70 group-hover:text-black transition-colors duration-300">
                {googleLoading ? 'Connecting...' : 'Continue with Google'}
              </span>
              <ArrowRight className="w-4 h-4 text-white/50 group-hover:text-black group-hover:translate-x-0.5 transition-all duration-300" strokeWidth={2} />
            </button>

            {/* Separator */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-[0.5px] bg-white/10" />
              <span className="text-xs text-white/30">or</span>
              <div className="flex-1 h-[0.5px] bg-white/10" />
            </div>

            {/* Portal Access - Secondary buttons */}
            <div className="flex flex-col gap-2">
              <Link
                to="/portal/login"
                className="group flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all duration-300 w-full border border-border hover:border-border hover:bg-white/5"
              >
                <span
                  className="text-white/40 group-hover:text-white/60 transition-colors duration-300"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 400,
                  }}
                >
                  Client Portal
                </span>
              </Link>
              <Link
                to="/setter-portal/login"
                className="group flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all duration-300 w-full border border-border hover:border-border hover:bg-white/5"
              >
                <span 
                  className="text-white/40 group-hover:text-white/60 transition-colors duration-300"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 400
                  }}
                >
                  Setter Portal
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
