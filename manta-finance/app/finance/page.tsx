import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { validateSession } from "@/lib/auth";
import Sidebar from "@/app/_components/Sidebar";
import FinanceClient from "./_components/FinanceClient";

export default async function FinancePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("manta_session")?.value;
  if (!token || !(await validateSession(token))) {
    redirect("/login");
  }

  return (
    <Sidebar>
      <div className="p-6 lg:p-8">
        <FinanceClient />
      </div>
    </Sidebar>
  );
}
