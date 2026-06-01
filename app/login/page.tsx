import { Navbar } from "@/components/layout/navbar";
import { AuthForm } from "@/components/auth/auth-form";
import { GuestRoute } from "@/components/auth/guest-route";

export default function LoginPage() {
  return (
    <main className="relative overflow-hidden">
      <Navbar />
      <GuestRoute>
        <section className="container-shell flex min-h-[calc(100vh-120px)] items-center justify-center py-12">
          <AuthForm mode="login" />
        </section>
      </GuestRoute>
    </main>
  );
}
