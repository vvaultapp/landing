import { useEffect, useState } from 'react';
import { Client } from '@/types/client-portal';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GripVertical, Plus, Trash2 } from '@/components/ui/icons';
import { supabase } from '@/integrations/supabase/client';
import {
  CLIENT_ONBOARDING_QUESTION_TYPES,
  ClientOnboardingQuestionDraft,
  ClientOnboardingQuestionType,
  DEFAULT_CLIENT_ONBOARDING_QUESTIONS,
  normalizeQuestionOptions,
  normalizeQuestionType,
  toQuestionOptionsJson,
} from '@/lib/client-onboarding';
import { toast } from 'sonner';

interface CustomizeQuestionsDialogProps {
  client: Client;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onQuestionsUpdated: () => void;
}

function toDraftWithOrder(questions: ClientOnboardingQuestionDraft[]): ClientOnboardingQuestionDraft[] {
  return questions.map((question, index) => ({
    ...question,
    question_order: index,
    options: Array.isArray(question.options) ? question.options : [],
  }));
}

export function CustomizeQuestionsDialog({
  client,
  open,
  onOpenChange,
  onQuestionsUpdated,
}: CustomizeQuestionsDialogProps) {
  const [questions, setQuestions] = useState<ClientOnboardingQuestionDraft[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (open) {
      void loadQuestions();
    }
  }, [open, client.id]);

  const loadQuestions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('client_onboarding_questions')
        .select('*')
        .eq('client_id', client.id)
        .order('question_order', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        const mapped = data.map((q) => ({
          id: q.id,
          question_text: q.question_text,
          question_type: normalizeQuestionType(q.question_type),
          is_required: true,
          placeholder: q.placeholder || '',
          question_order: q.question_order,
          options: normalizeQuestionOptions((q as { options_json?: unknown }).options_json),
        }));
        setQuestions(toDraftWithOrder(mapped));
      } else {
        setQuestions(toDraftWithOrder(DEFAULT_CLIENT_ONBOARDING_QUESTIONS));
      }
    } catch (err) {
      console.error('Error loading questions:', err);
      setQuestions(toDraftWithOrder(DEFAULT_CLIENT_ONBOARDING_QUESTIONS));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddQuestion = () => {
    setQuestions((prev) =>
      toDraftWithOrder([
        ...prev,
        {
          question_text: '',
          question_type: 'text',
          is_required: true,
          placeholder: '',
          question_order: prev.length,
          options: [],
        },
      ])
    );
  };

  const handleRemoveQuestion = (index: number) => {
    if (questions.length <= 1) {
      toast.error('You need at least one question');
      return;
    }

    setQuestions((prev) => toDraftWithOrder(prev.filter((_, i) => i !== index)));
  };

  const updateQuestion = (index: number, updates: Partial<ClientOnboardingQuestionDraft>) => {
    setQuestions((prev) =>
      toDraftWithOrder(
        prev.map((question, i) => {
          if (i !== index) return question;
          const next: ClientOnboardingQuestionDraft = { ...question, ...updates, is_required: true };
          if (next.question_type === 'yes_no') {
            next.options = ['Yes', 'No'];
          }
          if (next.question_type !== 'select' && next.question_type !== 'yes_no') {
            next.options = [];
          }
          return next;
        })
      )
    );
  };

  const handleQuestionTypeChange = (index: number, value: string) => {
    updateQuestion(index, { question_type: value as ClientOnboardingQuestionType });
  };

  const handleSave = async () => {
    const invalidQuestion = questions.find((question) => !question.question_text.trim());
    if (invalidQuestion) {
      toast.error('Please fill in all question texts');
      return;
    }

    const invalidSelect = questions.find(
      (question) => question.question_type === 'select' && normalizeQuestionOptions(question.options).length < 2
    );
    if (invalidSelect) {
      toast.error('Dropdown questions need at least two options');
      return;
    }

    setIsSaving(true);
    try {
      const { error: deleteError } = await supabase
        .from('client_onboarding_questions')
        .delete()
        .eq('client_id', client.id);

      if (deleteError) throw deleteError;

      const questionsToInsert = questions.map((question, index) => ({
        client_id: client.id,
        workspace_id: client.workspaceId,
        question_text: question.question_text.trim(),
        question_type: question.question_type,
        is_required: true,
        placeholder: question.placeholder?.trim() || null,
        question_order: index,
        options_json: toQuestionOptionsJson(question.options),
      }));

      const { error: insertError } = await supabase
        .from('client_onboarding_questions')
        .insert(questionsToInsert);

      if (insertError) throw insertError;

      toast.success('Questions saved');
      onQuestionsUpdated();
      onOpenChange(false);
    } catch (err) {
      console.error('Error saving questions:', err);
      toast.error('Failed to save questions');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-black border-border rounded-3xl max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customize Onboarding Questions</DialogTitle>
          <DialogDescription>
            Set up the onboarding questions {client.name} will answer.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">Loading...</div>
        ) : (
          <div className="space-y-4 py-4">
            {questions.map((question, index) => (
              <div key={`${question.id || 'new'}-${index}`} className="border border-border rounded-2xl p-4 space-y-3 bg-black">
                <div className="flex items-start gap-3">
                  <GripVertical className="w-4 h-4 text-muted-foreground mt-2.5 shrink-0" />

                  <div className="flex-1 space-y-3">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Question {index + 1}</Label>
                      <input
                        value={question.question_text}
                        onChange={(event) => updateQuestion(index, { question_text: event.target.value })}
                        placeholder="Enter your question..."
                        className="w-full h-10 px-4 bg-black border border-border rounded-2xl text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-border"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Input type</Label>
                        <Select value={question.question_type} onValueChange={(value) => handleQuestionTypeChange(index, value)}>
                          <SelectTrigger className="bg-black border-border rounded-2xl h-10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-black border-border">
                            {CLIENT_ONBOARDING_QUESTION_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Placeholder</Label>
                        <input
                          value={question.placeholder}
                          onChange={(event) => updateQuestion(index, { placeholder: event.target.value })}
                          placeholder="Placeholder text..."
                          className="w-full h-10 px-4 bg-black border border-border rounded-2xl text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-border"
                        />
                      </div>
                    </div>

                    {question.question_type === 'select' && (
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Dropdown options (comma separated)</Label>
                        <input
                          value={question.options.join(', ')}
                          onChange={(event) =>
                            updateQuestion(index, {
                              options: event.target.value
                                .split(',')
                                .map((value) => value.trim())
                                .filter(Boolean),
                            })
                          }
                          placeholder="Option 1, Option 2, Option 3"
                          className="w-full h-10 px-4 bg-black border border-border rounded-2xl text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-border"
                        />
                      </div>
                    )}

                    {question.question_type === 'yes_no' && (
                      <p className="text-xs text-muted-foreground">This question will use Yes / No options automatically.</p>
                    )}

                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveQuestion(index)}
                    className="shrink-0 text-muted-foreground hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}

            <Button variant="outline" onClick={handleAddQuestion} className="w-full border-dashed border-border rounded-2xl bg-transparent">
              <Plus className="w-4 h-4 mr-2" />
              Add Question
            </Button>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl bg-transparent border-border">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-white text-black hover:bg-white/90 font-semibold border-0 shadow-none rounded-xl"
          >
            {isSaving ? 'Saving...' : 'Save Questions'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
