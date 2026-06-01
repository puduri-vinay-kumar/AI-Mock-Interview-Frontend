import { Navbar } from "@/components/layout/navbar";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { InterviewHistoryPage } from "@/components/history/interview-history-page";

export default function Page() {
  return (
    <main className="relative overflow-hidden">
      <Navbar showProfile />
      <ProtectedRoute>
        <InterviewHistoryPage />
      </ProtectedRoute>
    </main>
  );
}
