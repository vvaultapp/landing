import { Client, ClientFile } from '@/types/client-portal';
import { ClientDriveExplorer } from './ClientDriveExplorer';

interface ClientFilesTabProps {
  client: Client;
  files: ClientFile[];
  onRefresh: () => void;
}

export function ClientFilesTab({ client }: ClientFilesTabProps) {
  return <ClientDriveExplorer client={client} />;
}
