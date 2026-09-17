import { QuizList } from '@/components/quiz-list';
import { apiRequest, type QuizSummary } from '@/lib/quizzes';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Your quizzes' };
export default async function QuizzesPage() {
  const quizzes = await apiRequest<QuizSummary[]>('/quizzes');
  return <QuizList initialQuizzes={quizzes} />;
}
