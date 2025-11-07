import {ReactNode} from "react";

import {requireRole} from "@/auth";

const AdminLayout = async ({children}: {children: ReactNode}) => {
  await requireRole(["ADMIN"]);

  return <>{children}</>;
};

export default AdminLayout;
