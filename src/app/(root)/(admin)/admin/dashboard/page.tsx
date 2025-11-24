import {getAllUsers} from "@/actions/user.action";
import {requireRole} from "@/auth";
import {UsersTable} from "@/components/admin/users-table";

const AdminUsersPage = async ({
  searchParams,
}: {
  searchParams: Promise<{page?: string; pageSize?: string; search?: string}>;
}) => {
  await requireRole(["ADMIN"]);

  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const pageSize = parseInt(params.pageSize || "10");
  const search = params.search || "";

  const response = await getAllUsers({page, pageSize, search});

  if (!response.success || !response.data) {
    return (
      <div className="bg-primary flex min-h-screen items-center justify-center">
        <p className="text-secondary">Failed to load users</p>
      </div>
    );
  }

  return (
    <div className="bg-primary min-h-screen px-6 py-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-primary text-3xl font-bold">User Management</h1>
          <p className="text-secondary mt-2">
            Manage all users and their subscriptions
          </p>
        </div>

        <UsersTable
          initialData={response.data.users}
          total={response.data.total}
          currentPage={page}
          pageSize={pageSize}
          totalPages={response.data.totalPages}
          searchQuery={search}
        />
      </div>
    </div>
  );
};

export default AdminUsersPage;
