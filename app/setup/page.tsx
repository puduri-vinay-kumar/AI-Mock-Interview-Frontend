import { Navbar } from "@/components/layout/navbar";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { SetupFormSection } from "@/components/sections/setup-form-section";

export default function SetupPage() {
  return (
    <main className="relative overflow-hidden">
      <Navbar showProfile />
      <ProtectedRoute>
        <SetupFormSection />
      </ProtectedRoute>
    </main>
  );
}
