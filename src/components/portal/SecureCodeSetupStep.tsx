import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, AlertTriangle, ArrowRight, Check, Eye, EyeOff } from '@/components/ui/icons';

interface SecureCodeSetupStepProps {
  onComplete: (code: string) => Promise<void>;
  isSubmitting: boolean;
  role: 'client' | 'setter';
}

// Validation: 7+ chars, uppercase, lowercase, number, symbol
function validateCode(code: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (code.length < 7) {
    errors.push('At least 7 characters');
  }
  if (!/[A-Z]/.test(code)) {
    errors.push('One uppercase letter');
  }
  if (!/[a-z]/.test(code)) {
    errors.push('One lowercase letter');
  }
  if (!/[0-9]/.test(code)) {
    errors.push('One number');
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(code)) {
    errors.push('One symbol (!@#$%^&*...)');
  }
  
  return { valid: errors.length === 0, errors };
}

export function SecureCodeSetupStep({ onComplete, isSubmitting, role }: SecureCodeSetupStepProps) {
  const [code, setCode] = useState('');
  const [confirmCode, setConfirmCode] = useState('');
  const [step, setStep] = useState<'create' | 'confirm'>('create');
  const [error, setError] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [showConfirmCode, setShowConfirmCode] = useState(false);

  const validation = validateCode(code);
  const roleLabel = role === 'client' ? 'Client' : 'Appointment Setter';

  const handleContinue = () => {
    if (!validation.valid) {
      setError('Please meet all requirements');
      return;
    }
    setError('');
    setStep('confirm');
  };

  const handleConfirm = async () => {
    if (confirmCode !== code) {
      setError('Codes do not match. Please try again.');
      setConfirmCode('');
      return;
    }
    setError('');
    await onComplete(code);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-2xl font-medium mb-2">
          {step === 'create' ? 'Create Your Secure Code' : 'Confirm Your Code'}
        </h1>
        <p className="text-muted-foreground text-sm">
          {step === 'create' 
            ? `Choose a secure code to access your ${roleLabel.toLowerCase()} portal` 
            : 'Enter your code again to confirm'}
        </p>
      </div>

      <Alert className="border-amber-500/50 bg-amber-500/10">
        <AlertTriangle className="h-4 w-4 text-amber-500" />
        <AlertDescription className="text-amber-200 text-sm">
          <strong>Important:</strong> Save this code somewhere safe (notes app, password manager). 
          You'll need it to log back in.
        </AlertDescription>
      </Alert>

      {step === 'create' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="code">Your Secure Code</Label>
            <div className="relative">
              <Input
                id="code"
                type={showCode ? 'text' : 'password'}
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setError('');
                }}
                placeholder="Enter your secure code"
                className="bg-transparent border-border pr-10"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowCode(!showCode)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Requirements checklist */}
          <div className="space-y-1 text-sm">
            <p className="text-muted-foreground mb-2">Requirements:</p>
            <div className="grid grid-cols-2 gap-1">
              <RequirementItem met={code.length >= 7} label="7+ characters" />
              <RequirementItem met={/[A-Z]/.test(code)} label="Uppercase letter" />
              <RequirementItem met={/[a-z]/.test(code)} label="Lowercase letter" />
              <RequirementItem met={/[0-9]/.test(code)} label="Number" />
              <RequirementItem met={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(code)} label="Symbol" />
            </div>
          </div>
        </>
      )}

      {step === 'confirm' && (
        <div className="space-y-2">
          <Label htmlFor="confirmCode">Re-enter Your Code</Label>
          <div className="relative">
            <Input
              id="confirmCode"
              type={showConfirmCode ? 'text' : 'password'}
              value={confirmCode}
              onChange={(e) => {
                setConfirmCode(e.target.value);
                setError('');
              }}
              placeholder="Re-enter your secure code"
              className="bg-transparent border-border pr-10"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmCode(!showConfirmCode)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showConfirmCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="text-red-400 text-sm text-center">{error}</p>
      )}

      <div className="flex gap-3">
        {step === 'confirm' && (
          <Button
            variant="outline"
            onClick={() => {
              setStep('create');
              setConfirmCode('');
              setError('');
            }}
            className="flex-1 rounded-xl"
          >
            Back
          </Button>
        )}
        
        {step === 'create' ? (
          <Button
            onClick={handleContinue}
            disabled={!validation.valid}
            className="flex-1 bg-white text-black hover:bg-white/90 font-medium rounded-xl"
          >
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleConfirm}
            disabled={confirmCode.length < 7 || isSubmitting}
            className="flex-1 bg-white text-black hover:bg-white/90 font-medium rounded-xl"
          >
            {isSubmitting ? 'Setting up...' : 'Confirm Code'}
            <Check className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}

function RequirementItem({ met, label }: { met: boolean; label: string }) {
  return (
    <div className={`flex items-center gap-2 ${met ? 'text-green-400' : 'text-muted-foreground'}`}>
      {met ? (
        <Check className="w-3 h-3" />
      ) : (
        <div className="w-3 h-3 rounded-full border border-current" />
      )}
      <span>{label}</span>
    </div>
  );
}
