import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProfileAvatar } from '@/components/layout/AppSidebar';
import { Loader2 } from '@/components/ui/icons';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export default function Profile() {
  const { profile, updateProfile, signOut, user } = useAuth();
  const [name, setName] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [avatarMode, setAvatarMode] = useState<'photo' | 'letter'>('photo');
  const [avatarColor, setAvatarColor] = useState('#2A2A2A');

  useEffect(() => {
    if (profile) {
      setName(profile.full_name || profile.display_name || '');
      setAvatarMode((profile.avatar_mode as 'photo' | 'letter' | null) || 'photo');
      setAvatarColor(profile.avatar_color || '#2A2A2A');
    }
  }, [profile]);

  const handleSaveProfile = useCallback(async () => {
    setProfileLoading(true);
    const updates: any = {};

    const currentName = String(profile?.full_name || profile?.display_name || '').trim();
    const nextName = String(name || '').trim();

    if (currentName !== nextName) {
      updates.display_name = nextName || null;
      updates.full_name = nextName || null;
    }
    if (((profile?.avatar_mode as any) || 'photo') !== avatarMode) updates.avatar_mode = avatarMode;
    if ((profile?.avatar_color || '#2A2A2A') !== avatarColor) updates.avatar_color = avatarColor;

    if (Object.keys(updates).length === 0) {
      setProfileLoading(false);
      toast.success('Profile updated');
      return;
    }

    const { error } = await updateProfile(updates);
    setProfileLoading(false);

    if (error) {
      const message = String((error as any)?.message || 'Failed to update profile');
      toast.error(message);
      return;
    }

    toast.success('Profile updated');
  }, [profile, name, avatarMode, avatarColor, updateProfile]);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div>
          <div className="headline-domaine text-3xl font-semibold text-white">Profile</div>
          <p className="text-sm text-white/45 mt-1">Update your personal info.</p>
        </div>

        <div className="mt-8 max-w-[760px]">
          <div className="rounded-2xl border border-white/10 bg-black p-6">
            <div className="text-lg font-semibold text-white">Profile</div>
            <div className="mt-1 text-sm text-white/45">Update your personal info.</div>

            <div className="mt-6 space-y-5">
              <div>
                <div className="text-sm text-white/60">Avatar</div>
                <div className="mt-3 flex items-center gap-4">
                  <ProfileAvatar
                    name={name || 'User'}
                    size="md"
                    bgColor={avatarColor}
                    imageUrl={profile?.avatar_url || (user?.user_metadata?.avatar_url as string | undefined)}
                    mode={avatarMode}
                  />
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className={cn(
                          'h-9 px-3 rounded-xl border text-[13px] transition-colors',
                          avatarMode === 'photo'
                            ? 'border-white/20 bg-white/[0.06] text-white'
                            : 'border-white/10 text-white/70 hover:text-white hover:bg-white/[0.03]',
                        )}
                        onClick={() => setAvatarMode('photo')}
                      >
                        Photo
                      </button>
                      <button
                        type="button"
                        className={cn(
                          'h-9 px-3 rounded-xl border text-[13px] transition-colors',
                          avatarMode === 'letter'
                            ? 'border-white/20 bg-white/[0.06] text-white'
                            : 'border-white/10 text-white/70 hover:text-white hover:bg-white/[0.03]',
                        )}
                        onClick={() => setAvatarMode('letter')}
                      >
                        Letter
                      </button>
                    </div>

                    {avatarMode === 'letter' ? (
                      <div className="flex items-center gap-2">
                        <div className="text-xs text-white/45">Color</div>
                        <input
                          type="color"
                          value={avatarColor}
                          onChange={(e) => setAvatarColor(e.target.value)}
                          className="h-8 w-12 rounded-lg border border-white/10 bg-transparent"
                        />
                        <input
                          value={avatarColor}
                          onChange={(e) => setAvatarColor(e.target.value)}
                          className="h-8 w-28 rounded-lg border border-white/10 bg-transparent px-2 text-xs text-white/75"
                        />
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <div className="text-sm text-white/60">Name</div>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="mt-2 h-10 w-full rounded-2xl border border-white/10 bg-transparent px-3 text-sm text-white/80 placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/10"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="h-8 px-3.5 rounded-xl bg-white text-black text-[13px] font-semibold hover:bg-white/90 disabled:opacity-60"
                  disabled={profileLoading}
                  onClick={handleSaveProfile}
                >
                  {profileLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving…
                    </span>
                  ) : (
                    'Save changes'
                  )}
                </button>

                <button
                  type="button"
                  className="h-10 px-4 rounded-2xl border border-white/10 text-sm text-white/60 hover:text-white hover:bg-white/[0.03]"
                  onClick={() => signOut()}
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
