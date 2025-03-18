import DashboardPage from "@/components/dashboard/DashboardPage";
import { withAuth } from '@workos-inc/authkit-nextjs';

export default async function Dashboard() {
    const { user } = await withAuth({ ensureSignedIn: true });
    
  return (
    <main>
      <DashboardPage />
    </main>
  );
}


