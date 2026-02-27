// Client Portal Types

export type PortalRole = 'coach' | 'client' | 'setter';
export type SubscriptionStatus = 'active' | 'paused';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type MessageSenderType = 'coach' | 'client' | 'setter';
export type ClientPortalStatus = 'invitation_pending' | 'invite_expired' | 'onboarding_pending' | 'active';

export interface Client {
  id: string;
  workspaceId: string;
  userId: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  instagramHandle: string | null;
  businessName: string | null;
  goals: string | null;
  onboardingCompleted: boolean;
  onboardingCompletedAt: Date | null;
  portalStatus: ClientPortalStatus;
  latestInviteSentAt: Date | null;
  latestInviteExpiresAt: Date | null;
  subscriptionStatus: SubscriptionStatus;
  accessUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientFolder {
  id: string;
  clientId: string;
  workspaceId: string;
  parentFolderId: string | null;
  name: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientFile {
  id: string;
  clientId: string;
  workspaceId: string;
  folderId: string | null;
  uploadedBy: string;
  filename: string;
  fileUrl: string;
  fileType: string;
  mimeType: string | null;
  sizeBytes: number | null;
  isVideo: boolean;
  createdAt: Date;
}

export interface ClientTask {
  id: string;
  clientId: string;
  workspaceId: string;
  createdBy: string;
  title: string;
  description: string | null;
  dueDate: Date | null;
  status: TaskStatus;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SetterTask {
  id: string;
  setterId: string;
  workspaceId: string;
  createdBy: string;
  title: string;
  description: string | null;
  dueDate: Date | null;
  status: TaskStatus;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientMessage {
  id: string;
  clientId: string;
  workspaceId: string;
  senderId: string;
  senderType: MessageSenderType;
  content: string;
  attachmentId: string | null;
  attachment?: ClientFile | null;
  readAt: Date | null;
  createdAt: Date;
}

export interface SetterMessage {
  id: string;
  setterId: string;
  workspaceId: string;
  senderId: string;
  senderType: 'coach' | 'setter';
  content: string;
  readAt: Date | null;
  createdAt: Date;
}

export interface Setter {
  id: string;
  email: string;
  displayName: string;
  workspaceId: string;
  createdAt: Date;
}

export interface PortalRoleRecord {
  id: string;
  userId: string;
  workspaceId: string;
  role: PortalRole;
  clientId: string | null;
  createdAt: Date;
}

function toValidDate(value: unknown): Date | null {
  if (!value) return null;
  const dt = new Date(value as any);
  if (Number.isNaN(dt.getTime())) return null;
  return dt;
}

// Helper to map DB row to Client type
export function mapDbRowToClient(row: any): Client {
  const derivedStatus: ClientPortalStatus =
    row.onboarding_completed
      ? 'active'
      : row.user_id
      ? 'onboarding_pending'
      : 'invitation_pending';

  // Some deployments have had timestamp drift or nulls in reads; avoid rendering epoch (Jan 1, 1970).
  const updatedAt = toValidDate(row.updated_at) || new Date();
  const createdAt = toValidDate(row.created_at) || updatedAt;

  return {
    id: row.id,
    workspaceId: row.workspace_id,
    userId: row.user_id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    instagramHandle: row.instagram_handle,
    businessName: row.business_name,
    goals: row.goals,
    onboardingCompleted: row.onboarding_completed,
    onboardingCompletedAt: row.onboarding_completed_at ? new Date(row.onboarding_completed_at) : null,
    portalStatus: (row.portal_status as ClientPortalStatus | undefined) || derivedStatus,
    latestInviteSentAt: row.latest_invite_sent_at ? new Date(row.latest_invite_sent_at) : null,
    latestInviteExpiresAt: row.latest_invite_expires_at ? new Date(row.latest_invite_expires_at) : null,
    subscriptionStatus: row.subscription_status as SubscriptionStatus,
    accessUntil: row.access_until ? new Date(row.access_until) : null,
    createdAt,
    updatedAt,
  };
}

export function mapDbRowToClientFolder(row: any): ClientFolder {
  return {
    id: row.id,
    clientId: row.client_id,
    workspaceId: row.workspace_id,
    parentFolderId: row.parent_folder_id,
    name: row.name,
    createdBy: row.created_by,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export function mapDbRowToTask(row: any): ClientTask {
  return {
    id: row.id,
    clientId: row.client_id,
    workspaceId: row.workspace_id,
    createdBy: row.created_by,
    title: row.title,
    description: row.description,
    dueDate: row.due_date ? new Date(row.due_date) : null,
    status: row.status as TaskStatus,
    completedAt: row.completed_at ? new Date(row.completed_at) : null,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export function mapDbRowToSetterTask(row: any): SetterTask {
  return {
    id: row.id,
    setterId: row.setter_id,
    workspaceId: row.workspace_id,
    createdBy: row.created_by,
    title: row.title,
    description: row.description,
    dueDate: row.due_date ? new Date(row.due_date) : null,
    status: row.status as TaskStatus,
    completedAt: row.completed_at ? new Date(row.completed_at) : null,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export function mapDbRowToFile(row: any): ClientFile {
  return {
    id: row.id,
    clientId: row.client_id,
    workspaceId: row.workspace_id,
    folderId: row.folder_id || null,
    uploadedBy: row.uploaded_by,
    filename: row.filename,
    fileUrl: row.file_url,
    fileType: row.file_type,
    mimeType: row.mime_type,
    sizeBytes: row.size_bytes,
    isVideo: row.is_video,
    createdAt: new Date(row.created_at),
  };
}

export function mapDbRowToMessage(row: any, attachment?: ClientFile | null): ClientMessage {
  return {
    id: row.id,
    clientId: row.client_id,
    workspaceId: row.workspace_id,
    senderId: row.sender_id,
    senderType: row.sender_type as MessageSenderType,
    content: row.content,
    attachmentId: row.attachment_id,
    attachment: attachment || null,
    readAt: row.read_at ? new Date(row.read_at) : null,
    createdAt: new Date(row.created_at),
  };
}

export function mapDbRowToSetterMessage(row: any): SetterMessage {
  return {
    id: row.id,
    setterId: row.setter_id,
    workspaceId: row.workspace_id,
    senderId: row.sender_id,
    senderType: row.sender_type as 'coach' | 'setter',
    content: row.content,
    readAt: row.read_at ? new Date(row.read_at) : null,
    createdAt: new Date(row.created_at),
  };
}
