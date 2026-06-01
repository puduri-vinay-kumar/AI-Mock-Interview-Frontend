import { Navbar } from "@/components/layout/navbar";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { ReportPage } from "@/components/reports/report-page";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <main className="relative overflow-hidden">
      <Navbar showProfile />
      <ProtectedRoute>
        <ReportPage reportId={id} />
      </ProtectedRoute>
    </main>
  );
}
