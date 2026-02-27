import { User, LogOut } from '@/components/ui/icons';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { orbCssVars } from '@/lib/colors';

export function UserProfile() {
  const { user, profile, signOut } = useAuth();

  if (!user) return null;

  const displayName = profile?.display_name || user.email?.split('@')[0] || 'User';
  const email = user.email || '';

  return (
    <div className="p-4 border border-border rounded-lg bg-card">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 acq-orb flex items-center justify-center" style={orbCssVars('#9ca3af') as any}>
          <User className="w-5 h-5 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{displayName}</p>
          <p className="text-xs text-muted-foreground truncate">{email}</p>
        </div>
      </div>
      <Button
        variant="destructive"
        size="sm"
        onClick={signOut}
        className="w-full mt-3 h-8 text-xs gap-2"
      >
        <LogOut className="w-3.5 h-3.5" />
        Sign out
      </Button>
    </div>
  );
}
