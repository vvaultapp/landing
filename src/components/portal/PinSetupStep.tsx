import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Lock, AlertTriangle, ArrowRight, Check } from '@/components/ui/icons';

interface PinSetupStepProps {
  onComplete: (pin: string) => Promise<void>;
  isSubmitting: boolean;
}

export function PinSetupStep({ onComplete, isSubmitting }: PinSetupStepProps) {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'create' | 'confirm'>('create');
  const [error, setError] = useState('');

  const handleContinue = () => {
    if (pin.length !== 4) {
      setError('Please enter a 4-digit PIN');
      return;
    }
    setError('');
    setStep('confirm');
  };

  const handleConfirm = async () => {
    if (confirmPin !== pin) {
      setError('PINs do not match. Please try again.');
      setConfirmPin('');
      return;
    }
    setError('');
    await onComplete(pin);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-2xl font-medium mb-2">
          {step === 'create' ? 'Create Your Access PIN' : 'Confirm Your PIN'}
        </h1>
        <p className="text-muted-foreground text-sm">
          {step === 'create' 
            ? 'Choose a 4-digit PIN to access your portal' 
            : 'Enter your PIN again to confirm'}
        </p>
      </div>

      <Alert className="border-amber-500/50 bg-amber-500/10">
        <AlertTriangle className="h-4 w-4 text-amber-500" />
        <AlertDescription className="text-amber-200 text-sm">
          <strong>Important:</strong> Save this PIN somewhere safe (notes app, password manager). 
          You'll need it to log back in.
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <Label className="text-center block">
          {step === 'create' ? 'Enter your PIN' : 'Re-enter your PIN'}
        </Label>
        <div className="flex justify-center">
          <InputOTP
            maxLength={4}
            value={step === 'create' ? pin : confirmPin}
            onChange={(value) => {
              if (step === 'create') {
                setPin(value);
              } else {
                setConfirmPin(value);
              }
              setError('');
            }}
          >
            <InputOTPGroup className="gap-3">
              <InputOTPSlot index={0} className="w-14 h-16 text-2xl border-border" />
              <InputOTPSlot index={1} className="w-14 h-16 text-2xl border-border" />
              <InputOTPSlot index={2} className="w-14 h-16 text-2xl border-border" />
              <InputOTPSlot index={3} className="w-14 h-16 text-2xl border-border" />
            </InputOTPGroup>
          </InputOTP>
        </div>
      </div>

      {error && (
        <p className="text-red-400 text-sm text-center">{error}</p>
      )}

      <div className="flex gap-3">
        {step === 'confirm' && (
          <Button
            variant="outline"
            onClick={() => {
              setStep('create');
              setConfirmPin('');
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
            disabled={pin.length !== 4}
            className="flex-1 bg-white text-black hover:bg-white/90 font-medium rounded-xl"
          >
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleConfirm}
            disabled={confirmPin.length !== 4 || isSubmitting}
            className="flex-1 bg-white text-black hover:bg-white/90 font-medium rounded-xl"
          >
            {isSubmitting ? 'Setting up...' : 'Confirm PIN'}
            <Check className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
