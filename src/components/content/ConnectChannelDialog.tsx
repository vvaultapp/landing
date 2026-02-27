import { useState } from 'react';
import { Youtube, Loader2 } from '@/components/ui/icons';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ConnectChannelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect: (channelInput: string) => Promise<any>;
}

export function ConnectChannelDialog({ open, onOpenChange, onConnect }: ConnectChannelDialogProps) {
  const [channelInput, setChannelInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    if (!channelInput.trim()) return;
    
    setIsLoading(true);
    const result = await onConnect(channelInput.trim());
    setIsLoading(false);
    
    if (result) {
      setChannelInput('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Youtube className="w-5 h-5 text-red-500" />
            Connect YouTube Channel
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Enter your YouTube channel URL, handle (@username), or channel ID.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="channel">Channel URL or Handle</Label>
            <Input
              id="channel"
              placeholder="@username or youtube.com/c/channelname"
              value={channelInput}
              onChange={(e) => setChannelInput(e.target.value)}
              className="input-fade-border bg-transparent"
              onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
            />
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p>Examples:</p>
            <ul className="list-disc list-inside space-y-0.5 text-muted-foreground/80">
              <li>@MrBeast</li>
              <li>https://youtube.com/@MrBeast</li>
              <li>https://youtube.com/channel/UC...</li>
              <li>UCX6OQ3DkcsbYNE6H8uQQuVA</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConnect}
            disabled={!channelInput.trim() || isLoading}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              'Connect Channel'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
