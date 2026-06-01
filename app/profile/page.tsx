import { Navbar } from "@/components/layout/navbar";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { ProfilePage } from "@/components/profile/profile-page";

export default function Page() {
  return (
    <main className="relative overflow-hidden">
      <Navbar showProfile />
      <ProtectedRoute>
        <ProfilePage />
      </ProtectedRoute>
    </main>
  );
}
