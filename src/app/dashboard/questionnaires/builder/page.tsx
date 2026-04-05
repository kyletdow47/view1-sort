import { QuestionnaireBuilderView } from '@/components/features/questionnaires/QuestionnaireBuilderView';

// TODO(db): fetch questionnaire by ID from Supabase when questionnaireId is provided
// Needs questionnaires table from DB migration (ARCHITECTURE-DECISIONS.md §Decision 8)

interface PageProps {
  searchParams: Promise<{ id?: string; name?: string }>;
}

export default async function QuestionnaireBuilderPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const questionnaireId = params.id;
  const initialName = params.name
    ? decodeURIComponent(params.name)
    : 'Wedding Planning Questionnaire';

  return (
    <QuestionnaireBuilderView
      questionnaireId={questionnaireId}
      initialName={initialName}
    />
  );
}

export const metadata = {
  title: 'Questionnaire Builder — View1 Sort',
};
