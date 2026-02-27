export type WorkspaceRole = "owner" | "setter";

export interface Workspace {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
  displayName: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invite {
  id: string;
  workspaceId: string;
  email: string;
  role: WorkspaceRole;
  token: string;
  invitedBy: string;
  expiresAt: Date;
  acceptedAt: Date | null;
  createdAt: Date;
}

export interface OnboardingResponse {
  id: string;
  workspaceId: string;
  businessName: string | null;
  hasTeam: boolean;
  revenueRange: string | null;
  kpiFilePath: string | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  displayName: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  emailVerified: boolean;
  currentWorkspaceId: string | null;
  onboardingCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface InviteDetails {
  email: string;
  role: WorkspaceRole;
  workspaceId: string;
  workspaceName: string;
}
