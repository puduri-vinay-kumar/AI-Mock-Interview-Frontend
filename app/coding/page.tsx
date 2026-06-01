import { Navbar } from "@/components/layout/navbar";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { CodingEvaluator } from "@/components/coding/coding-evaluator";

export default function Page() {
  return (
    <main className="relative overflow-hidden">
      <Navbar showProfile />
      <ProtectedRoute>
        <CodingEvaluator />
      </ProtectedRoute>
    </main>
  );
}
