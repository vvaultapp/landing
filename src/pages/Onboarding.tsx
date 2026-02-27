import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { PremiumButton } from '@/components/ui/premium-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { User, Users, ArrowLeft } from '@/components/ui/icons';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import acqLogo from '@/assets/ACQ_new_logo.png';

const revenueLabels = ['$0 (audience only)', '$10k', '$50k', '$100k', '$250k', '$500k', '$1M+'];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading, updateProfile, refreshProfile, signOut } = useAuth();
  
  const [step, setStep] = useState(1);
  const [businessName, setBusinessName] = useState('');
  const [hasTeam, setHasTeam] = useState<boolean | null>(null);
  const [revenueIndex, setRevenueIndex] = useState(3);
  const [inviteEmail, setInviteEmail] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Store workspace ID locally to avoid context refresh issues
  const workspaceIdRef = useRef<string | null>(null);

  // On mount, check if user already has a workspace (resuming onboarding)
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
    // Onboarding removed: always go to dashboard
    if (!authLoading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [authLoading, user, navigate]);

  const handleBack = async () => {
    if (step === 1) {
      // Sign out and go back to login
      await signOut();
      navigate('/auth');
    } else {
      setStep((s) => s - 1);
    }
  };

  const handleNext = async () => {
    setLoading(true);
    
    try {
      if (step === 1) {
        // Get current session directly from Supabase
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !sessionData?.session) {
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
          
          if (refreshError || !refreshData?.session) {
            console.error('No valid session:', refreshError || 'Session is null');
            toast.error('Session expired. Please log in again.');
            navigate('/auth');
            setLoading(false);
            return;
          }
        }
        
        const currentUserId = sessionData?.session?.user?.id || (await supabase.auth.getUser()).data.user?.id;
        
        if (!currentUserId) {
          console.error('No user ID available');
          toast.error('Authentication error. Please log in again.');
          navigate('/auth');
          setLoading(false);
          return;
        }

        console.log('[Onboarding] Creating workspace via RPC for user:', currentUserId);

        // Use SECURITY DEFINER function to bypass RLS for initial workspace creation
        const { data: workspaceId, error: rpcError } = await supabase
          .rpc('create_workspace_for_user', {
            p_workspace_name: businessName.trim(),
            p_user_id: currentUserId
          });

        if (rpcError) {
          console.error('Error creating workspace via RPC:', rpcError);
          toast.error('Failed to create workspace. Please try again.');
          setLoading(false);
          return;
        }

        console.log('[Onboarding] Workspace created:', workspaceId);

        // Store workspace ID for subsequent steps
        workspaceIdRef.current = workspaceId;
        toast.success('Workspace created!');
      }

      if (step === 2 && workspaceIdRef.current) {
        const { error } = await supabase
          .from('onboarding_responses')
          .update({ has_team: hasTeam === true })
          .eq('workspace_id', workspaceIdRef.current);
        
        if (error) {
          console.error('Error saving team status:', error);
          toast.error('Failed to save. Please try again.');
          setLoading(false);
          return;
        }
      }

      if (step === 3 && workspaceIdRef.current) {
        const { error } = await supabase
          .from('onboarding_responses')
          .update({ revenue_range: revenueLabels[revenueIndex] })
          .eq('workspace_id', workspaceIdRef.current);
        
        if (error) {
          console.error('Error saving revenue range:', error);
          toast.error('Failed to save. Please try again.');
          setLoading(false);
          return;
        }
      }

      if (step === 5) {
        // Get workspace ID from ref or profile
        const wsId = workspaceIdRef.current || profile?.current_workspace_id;
        
        if (!wsId) {
          console.error('No workspace ID found for step 5');
          toast.error('Session error. Please start over.');
          navigate('/auth');
          setLoading(false);
          return;
        }
        
        // Mark onboarding as completed
        const { error: onboardingError } = await supabase
          .from('onboarding_responses')
          .update({ completed_at: new Date().toISOString() })
          .eq('workspace_id', wsId);
        
        if (onboardingError) {
          console.error('Error completing onboarding:', onboardingError);
          toast.error('Failed to complete setup. Please try again.');
          setLoading(false);
          return;
        }
        
        // Update profile - mark onboarding as completed
        const { error: profileError } = await updateProfile({ onboarding_completed: true });
        if (profileError) {
          console.error('Error updating profile:', profileError);
        }
        
        // Refresh profile to ensure context is updated
        await refreshProfile();
        
        toast.success('Setup complete! Welcome to ACQ Dashboard.');
        
        // Use replace to prevent back navigation to onboarding
        navigate('/dashboard', { replace: true });
        setLoading(false);
        return;
      }

      setStep((s) => s + 1);
    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail || !workspaceIdRef.current) return;
    setLoading(true);
    
    try {
      const currentUserId = (await supabase.auth.getUser()).data.user?.id;
      
      if (!currentUserId) {
        toast.error('Authentication error.');
        setLoading(false);
        return;
      }

      const token = crypto.randomUUID() + '-' + crypto.randomUUID();

      const { error } = await supabase
        .from('invites')
        .insert({
          workspace_id: workspaceIdRef.current,
          email: inviteEmail,
          role: 'setter',
          token,
          invited_by: currentUserId,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        });

      if (error) {
        console.error('Error sending invite:', error);
        toast.error('Failed to send invite.');
      } else {
        toast.success(`Invite sent to ${inviteEmail}`);
        setInviteEmail('');
      }
    } catch (error) {
      console.error('Invite error:', error);
      toast.error('Failed to send invite.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center relative">
          {/* Back Arrow */}
          <button
            type="button"
            onClick={handleBack}
            className="absolute left-0 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <img src={acqLogo} alt="ACQ" className="h-8 mx-auto mb-6" />
          <p className="text-sm text-muted-foreground">Step {step} of 5</p>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <h1 className="text-xl font-medium text-center">What's your business name?</h1>
            <div>
              <Label>Business Name</Label>
              <Input
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Acme Coaching"
                className="mt-1 h-12"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h1 className="text-xl font-medium text-center">Are you working in a team?</h1>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setHasTeam(false)}
                className={cn(
                  'p-6 border rounded-lg text-center transition-all cursor-pointer',
                  hasTeam === false ? 'border-border bg-card' : 'border-border hover:border-border'
                )}
              >
                <User className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-sans font-normal">I'm all alone</p>
              </button>
              <button
                type="button"
                onClick={() => setHasTeam(true)}
                className={cn(
                  'p-6 border rounded-lg text-center transition-all cursor-pointer',
                  hasTeam === true ? 'border-border bg-card' : 'border-border hover:border-border'
                )}
              >
                <Users className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-sans font-normal">I have setters</p>
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h1 className="text-xl font-medium text-center">How much are you earning roughly?</h1>
            <div className="space-y-4">
              <Slider
                value={[revenueIndex]}
                onValueChange={([v]) => setRevenueIndex(v)}
                max={6}
                step={1}
                className="py-4"
              />
              <p className="text-center text-lg font-medium">{revenueLabels[revenueIndex]}</p>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <h1 className="text-xl font-medium text-center">Upload KPI targets (optional)</h1>
            <div className="border border-dashed border-border rounded-lg p-8 text-center">
              <p className="text-muted-foreground text-sm">CSV or XLSX file</p>
              <p className="text-xs text-muted-foreground mt-2">You can skip this for now</p>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6">
            <h1 className="text-xl font-medium text-center">Invite appointment setters</h1>
            <div className="flex gap-2">
              <Input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="setter@example.com"
                className="h-12"
              />
              <Button onClick={handleInvite} disabled={loading || !inviteEmail}>
                Invite
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Or skip this and invite later from settings
            </p>
          </div>
        )}

        <PremiumButton 
          type="button"
          onClick={handleNext} 
          disabled={loading || (step === 1 && !businessName.trim()) || (step === 2 && hasTeam === null)} 
          className="w-full"
        >
          {loading ? 'Loading...' : step === 5 ? 'Complete Setup' : 'Continue'}
        </PremiumButton>
      </div>
    </div>
  );
}
