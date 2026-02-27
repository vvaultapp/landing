import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePortalAuth } from '@/hooks/usePortalAuth';
import { Button } from '@/components/ui/button';
import { CheckCircle } from '@/components/ui/icons';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SecureCodeSetupStep } from '@/components/portal/SecureCodeSetupStep';
import { warnSetterCodesSchemaMismatchOnce } from '@/lib/setterCodesCompat';

// Simple hash function matching the edge function
async function hashCode(code: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(code);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function SetterOnboarding() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { portalRole, workspaceId, loading } = usePortalAuth();

  const [step, setStep] = useState(0);
  const [codeCompleted, setCodeCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkingCode, setCheckingCode] = useState(true);

  useEffect(() => {
    if (authLoading || loading) return;

    if (!user) {
      navigate('/auth');
      return;
    }

    if (portalRole !== 'setter') {
      if (portalRole === 'client') {
        navigate('/portal');
      } else {
        navigate('/dashboard');
      }
      return;
    }
  }, [user, authLoading, loading, portalRole, navigate]);

  // Check if code already exists for this setter
  useEffect(() => {
    if (user?.id && workspaceId) {
      checkExistingCode();
    }
  }, [user?.id, workspaceId]);

  const checkExistingCode = async () => {
    if (!user || !workspaceId) return;
    
    setCheckingCode(true);
    try {
      const { data, error } = await supabase
        .from('setter_codes')
        .select('id')
        .eq('user_id', user.id)
        .eq('workspace_id', workspaceId)
        .maybeSingle();

      if (warnSetterCodesSchemaMismatchOnce('check-existing', error)) {
        return;
      }

      if (!error && data) {
        // Code already exists, go to portal
        navigate('/setter-portal/messages');
      }
    } catch (err) {
      console.error('Error checking code:', err);
    } finally {
      setCheckingCode(false);
    }
  };

  const handleCodeComplete = async (code: string) => {
    if (!user || !workspaceId) return;

    setIsSubmitting(true);
    try {
      const hashedCode = await hashCode(code);
      
      // Check if code is already in use (extremely rare but possible)
      const { data: existingCode, error: checkError } = await supabase
        .from('setter_codes')
        .select('id')
        .eq('code_hash', hashedCode)
        .maybeSingle();

      if (checkError) {
        if (warnSetterCodesSchemaMismatchOnce('check-uniqueness', checkError)) {
          toast.error('Secure code checks are temporarily unavailable. Please retry in a moment.');
          setIsSubmitting(false);
          return;
        }
        console.error('Error checking code uniqueness:', checkError);
      }

      // Also check client_pins for uniqueness
      const { data: existingClientPin } = await supabase
        .from('client_pins')
        .select('id')
        .eq('pin_hash', hashedCode)
        .maybeSingle();

      if (existingCode || existingClientPin) {
        toast.error('This code is already in use. Please choose a different code.');
        setIsSubmitting(false);
        return;
      }
      
      const { error } = await supabase
        .from('setter_codes')
        .upsert({
          user_id: user.id,
          workspace_id: workspaceId,
          code_hash: hashedCode,
          email: user.email || '',
        }, {
          onConflict: 'user_id,workspace_id',
        });

      if (error) {
        console.error('Error saving code:', error);
        toast.error('Failed to save code. Please try again.');
        return;
      }

      toast.success('Secure code saved! Remember to save it somewhere safe.');
      setCodeCompleted(true);
      setStep(1);
    } catch (err) {
      console.error('Code setup error:', err);
      toast.error('Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = () => {
    navigate('/setter-portal/messages');
  };

  if (authLoading || loading || checkingCode) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="flex gap-1 mb-8">
            <Skeleton className="h-1 flex-1 rounded-full bg-white/[0.10]" />
            <Skeleton className="h-1 flex-1 rounded-full bg-white/[0.06]" />
          </div>

          <div className="space-y-4 text-center">
            <Skeleton className="h-7 w-56 rounded-2xl bg-white/10 mx-auto" />
            <Skeleton className="h-4 w-80 rounded-xl bg-white/[0.06] mx-auto" />

            <div className="mt-6 space-y-3 text-left">
              <Skeleton className="h-4 w-24 rounded-xl bg-white/[0.06]" />
              <Skeleton className="h-12 w-full rounded-2xl bg-white/[0.06]" />
              <Skeleton className="h-4 w-28 rounded-xl bg-white/[0.06] mt-4" />
              <Skeleton className="h-12 w-full rounded-2xl bg-white/[0.06]" />
            </div>

            <div className="pt-4 flex justify-end">
              <Skeleton className="h-11 w-36 rounded-2xl bg-white/10" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Progress */}
        <div className="flex gap-1 mb-8">
          {[0, 1].map((i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= step ? 'bg-blue-500' : 'bg-border'
              }`}
            />
          ))}
        </div>

        {/* Code Setup Step */}
        {step === 0 && !codeCompleted && (
          <SecureCodeSetupStep 
            onComplete={handleCodeComplete} 
            isSubmitting={isSubmitting}
            role="setter"
          />
        )}

        {/* Welcome Step */}
        {step === 1 && (
          <div className="space-y-6 text-center">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            
            <div>
              <h1 className="text-2xl font-medium mb-2">You're all set!</h1>
              <p className="text-muted-foreground">
                Your secure code has been saved. You can now access your Appointment Setter portal.
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 text-left">
              <p className="text-sm font-medium mb-2">What you can do:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• View and respond to Instagram DMs</li>
                <li>• Filter and qualify leads</li>
                <li>• Complete assigned tasks</li>
              </ul>
            </div>

            <Button
              onClick={handleComplete}
              className="w-full bg-blue-500 text-white hover:bg-blue-600 font-medium rounded-xl"
            >
              Go to Portal
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
