import { Navbar } from "@/components/layout/navbar";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { InterviewRoom } from "@/components/interview/interview-room";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <main className="relative overflow-hidden">
      <Navbar showProfile />
      <ProtectedRoute>
        <InterviewRoom interviewId={id} />
      </ProtectedRoute>
    </main>
  );
}
