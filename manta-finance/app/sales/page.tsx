import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { validateSession } from "@/lib/auth";
import Sidebar from "@/app/_components/Sidebar";
import SalesClient from "./_components/SalesClient";

export default async function SalesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("manta_session")?.value;
  if (!token || !(await validateSession(token))) {
    redirect("/login");
  }

  return (
    <Sidebar>
      <div className="p-6 lg:p-8">
        <SalesClient />
      </div>
    </Sidebar>
  );
}
