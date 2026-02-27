import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePortalAuth } from '@/hooks/usePortalAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowRight, ArrowLeft, CheckCircle } from '@/components/ui/icons';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  ClientOnboardingQuestionType,
  DEFAULT_CLIENT_ONBOARDING_QUESTIONS,
  normalizeQuestionOptions,
  normalizeQuestionType,
} from '@/lib/client-onboarding';

interface OnboardingQuestion {
  id: string;
  question_text: string;
  question_type: ClientOnboardingQuestionType;
  is_required: boolean;
  placeholder: string;
  question_order: number;
  options: string[];
}

function makeDefaultQuestions(): OnboardingQuestion[] {
  return DEFAULT_CLIENT_ONBOARDING_QUESTIONS.map((question, index) => ({
    id: `default-${index + 1}`,
    question_text: question.question_text,
    question_type: question.question_type,
    is_required: question.is_required,
    placeholder: question.placeholder,
    question_order: question.question_order,
    options: [...(question.options || [])],
  }));
}

function isPersistedQuestionId(value: string) {
  return !value.startsWith('default-');
}

export default function PortalOnboarding() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { portalRole, client, loading, updateClient } = usePortalAuth();

  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questions, setQuestions] = useState<OnboardingQuestion[]>([]);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);

  useEffect(() => {
    if (authLoading || loading) return;

    if (!user) {
      navigate('/portal/login');
      return;
    }

    if (portalRole !== 'client') {
      navigate('/dashboard');
      return;
    }

    if (client?.onboardingCompleted) {
      navigate('/portal');
    }
  }, [user, authLoading, loading, portalRole, client, navigate]);

  useEffect(() => {
    if (!client?.id) return;
    void loadQuestionsAndResponses();
  }, [client?.id]);

  const loadQuestionsAndResponses = async () => {
    if (!client) return;

    setIsLoadingQuestions(true);
    try {
      const { data: questionRows, error: questionError } = await supabase
        .from('client_onboarding_questions')
        .select('*')
        .eq('client_id', client.id)
        .order('question_order', { ascending: true });

      if (questionError) throw questionError;

      const loadedQuestions: OnboardingQuestion[] =
        questionRows && questionRows.length > 0
          ? questionRows.map((question) => ({
              id: question.id,
              question_text: question.question_text,
              question_type: normalizeQuestionType(question.question_type),
              is_required: question.is_required,
              placeholder: question.placeholder || '',
              question_order: question.question_order,
              options: normalizeQuestionOptions((question as { options_json?: unknown }).options_json),
            }))
          : makeDefaultQuestions();

      setQuestions(loadedQuestions);

      const { data: responseRows, error: responseError } = await supabase
        .from('client_onboarding_responses')
        .select('question_id,response_text')
        .eq('client_id', client.id);

      if (responseError) throw responseError;

      const initialResponses: Record<string, string> = {};
      (responseRows || []).forEach((row) => {
        if (row.question_id) {
          initialResponses[row.question_id] = row.response_text || '';
        }
      });

      setResponses(initialResponses);
      setStep(0);
    } catch (err) {
      console.error('Error loading client onboarding questions:', err);
      setQuestions(makeDefaultQuestions());
      setResponses({});
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const currentQuestion = questions[step] || null;
  const totalSteps = questions.length;
  const isLastStep = step === totalSteps - 1;

  const canProceed = useMemo(() => {
    if (!currentQuestion) return false;
    if (!currentQuestion.is_required) return true;
    return String(responses[currentQuestion.id] || '').trim().length > 0;
  }, [currentQuestion, responses]);

  const handleResponseChange = (questionId: string, value: string) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    if (!client) return;

    setIsSubmitting(true);
    try {
      const persistedResponses = questions
        .filter((question) => isPersistedQuestionId(question.id))
        .map((question) => ({
          client_id: client.id,
          question_id: question.id,
          workspace_id: client.workspaceId,
          response_text: responses[question.id] || null,
        }));

      if (persistedResponses.length > 0) {
        const { error: responseError } = await supabase
          .from('client_onboarding_responses')
          .upsert(persistedResponses, { onConflict: 'client_id,question_id' });

        if (responseError) throw responseError;
      }

      const legacyData: Record<string, string | boolean | null> = {
        onboardingCompleted: true,
      };

      for (const question of questions) {
        const answer = String(responses[question.id] || '').trim();
        const normalizedText = question.question_text.toLowerCase();

        if (!legacyData.businessName && normalizedText.includes('business')) {
          legacyData.businessName = answer || null;
          continue;
        }

        if (!legacyData.instagramHandle && normalizedText.includes('instagram')) {
          legacyData.instagramHandle = answer || null;
          continue;
        }

        if (!legacyData.phone && question.question_type === 'phone') {
          legacyData.phone = answer || null;
          continue;
        }

        if (!legacyData.goals && (question.question_type === 'textarea' || normalizedText.includes('goal'))) {
          legacyData.goals = answer || null;
          continue;
        }
      }

      const { error: updateError } = await updateClient(legacyData as any);
      if (updateError) {
        toast.error('Failed to save onboarding data');
        return;
      }

      toast.success('Onboarding complete');
      navigate('/portal');
    } catch (err) {
      console.error('Onboarding error:', err);
      toast.error('Something went wrong while saving your onboarding');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestionInput = () => {
    if (!currentQuestion) return null;

    const value = responses[currentQuestion.id] || '';

    if (currentQuestion.question_type === 'textarea') {
      return (
        <Textarea
          id={currentQuestion.id}
          placeholder={currentQuestion.placeholder}
          value={value}
          onChange={(event) => handleResponseChange(currentQuestion.id, event.target.value)}
          className="bg-transparent border-border min-h-[120px]"
        />
      );
    }

    if (currentQuestion.question_type === 'phone') {
      return (
        <Input
          id={currentQuestion.id}
          type="tel"
          placeholder={currentQuestion.placeholder}
          value={value}
          onChange={(event) => handleResponseChange(currentQuestion.id, event.target.value)}
          className="bg-transparent border-border"
        />
      );
    }

    if (currentQuestion.question_type === 'email') {
      return (
        <Input
          id={currentQuestion.id}
          type="email"
          placeholder={currentQuestion.placeholder || 'you@example.com'}
          value={value}
          onChange={(event) => handleResponseChange(currentQuestion.id, event.target.value)}
          className="bg-transparent border-border"
        />
      );
    }

    if (currentQuestion.question_type === 'number') {
      return (
        <Input
          id={currentQuestion.id}
          type="number"
          placeholder={currentQuestion.placeholder || '0'}
          value={value}
          onChange={(event) => handleResponseChange(currentQuestion.id, event.target.value)}
          className="bg-transparent border-border"
        />
      );
    }

    if (currentQuestion.question_type === 'yes_no') {
      return (
        <div className="grid grid-cols-2 gap-3">
          {['Yes', 'No'].map((option) => {
            const isSelected = value.toLowerCase() === option.toLowerCase();
            return (
              <button
                key={option}
                type="button"
                onClick={() => handleResponseChange(currentQuestion.id, option)}
                className={`h-11 rounded-2xl border text-sm transition-colors ${
                  isSelected
                    ? 'bg-white text-black border-white'
                    : 'bg-transparent text-foreground border-border hover:bg-muted/30'
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      );
    }

    if (currentQuestion.question_type === 'select') {
      const options = currentQuestion.options.length > 0 ? currentQuestion.options : ['Option 1'];
      return (
        <Select value={value} onValueChange={(next) => handleResponseChange(currentQuestion.id, next)}>
          <SelectTrigger className="bg-transparent border-border">
            <SelectValue placeholder={currentQuestion.placeholder || 'Select an option'} />
          </SelectTrigger>
          <SelectContent className="bg-black border-border">
            {options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    return (
      <Input
        id={currentQuestion.id}
        placeholder={currentQuestion.placeholder}
        value={value}
        onChange={(event) => handleResponseChange(currentQuestion.id, event.target.value)}
        className="bg-transparent border-border"
      />
    );
  };

  if (authLoading || loading || isLoadingQuestions) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!client || questions.length === 0 || !currentQuestion) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex gap-1 mb-8">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div
              key={index}
              className={`h-1 flex-1 rounded-full transition-colors ${
                index <= step ? 'bg-white' : 'bg-border'
              }`}
            />
          ))}
        </div>

        <div className="space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-medium mb-2">{currentQuestion.question_text}</h1>
            {currentQuestion.is_required && (
              <p className="text-muted-foreground text-sm">Required</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={currentQuestion.id} className="sr-only">
              {currentQuestion.question_text}
            </Label>
            {renderQuestionInput()}
          </div>

          <div className="flex gap-3">
            {step > 0 && (
              <Button variant="outline" onClick={() => setStep((prev) => prev - 1)} className="flex-1 rounded-xl">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}

            {!isLastStep ? (
              <Button
                onClick={() => setStep((prev) => prev + 1)}
                disabled={!canProceed}
                className={`${step === 0 ? 'w-full' : 'flex-1'} bg-white text-black hover:bg-white/90 font-medium rounded-xl`}
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !canProceed}
                className="flex-1 bg-white text-black hover:bg-white/90 font-medium rounded-xl"
              >
                {isSubmitting ? 'Completing...' : 'Complete Setup'}
                <CheckCircle className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
