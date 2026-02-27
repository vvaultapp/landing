import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Plus, Loader2, Calendar as CalendarIcon } from '@/components/ui/icons';
import { CreateMeetingData } from '@/hooks/useMeetings';
import { format } from 'date-fns';

interface Client {
  id: string;
  name: string;
  email: string | null;
}

interface TeamMember {
  id: string;
  user_id: string;
  display_name: string | null;
  role: string;
}

interface LeadOption {
  conversation_id: string;
  instagram_user_id: string;
  peer_username: string | null;
  peer_name: string | null;
  assigned_user_id: string | null;
}

interface CreateMeetingDialogProps {
  clients: Client[];
  leads?: LeadOption[];
  teamMembers?: TeamMember[];
  onCreateMeeting: (data: CreateMeetingData) => Promise<any>;
  trigger?: React.ReactNode;
  defaultDate?: Date;
  defaultConversationId?: string | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  isCalendarConnected?: boolean;
}

export function CreateMeetingDialog({ 
  clients, 
  leads = [],
  teamMembers = [],
  onCreateMeeting, 
  trigger,
  defaultDate,
  defaultConversationId,
  open: openProp,
  onOpenChange: onOpenChangeProp,
  isCalendarConnected = false
}: CreateMeetingDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = openProp ?? internalOpen;
  const setOpen = onOpenChangeProp ?? setInternalOpen;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(defaultDate);
  const [leadSearch, setLeadSearch] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '09:00',
    endTime: '10:00',
    clientId: '',
    conversationId: '',
    assignedTo: '',
  });

  // Update default date when it changes
  useEffect(() => {
    if (defaultDate && open) {
      setSelectedDate(defaultDate);
    }
  }, [defaultDate, open]);

  useEffect(() => {
    if (!open || !defaultConversationId) return;
    setFormData((prev) => {
      const linkedLead = leads.find((lead) => lead.conversation_id === defaultConversationId);
      if (prev.conversationId === defaultConversationId) {
        if (!prev.assignedTo && linkedLead?.assigned_user_id) {
          return {
            ...prev,
            assignedTo: linkedLead.assigned_user_id,
          };
        }
        return prev;
      }
      return {
        ...prev,
        conversationId: defaultConversationId,
        assignedTo: linkedLead?.assigned_user_id || prev.assignedTo,
      };
    });
  }, [open, defaultConversationId, leads]);

  const filteredLeads = leads.filter((lead) => {
    const needle = leadSearch.trim().toLowerCase();
    if (!needle) return true;
    const name = String(lead.peer_name || '').toLowerCase();
    const handle = String(lead.peer_username || '').toLowerCase();
    return name.includes(needle) || handle.includes(needle);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !selectedDate || !formData.startTime || !formData.endTime) {
      return;
    }

    setIsSubmitting(true);
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const startDateTime = `${dateStr}T${formData.startTime}:00`;
      const endDateTime = `${dateStr}T${formData.endTime}:00`;

      // Get client email if selected
      const selectedClient = clients.find(c => c.id === formData.clientId);
      const attendeeEmails: string[] = [];
      if (selectedClient?.email) {
        attendeeEmails.push(selectedClient.email);
      }

      const result = await onCreateMeeting({
        title: formData.title,
        description: formData.description || undefined,
        start_time: new Date(startDateTime).toISOString(),
        end_time: new Date(endDateTime).toISOString(),
        client_id: formData.clientId === 'none' ? null : formData.clientId || null,
        assigned_to: formData.assignedTo === 'none' ? null : formData.assignedTo || null,
        conversation_id: formData.conversationId === 'none' ? null : formData.conversationId || null,
        add_google_meet: true,
        sync_to_google: true,
        attendee_emails: attendeeEmails,
      });

      if (result) {
        setOpen(false);
        setSelectedDate(undefined);
        setFormData({
          title: '',
          description: '',
          startTime: '09:00',
          endTime: '10:00',
          clientId: '',
          conversationId: '',
          assignedTo: '',
        });
        setLeadSearch('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-white text-black hover:bg-white/90 shadow-none">
            <Plus className="w-4 h-4" />
            New Meeting
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto bg-black border-border rounded-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-medium">
            <CalendarIcon className="w-5 h-5" />
            Schedule Meeting
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Horizontal layout: Left side (form fields) + Right side (calendar) */}
          <div className="flex gap-6">
            {/* Left side - Form fields */}
            <div className="flex-1 space-y-4">
              {/* Meeting Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-white/60 text-xs uppercase tracking-wider">Meeting Title *</Label>
                <input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Meeting title"
                  required
                  className="w-full px-4 py-2.5 bg-[#151618] border border-border rounded-2xl text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-border transition-colors"
                />
              </div>

              {/* Assign to Lead */}
              <div className="space-y-2">
                <Label htmlFor="client" className="text-white/60 text-xs uppercase tracking-wider">Assign to (Client / Lead)</Label>
                <Select
                  value={formData.clientId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, clientId: value }))}
                >
                  <SelectTrigger className="bg-[#151618] border-border rounded-2xl h-10">
                    <SelectValue placeholder="Select from clients" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#151618] border-border rounded-xl">
                    <SelectItem value="none">No lead</SelectItem>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-white/30">Leads available once Meta API connected</p>
              </div>

              {/* Link to inbox conversation */}
              <div className="space-y-2">
                <Label htmlFor="lead-search" className="text-white/60 text-xs uppercase tracking-wider">
                  Linked lead conversation
                </Label>
                <input
                  id="lead-search"
                  value={leadSearch}
                  onChange={(e) => setLeadSearch(e.target.value)}
                  placeholder="Search lead by name or @handle"
                  className="w-full px-4 py-2.5 bg-[#151618] border border-border rounded-2xl text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-border transition-colors"
                />
                <Select
                  value={formData.conversationId}
                  onValueChange={(value) => {
                    setFormData((prev) => {
                      const selectedLead = leads.find((lead) => lead.conversation_id === value);
                      return {
                        ...prev,
                        conversationId: value,
                        assignedTo: selectedLead?.assigned_user_id || prev.assignedTo,
                      };
                    });
                  }}
                >
                  <SelectTrigger className="bg-[#151618] border-border rounded-2xl h-10">
                    <SelectValue placeholder="Link a lead conversation (optional)" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#151618] border-border rounded-xl max-h-64">
                    <SelectItem value="none">No linked lead</SelectItem>
                    {filteredLeads.map((lead) => {
                      const label = lead.peer_name || (lead.peer_username ? `@${lead.peer_username}` : lead.instagram_user_id);
                      const subtitle = lead.peer_username ? `@${lead.peer_username}` : lead.instagram_user_id;
                      return (
                        <SelectItem key={lead.conversation_id} value={lead.conversation_id}>
                          {label} • {subtitle}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <p className="text-xs text-white/30">
                  Linking enables reminders, outcomes, and follow-up automation from inbox data.
                </p>
              </div>

              {/* Assign to Closer */}
              <div className="space-y-2">
                <Label htmlFor="assignedTo" className="text-white/60 text-xs uppercase tracking-wider">Assign to (Closer)</Label>
                <Select
                  value={formData.assignedTo}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, assignedTo: value }))}
                >
                  <SelectTrigger className="bg-[#151618] border-border rounded-2xl h-10">
                    <SelectValue placeholder="Select closer" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#151618] border-border rounded-xl">
                    <SelectItem value="none">Unassigned</SelectItem>
                    {teamMembers.map((member) => (
                      <SelectItem key={member.id} value={member.user_id}>
                        {member.display_name || 'Team Member'} {member.role === 'owner' && '(Owner)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime" className="text-white/60 text-xs uppercase tracking-wider">Start Time *</Label>
                  <input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                    required
                    className="time-input w-full px-4 py-2.5 bg-[#151618] border border-border rounded-2xl text-sm text-foreground focus:outline-none focus:border-border transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime" className="text-white/60 text-xs uppercase tracking-wider">End Time *</Label>
                  <input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                    required
                    className="time-input w-full px-4 py-2.5 bg-[#151618] border border-border rounded-2xl text-sm text-foreground focus:outline-none focus:border-border transition-colors"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-white/60 text-xs uppercase tracking-wider">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Meeting agenda, notes..."
                  rows={3}
                  className="bg-[#151618] border-border rounded-2xl resize-none"
                />
              </div>
            </div>

            {/* Right side - Calendar */}
            <div className="w-[300px] flex flex-col">
              <Label className="text-white/60 text-xs uppercase tracking-wider mb-2">Date *</Label>
              <div className="bg-black border border-border rounded-2xl p-2 flex-1">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="pointer-events-auto w-full [&_.rdp-months]:w-full [&_.rdp-month]:w-full [&_.rdp-table]:w-full [&_.rdp-head_th]:w-[40px] [&_.rdp-cell]:w-[40px] [&_.rdp-day]:w-[36px] [&_.rdp-day]:h-[36px]"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="border-border hover:bg-[#1a1a1a] rounded-xl font-medium"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-white text-black hover:bg-white/90 font-semibold border-0 shadow-none rounded-xl"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                'Create Meeting'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
