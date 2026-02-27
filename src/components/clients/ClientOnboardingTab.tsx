import { useEffect, useMemo, useState } from 'react';
import { Client } from '@/types/client-portal';
import { CheckCircle, Clock } from '@/components/ui/icons';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

interface ClientOnboardingTabProps {
  client: Client;
}

interface QuestionAnswer {
  questionId: string;
  question: string;
  answer: string;
  order: number;
}

export function ClientOnboardingTab({ client }: ClientOnboardingTabProps) {
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<QuestionAnswer[]>([]);

  useEffect(() => {
    let mounted = true;

    const loadResponses = async () => {
      setLoading(true);
      try {
        const { data: questions, error: questionsError } = await supabase
          .from('client_onboarding_questions')
          .select('id,question_text,question_order')
          .eq('client_id', client.id)
          .order('question_order', { ascending: true });

        if (questionsError) throw questionsError;

        const { data: responses, error: responsesError } = await supabase
          .from('client_onboarding_responses')
          .select('question_id,response_text')
          .eq('client_id', client.id);

        if (responsesError) throw responsesError;

        const responseMap = new Map<string, string>();
        (responses || []).forEach((row) => {
          responseMap.set(row.question_id, row.response_text || '');
        });

        const combined = (questions || []).map((question) => ({
          questionId: question.id,
          question: question.question_text,
          answer: responseMap.get(question.id) || '',
          order: question.question_order || 0,
        }));

        if (mounted) {
          setAnswers(combined);
        }
      } catch (err) {
        console.error('Error loading onboarding responses:', err);
        if (mounted) {
          setAnswers([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void loadResponses();

    return () => {
      mounted = false;
    };
  }, [client.id]);

  const legacyAnswers = useMemo(() => {
    const rows = [
      { question: 'Business Name', answer: client.businessName || '' },
      { question: 'Instagram Handle', answer: client.instagramHandle || '' },
      { question: 'Phone', answer: client.phone || '' },
      { question: 'Goals', answer: client.goals || '' },
    ].filter((row) => String(row.answer || '').trim().length > 0);

    return rows;
  }, [client.businessName, client.instagramHandle, client.phone, client.goals]);

  const hasDbAnswers = answers.some((item) => String(item.answer || '').trim().length > 0);

  return (
    <div className="max-w-3xl space-y-6">
      <div
        className={`border rounded-lg p-4 flex items-center gap-3 ${
          client.onboardingCompleted
            ? 'border-border bg-success/10'
            : 'border-yellow-500/30 bg-yellow-500/10'
        }`}
      >
        {client.onboardingCompleted ? (
          <>
            <CheckCircle className="w-5 h-5 text-success" />
            <div>
              <p className="font-medium text-success">Onboarding Complete</p>
              {client.onboardingCompletedAt && (
                <p className="text-sm text-muted-foreground">
                  Completed on {format(client.onboardingCompletedAt, 'MMMM d, yyyy')}
                </p>
              )}
            </div>
          </>
        ) : (
          <>
            <Clock className="w-5 h-5 text-yellow-400" />
            <div>
              <p className="font-medium text-yellow-400">Onboarding Pending</p>
              <p className="text-sm text-muted-foreground">Client has not completed onboarding yet.</p>
            </div>
          </>
        )}
      </div>

      {client.onboardingCompleted && (
        <div className="border border-border rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold">Onboarding Responses</h3>

          {loading ? (
            <p className="text-sm text-muted-foreground">Loading responses...</p>
          ) : hasDbAnswers ? (
            <div className="space-y-4">
              {answers.map((item) => (
                <div key={item.questionId}>
                  <p className="text-sm text-muted-foreground mb-1">{item.question}</p>
                  <p className="font-medium whitespace-pre-wrap">
                    {item.answer?.trim() ? item.answer : '—'}
                  </p>
                </div>
              ))}
            </div>
          ) : legacyAnswers.length > 0 ? (
            <div className="space-y-4">
              {legacyAnswers.map((item) => (
                <div key={item.question}>
                  <p className="text-sm text-muted-foreground mb-1">{item.question}</p>
                  <p className="font-medium whitespace-pre-wrap">{item.answer}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No onboarding answers recorded yet.</p>
          )}
        </div>
      )}

      {!client.onboardingCompleted && (
        <div className="border border-border rounded-lg p-8 text-center">
          <p className="text-muted-foreground mb-2">
            Once the client completes onboarding, their responses will appear here.
          </p>
          <p className="text-sm text-muted-foreground">
            Clients are prompted for onboarding during their first portal login.
          </p>
        </div>
      )}
    </div>
  );
}
