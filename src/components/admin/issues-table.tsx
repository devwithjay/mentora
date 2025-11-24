"use client";

import {Route} from "next";
import {useRouter, useSearchParams} from "next/navigation";
import {useEffect, useState, useTransition} from "react";

import {format} from "date-fns";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  Search,
  Trash2,
} from "lucide-react";
import {toast} from "sonner";

import {deleteIssue, resolveIssue} from "@/actions/issues.action";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Issue = {
  id: string;
  userId: string;
  userName: string | null;
  userEmail: string | null;
  title: string;
  description: string;
  category: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

const ITEMS_PER_PAGE_OPTIONS = [10, 20, 50, 100];

export const IssuesTable = ({
  initialData,
  total,
  currentPage,
  pageSize,
  totalPages,
  searchQuery: initialSearch,
  statusFilter: initialStatus,
}: {
  initialData: Issue[];
  total: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  searchQuery: string;
  statusFilter: string;
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [issueToDelete, setIssueToDelete] = useState<string | null>(null);

  const issues = initialData;
  const openCount = issues.filter(i => i.status === "open").length;
  const resolvedCount = issues.filter(i => i.status === "resolved").length;

  const updateURL = (params: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });

    startTransition(() => {
      router.push(`/admin/issues?${newParams.toString()}` as Route, {
        scroll: false,
      });
    });
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateURL({
        search: searchQuery,
        status: statusFilter,
        page: "1",
        pageSize: pageSize.toString(),
      });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, statusFilter]);

  const handlePageSizeChange = (value: string) => {
    updateURL({
      pageSize: value,
      page: "1",
      search: searchQuery,
      status: statusFilter,
    });
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      updateURL({
        page: page.toString(),
        pageSize: pageSize.toString(),
        search: searchQuery,
        status: statusFilter,
      });
    }
  };

  const handleResolve = async (issueId: string) => {
    const response = await resolveIssue(issueId);
    if (response.success) {
      toast.success("Issue resolved successfully");
      router.refresh();
    } else {
      toast.error(response.error?.message || "Failed to resolve issue");
    }
  };

  const handleDelete = async () => {
    if (!issueToDelete) return;

    const response = await deleteIssue(issueToDelete);
    if (response.success) {
      toast.success("Issue deleted successfully");
      setDeleteDialogOpen(false);
      setIssueToDelete(null);
      router.refresh();
    } else {
      toast.error(response.error?.message || "Failed to delete issue");
    }
  };

  const getStatusBadgeColor = (status: string) => {
    return status === "open"
      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
  };

  return (
    <>
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="border-primary bg-primary rounded-xl border p-6">
          <p className="text-secondary text-sm">Total Issues</p>
          <p className="text-primary mt-2 text-3xl font-bold">{total}</p>
        </div>
        <div className="border-primary bg-primary rounded-xl border p-6">
          <p className="text-secondary text-sm">Open Issues</p>
          <p className="text-primary mt-2 text-3xl font-bold">{openCount}</p>
        </div>
        <div className="border-primary bg-primary rounded-xl border p-6">
          <p className="text-secondary text-sm">Resolved Issues</p>
          <p className="text-primary mt-2 text-3xl font-bold">
            {resolvedCount}
          </p>
        </div>
      </div>

      <div className="border-primary bg-primary mb-6 rounded-xl border p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1">
            <Search className="text-secondary absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search by title, description, user..."
              value={searchQuery}
              onChange={e => handleSearch(e.target.value)}
              className="input-field border-primary pl-10"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-secondary text-sm">Status:</span>
              <Select
                value={statusFilter}
                onValueChange={handleStatusFilterChange}
              >
                <SelectTrigger className="btn-secondary w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-primary bg-primary">
                  <SelectItem value="all" className="text-primary">
                    All
                  </SelectItem>
                  <SelectItem value="open" className="text-primary">
                    Open
                  </SelectItem>
                  <SelectItem value="resolved" className="text-primary">
                    Resolved
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-secondary text-sm">Rows:</span>
              <Select
                value={pageSize.toString()}
                onValueChange={handlePageSizeChange}
              >
                <SelectTrigger className="btn-secondary w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-primary bg-primary">
                  {ITEMS_PER_PAGE_OPTIONS.map(option => (
                    <SelectItem
                      key={option}
                      value={option.toString()}
                      className="text-primary"
                    >
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="border-primary bg-primary rounded-xl border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-primary hover:bg-transparent">
                <TableHead className="text-primary font-semibold">
                  Title
                </TableHead>
                <TableHead className="text-primary font-semibold">
                  User
                </TableHead>
                <TableHead className="text-primary font-semibold">
                  Category
                </TableHead>
                <TableHead className="text-primary font-semibold">
                  Status
                </TableHead>
                <TableHead className="text-primary font-semibold">
                  Created
                </TableHead>
                <TableHead className="text-primary text-right font-semibold">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {issues.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-secondary text-center">
                    No issues found
                  </TableCell>
                </TableRow>
              ) : (
                issues.map(issue => (
                  <TableRow
                    key={issue.id}
                    className="border-primary hover:bg-brand-secondary"
                  >
                    <TableCell className="text-primary max-w-xs font-medium">
                      <div className="truncate">{issue.title}</div>
                    </TableCell>
                    <TableCell className="text-secondary">
                      <div>{issue.userName}</div>
                      <div className="text-xs">{issue.userEmail}</div>
                    </TableCell>
                    <TableCell className="text-secondary">
                      {issue.category}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={getStatusBadgeColor(issue.status)}
                        variant="outline"
                      >
                        {issue.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-secondary text-sm">
                      {format(new Date(issue.createdAt), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() => setSelectedIssue(issue)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {issue.status === "open" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 cursor-pointer p-0 text-green-600"
                            onClick={() => handleResolve(issue.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 cursor-pointer p-0 text-red-600"
                          onClick={() => {
                            setIssueToDelete(issue.id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="border-primary flex items-center justify-between border-t px-6 py-4">
          <p className="text-secondary text-sm">
            Showing {issues.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}{" "}
            to {Math.min(currentPage * pageSize, total)} of {total} issues
          </p>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1 || isPending}
              className="btn-secondary h-9 w-9 p-0"
              variant="outline"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex gap-1">
              {Array.from({length: Math.min(5, totalPages)}, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    disabled={isPending}
                    className={
                      currentPage === pageNum
                        ? "btn-primary h-9 w-9 p-0"
                        : "btn-secondary h-9 w-9 p-0"
                    }
                    variant={currentPage === pageNum ? "default" : "outline"}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages || isPending}
              className="btn-secondary h-9 w-9 p-0"
              variant="outline"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Dialog
        open={!!selectedIssue}
        onOpenChange={() => setSelectedIssue(null)}
      >
        <DialogContent className="border-primary bg-primary max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-primary">
              {selectedIssue?.title}
            </DialogTitle>
            <DialogDescription className="text-secondary">
              Issue details and information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-secondary text-sm font-medium">User</p>
              <p className="text-primary">{selectedIssue?.userName}</p>
              <p className="text-secondary text-sm">
                {selectedIssue?.userEmail}
              </p>
            </div>
            <div>
              <p className="text-secondary text-sm font-medium">Category</p>
              <p className="text-primary">{selectedIssue?.category}</p>
            </div>
            <div>
              <p className="text-secondary text-sm font-medium">Status</p>
              <Badge
                className={getStatusBadgeColor(selectedIssue?.status || "")}
                variant="outline"
              >
                {selectedIssue?.status}
              </Badge>
            </div>
            <div>
              <p className="text-secondary text-sm font-medium">Description</p>
              <p className="text-primary whitespace-pre-wrap">
                {selectedIssue?.description}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-secondary text-sm font-medium">Created</p>
                <p className="text-primary text-sm">
                  {selectedIssue &&
                    format(new Date(selectedIssue.createdAt), "PPpp")}
                </p>
              </div>
              <div>
                <p className="text-secondary text-sm font-medium">Updated</p>
                <p className="text-primary text-sm">
                  {selectedIssue &&
                    format(new Date(selectedIssue.updatedAt), "PPpp")}
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="border-primary bg-primary">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-primary">
              Delete Issue
            </AlertDialogTitle>
            <AlertDialogDescription className="text-secondary">
              Are you sure you want to delete this issue? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="btn-secondary">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
