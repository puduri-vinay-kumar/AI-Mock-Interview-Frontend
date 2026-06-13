import { ProtectedRoute } from "@/components/auth/protected-route";
import { InterviewRoom } from "@/components/interview/interview-room";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <main className="relative overflow-hidden">
      <ProtectedRoute>
        <InterviewRoom interviewId={id} />
      </ProtectedRoute>
    </main>
  );
}
