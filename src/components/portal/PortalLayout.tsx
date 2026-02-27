import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, FileText, CheckSquare, LogOut, User } from '@/components/ui/icons';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Client } from '@/types/client-portal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PortalLayoutProps {
  children: ReactNode;
  client: Client;
}

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick: () => void;
  disabled?: boolean;
}

function NavItem({ icon: Icon, label, active, onClick, disabled }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-all duration-200 text-sm',
        'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent',
        active && 'bg-sidebar-accent text-foreground',
        disabled && 'opacity-50 cursor-not-allowed hover:bg-transparent'
      )}
    >
      <Icon className="w-4 h-4 shrink-0" strokeWidth={2} />
      <span>{label}</span>
    </button>
  );
}

export function PortalLayout({ children, client }: PortalLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    navigate('/portal/login');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-screen w-56 bg-sidebar border-r-[0.5px] border-sidebar-border flex flex-col py-4 z-50">
        {/* Header */}
        <div className="px-3 mb-6">
          <div className="px-3 py-2">
            <p className="text-sm font-medium truncate">{client.businessName || client.name}</p>
            <p className="text-xs text-muted-foreground">Client Portal</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1">
          <NavItem
            icon={Calendar}
            label="Meetings"
            active={isActive('/portal/meetings')}
            onClick={() => navigate('/portal/meetings')}
          />
          <NavItem
            icon={CheckSquare}
            label="Tasks"
            active={isActive('/portal/tasks')}
            onClick={() => navigate('/portal/tasks')}
          />
          <NavItem
            icon={FileText}
            label="Drive"
            active={isActive('/portal/files')}
            onClick={() => navigate('/portal/files')}
          />
        </nav>

        {/* User Profile Section */}
        <div className="px-3 mt-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-all duration-200 hover:bg-sidebar-accent">
                <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <span className="text-sm text-muted-foreground truncate">{client.name}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="end" className="w-48 bg-popover">
              <DropdownMenuItem
                onClick={handleSignOut}
                className="text-red-400 focus:text-red-400 hover:bg-red-500/20 data-[highlighted]:bg-red-500/20 data-[highlighted]:text-red-200"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content */}
      <main className="ml-56 min-h-screen bg-background">
        {children}
      </main>
    </div>
  );
}
