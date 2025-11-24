import {ReactNode} from "react";

import {requireRole} from "@/auth";
import {AdminNav} from "@/components/admin/admin-nav";

const AdminLayout = async ({children}: {children: ReactNode}) => {
  await requireRole(["ADMIN"]);

  return (
    <div className="bg-primary min-h-screen">
      <AdminNav />
      {children}
    </div>
  );
};

export default AdminLayout;
