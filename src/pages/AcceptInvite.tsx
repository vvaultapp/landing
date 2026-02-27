import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Eye, EyeOff, Users } from '@/components/ui/icons';
import { setSetterRoleHint } from '@/lib/setterRoleHint';

interface InviteInfo {
  email: string;
  role: string;
  workspaceId: string;
  workspaceName: string;
  inviteType?: string;
  clientId?: string | null;
  isClientInvite?: boolean;
  clientName?: string;
}

export default function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, signUp, signIn, signOut } = useAuth();

  const [invite, setInvite] = useState<InviteInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [awaitingEmailConfirmation, setAwaitingEmailConfirmation] = useState(false);

  const [mode, setMode] = useState<'signup' | 'signin'>('signup');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [switchingAccount, setSwitchingAccount] = useState(false);

  const token = searchParams.get('token');
  const queryClientId = searchParams.get('clientId');
  const isClientInvite = invite ? Boolean(invite.isClientInvite || invite.clientId) : Boolean(queryClientId);
  const isClientInviteLink = Boolean(queryClientId);
  const signedInEmail = String(user?.email || '').trim().toLowerCase();
  const inviteEmail = String(invite?.email || '').trim().toLowerCase();
  const isSignedInWithDifferentEmail =
    Boolean(user && invite && signedInEmail && inviteEmail && signedInEmail !== inviteEmail);

  const backPath = isClientInvite ? '/portal/login' : '/auth';

  useEffect(() => {
    if (!token) {
      setError('Invalid invitation link');
      setLoading(false);
      return;
    }

    void supabase.functions
      .invoke('verify-token', {
        body: { token, type: 'invite', clientId: queryClientId || undefined },
      })
      .then(({ data, error: verifyError }) => {
        if (verifyError || !data?.success) {
          setError(verifyError?.message || data?.error || 'Invalid or expired invitation');
          return;
        }

        setInvite(data.invite);

        if (isClientInviteLink) {
          setMode('signup');
          const presetName = String(data.invite?.clientName || '').trim();
          if (presetName) {
            setFullName(presetName);
          }
        }
      })
      .finally(() => setLoading(false));
  }, [token, queryClientId, isClientInviteLink]);

  useEffect(() => {
    if (user && invite && token && !isSignedInWithDifferentEmail) {
      void acceptInvite(user.id);
    }
  }, [user, invite, token, isSignedInWithDifferentEmail]);

  useEffect(() => {
    if (!isSignedInWithDifferentEmail) return;
    let mounted = true;
    setSwitchingAccount(true);
    void signOut()
      .catch((err) => {
        console.error('Failed to sign out mismatched account on invite flow:', err);
      })
      .finally(() => {
        if (mounted) {
          setSwitchingAccount(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, [isSignedInWithDifferentEmail, signOut]);

  const displayClientName = useMemo(() => {
    if (!invite) return '';
    return String(invite.clientName || fullName || '').trim();
  }, [invite, fullName]);

  const acceptInvite = async (
    userId: string,
    opts?: { navigateOnSuccess?: boolean; fullName?: string }
  ) => {
    setSubmitting(true);

    const { data, error: acceptError } = await supabase.functions.invoke('accept-invite', {
      body: {
        token,
        userId,
        clientId: invite?.clientId || queryClientId || undefined,
        fullName: opts?.fullName,
      },
    });

    if (acceptError || !data?.success) {
      let detailed = acceptError?.message || data?.error || 'Failed to accept invitation';
      const typed = acceptError as { context?: Response; message?: string } | null;
      if (typed?.context) {
        try {
          const parsed = await typed.context.clone().json();
          const fromJson = String((parsed as { error?: string; message?: string })?.error || (parsed as { error?: string; message?: string })?.message || '').trim();
          if (fromJson) detailed = fromJson;
        } catch {
          // ignore parse failures
        }
      }
      toast.error(detailed);
      setError(detailed);
      setSubmitting(false);
      return;
    }

    toast.success(`Welcome to ${data.workspaceName}!`);

    const acceptedRole = String(data?.role || '').trim().toLowerCase();
    if (acceptedRole === 'setter') {
      try {
        sessionStorage.setItem('acq_signin_intent', 'setter');
      } catch {
        // ignore storage errors
      }
      setSetterRoleHint(userId);
    }

    const redirectTo =
      acceptedRole === 'setter'
        ? '/setter-portal/messages'
        : data.redirectTo || '/dashboard';
    if (opts?.navigateOnSuccess !== false) {
      navigate(redirectTo);
    }

    setSubmitting(false);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!invite) return;

    setSubmitting(true);

    if (mode === 'signup') {
      const fallbackName = invite.email.split('@')[0] || 'Client';
      const nameForSignup = isClientInvite
        ? (String(invite.clientName || '').trim() || fallbackName)
        : String(fullName || '').trim();

      if (!nameForSignup) {
        toast.error('Full name is required');
        setSubmitting(false);
        return;
      }

      const { error: signUpError, userId, needsEmailConfirmation } = await signUp(
        invite.email,
        password,
        nameForSignup
      );

      if (signUpError) {
        toast.error(signUpError.message);
        setSubmitting(false);
        return;
      }

      if (userId) {
        await acceptInvite(userId, {
          navigateOnSuccess: !needsEmailConfirmation,
          fullName: nameForSignup,
        });

        if (needsEmailConfirmation) {
          setAwaitingEmailConfirmation(true);
          toast.success('Confirm your signup via email to finish setup.', {
            action: {
              label: 'Open Gmail',
              onClick: () => window.open('https://www.gmail.com', '_blank', 'noopener,noreferrer'),
            },
          });
        }
      }

      return;
    }

    const { error: signInError } = await signIn(invite.email, password);
    if (signInError) {
      toast.error('Invalid password');
      setSubmitting(false);
      return;
    }

    // useEffect above handles accept-invite once user session is available
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (switchingAccount) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Switching to the invited account...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button variant="outline" onClick={() => navigate(backPath)}>
            Back to login
          </Button>
        </div>
      </div>
    );
  }

  if (user && invite && !isSignedInWithDifferentEmail) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Joining workspace...</p>
        </div>
      </div>
    );
  }

  if (awaitingEmailConfirmation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-6 text-center">
          <div>
            <h1 className="text-xl font-medium">Confirm your email</h1>
            <p className="text-sm text-muted-foreground mt-2">
              We sent a "Confirm your signup" email to <strong>{invite?.email}</strong>.
              <br />
              Click the link in that email, then come back here.
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <Button
              type="button"
              onClick={() => window.open('https://www.gmail.com', '_blank', 'noopener,noreferrer')}
            >
              Open Gmail
            </Button>
            <Button variant="outline" type="button" onClick={() => navigate(backPath)}>
              Back to login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-muted-foreground" />
          </div>

          <h1 className="text-xl font-medium">You've been invited</h1>
          <p className="text-sm text-muted-foreground mt-2">
            {isClientInvite ? (
              <>Join <strong>{invite?.workspaceName}</strong> as a client</>
            ) : (
              <>Join <strong>{invite?.workspaceName}</strong> as an Appointment Setter</>
            )}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={invite?.email || ''} disabled className="h-12 bg-muted" />
          </div>

          {mode === 'signup' && !isClientInvite && (
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Your name"
                required
                className="h-12"
              />
            </div>
          )}

          {mode === 'signup' && isClientInvite && (
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={displayClientName || invite?.email?.split('@')[0] || ''} disabled className="h-12 bg-muted" />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="password">{mode === 'signup' ? 'Create Password' : 'Password'}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
                className="h-12 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" disabled={submitting} className="w-full h-12">
            {submitting
              ? 'Joining...'
              : mode === 'signup'
              ? 'Create Account & Join'
              : 'Sign In & Join'}
          </Button>
        </form>

        {!isClientInvite && (
          <div className="text-center">
            {mode === 'signup' ? (
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Already have an account? <span className="text-foreground">Sign in</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Need an account? <span className="text-foreground">Sign up</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
