import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowLeft, Mail, Send } from '@/components/ui/icons';

export default function ClientForgotPin() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Please enter your email');
      return;
    }

    setIsLoading(true);

    try {
      // Call edge function to send new magic link
      const { data, error } = await supabase.functions.invoke('resend-client-magic-link', {
        body: { email: email.trim().toLowerCase() },
      });

      if (error) {
        console.error('Error:', error);
        toast.error('Failed to send link. Please try again.');
        setIsLoading(false);
        return;
      }

      if (!data.success) {
        // Don't reveal if email exists or not
        toast.success('If an account exists, we\'ve sent a new access link');
        setSent(true);
        return;
      }

      toast.success('Check your email for a new access link!');
      setSent(true);
    } catch (err) {
      console.error('Error:', err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-6 h-6 text-green-500" />
          </div>
          <h1 className="text-2xl font-medium mb-2">Check Your Email</h1>
          <p className="text-muted-foreground text-sm mb-8">
            If an account exists with that email, we've sent a new access link. Check your inbox (and spam folder).
          </p>
          <Link to="/portal/login">
            <Button variant="outline" className="rounded-xl">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-medium mb-2">Forgot Your PIN?</h1>
          <p className="text-muted-foreground text-sm">
            Enter your email and we'll send you a new access link
          </p>
        </div>

        <form onSubmit={handleRequest} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-transparent border-border"
              autoComplete="email"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading || !email.trim()}
            className="w-full bg-white text-black hover:bg-white/90 font-medium rounded-xl"
          >
            {isLoading ? 'Sending...' : 'Send Access Link'}
            <Send className="w-4 h-4 ml-2" />
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/portal/login" className="text-muted-foreground text-sm hover:text-foreground">
            <ArrowLeft className="w-4 h-4 inline mr-1" />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
