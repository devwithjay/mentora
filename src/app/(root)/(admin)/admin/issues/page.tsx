import {getAllIssues} from "@/actions/issues.action";
import {requireRole} from "@/auth";
import {IssuesTable} from "@/components/admin/issues-table";

const AdminIssuesPage = async ({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    search?: string;
    status?: "all" | "open" | "resolved";
  }>;
}) => {
  await requireRole(["ADMIN"]);

  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const pageSize = parseInt(params.pageSize || "10");
  const search = params.search || "";
  const status = params.status || "all";

  const response = await getAllIssues({page, pageSize, search, status});

  if (!response.success || !response.data) {
    return (
      <div className="bg-primary flex min-h-screen items-center justify-center">
        <p className="text-secondary">Failed to load issues</p>
      </div>
    );
  }

  return (
    <div className="bg-primary min-h-screen px-6 py-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-primary text-3xl font-bold">Issues Management</h1>
          <p className="text-secondary mt-2">
            View and manage all user-reported issues
          </p>
        </div>

        <IssuesTable
          initialData={response.data.issues}
          total={response.data.total}
          currentPage={page}
          pageSize={pageSize}
          totalPages={response.data.totalPages}
          searchQuery={search}
          statusFilter={status}
        />
      </div>
    </div>
  );
};

export default AdminIssuesPage;
