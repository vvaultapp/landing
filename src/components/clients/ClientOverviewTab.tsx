import { useEffect, useMemo, useState } from 'react';
import { Client } from '@/types/client-portal';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Save } from '@/components/ui/icons';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ClientOverviewTabProps {
  client: Client;
  onUpdate: (updates: Partial<Client>) => Promise<{ error: Error | null }>;
}

const toFormData = (client: Client) => ({
  name: client.name,
  email: client.email || '',
  phone: client.phone || '',
  instagramHandle: client.instagramHandle || '',
  subscriptionStatus: client.subscriptionStatus,
  accessUntil: client.accessUntil,
});

export function ClientOverviewTab({ client, onUpdate }: ClientOverviewTabProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(toFormData(client));

  useEffect(() => {
    setFormData(toFormData(client));
  }, [
    client.name,
    client.email,
    client.phone,
    client.instagramHandle,
    client.subscriptionStatus,
    client.accessUntil,
  ]);

  const isDirty = useMemo(() => {
    const sameAccess =
      (formData.accessUntil?.getTime() || 0) === (client.accessUntil?.getTime() || 0);
    return !(
      formData.name === client.name &&
      formData.email === (client.email || '') &&
      formData.phone === (client.phone || '') &&
      formData.instagramHandle === (client.instagramHandle || '') &&
      formData.subscriptionStatus === client.subscriptionStatus &&
      sameAccess
    );
  }, [
    formData.name,
    formData.email,
    formData.phone,
    formData.instagramHandle,
    formData.subscriptionStatus,
    formData.accessUntil,
    client.name,
    client.email,
    client.phone,
    client.instagramHandle,
    client.subscriptionStatus,
    client.accessUntil,
  ]);

  const handleSave = async () => {
    if (!isDirty) return;
    setIsSaving(true);
    const { error } = await onUpdate({
      name: formData.name,
      email: formData.email || null,
      phone: formData.phone || null,
      instagramHandle: formData.instagramHandle || null,
      subscriptionStatus: formData.subscriptionStatus,
      accessUntil: formData.accessUntil,
    });

    if (error) {
      toast.error('Failed to save changes');
    } else {
      toast.success('Changes saved');
    }
    setIsSaving(false);
  };

  const isActive = formData.subscriptionStatus === 'active';

  return (
    <div className="max-w-2xl space-y-8">
      {/* Contact Info */}
      <div className="border border-border rounded-3xl p-6 space-y-4">
        <h3 className="text-lg font-semibold">Contact Information</h3>
        
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full h-10 px-4 bg-black border border-border rounded-2xl text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-border transition-colors"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full h-10 px-4 bg-black border border-border rounded-2xl text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-border transition-colors"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full h-10 px-4 bg-black border border-border rounded-2xl text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-border transition-colors"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instagram">Instagram Handle</Label>
            <input
              id="instagram"
              value={formData.instagramHandle}
              onChange={(e) => setFormData({ ...formData, instagramHandle: e.target.value })}
              placeholder="@username"
              className="w-full h-10 px-4 bg-black border border-border rounded-2xl text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-border transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Subscription Status */}
      <div className="border border-border rounded-3xl p-6 space-y-4">
        <h3 className="text-lg font-semibold">Subscription & Access</h3>
        
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="font-medium">Subscription Status</p>
            <p className="text-sm text-muted-foreground">
              {isActive ? 'Client has full access to the portal' : 'Client access is paused'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={cn('text-sm', isActive ? 'text-success' : 'text-muted-foreground')}>
              {isActive ? 'Active' : 'Paused'}
            </span>
            <Switch
              checked={isActive}
              onCheckedChange={(checked) =>
                setFormData({
                  ...formData,
                  subscriptionStatus: checked ? 'active' : 'paused',
                })
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Access Until (optional)</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full h-10 justify-start text-left font-normal bg-black border-border hover:bg-black rounded-2xl',
                  !formData.accessUntil && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.accessUntil
                  ? format(formData.accessUntil, 'PPP')
                  : 'No expiry date set'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-[#0a0a0a] border-border rounded-2xl" align="start">
              <Calendar
                mode="single"
                selected={formData.accessUntil || undefined}
                onSelect={(date) => setFormData({ ...formData, accessUntil: date || null })}
                initialFocus
              />
              {formData.accessUntil && (
                <div className="p-2 border-t-[0.5px] border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full rounded-xl"
                    onClick={() => setFormData({ ...formData, accessUntil: null })}
                  >
                    Clear date
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
          <p className="text-xs text-muted-foreground">
            If set, access will be revoked after this date (used for payment integration)
          </p>
        </div>
      </div>

      {/* Save Button */}
      <Button
        onClick={handleSave}
        disabled={isSaving || !isDirty}
        className={cn(
          'font-semibold border shadow-none rounded-xl',
          isDirty
            ? 'bg-white text-black hover:bg-white/90 border-transparent'
            : 'bg-black text-white/45 border-border hover:bg-black cursor-not-allowed'
        )}
      >
        <Save className="w-4 h-4 mr-2" />
        {isSaving ? 'Saving...' : 'Save Changes'}
      </Button>
    </div>
  );
}
