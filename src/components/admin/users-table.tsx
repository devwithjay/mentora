"use client";

import {useRouter, useSearchParams} from "next/navigation";
import {useEffect, useState, useTransition} from "react";

import {format} from "date-fns";
import {ChevronLeft, ChevronRight, Search} from "lucide-react";

import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
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

type User = {
  id: string;
  name: string;
  username: string;
  email: string;
  plan: string;
  role: string;
  createdAt: string;
  updatedAt: string;
};

const ITEMS_PER_PAGE_OPTIONS = [10, 20, 50, 100];

export const UsersTable = ({
  initialData,
  total,
  currentPage,
  pageSize,
  totalPages,
  searchQuery: initialSearch,
}: {
  initialData: User[];
  total: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  searchQuery: string;
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  const users = initialData;
  const freeCount = users.filter(u => u.plan.toLowerCase() === "free").length;
  const basicCount = users.filter(u => u.plan.toLowerCase() === "basic").length;
  const proCount = users.filter(u => u.plan.toLowerCase() === "pro").length;

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
      router.push(`/admin/dashboard?${newParams.toString()}`, {scroll: false});
    });
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateURL({
        search: searchQuery,
        page: "1",
        pageSize: pageSize.toString(),
      });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handlePageSizeChange = (value: string) => {
    updateURL({
      pageSize: value,
      page: "1",
      search: searchQuery,
    });
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      updateURL({
        page: page.toString(),
        pageSize: pageSize.toString(),
        search: searchQuery,
      });
    }
  };

  const getPlanBadgeColor = (plan: string) => {
    switch (plan.toLowerCase()) {
      case "pro":
        return "bg-brand text-white";
      case "basic":
        return "bg-brand-secondary text-brand";
      case "free":
      default:
        return "border-primary text-brand bg-brand-secondary";
    }
  };

  const getRoleBadgeColor = (role: string) => {
    return role === "ADMIN"
      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
  };

  return (
    <>
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="border-primary bg-primary rounded-xl border p-6">
          <p className="text-secondary text-sm">Total Users</p>
          <p className="text-primary mt-2 text-3xl font-bold">{total}</p>
        </div>
        <div className="border-primary bg-primary rounded-xl border p-6">
          <p className="text-secondary text-sm">Free Plan</p>
          <p className="text-primary mt-2 text-3xl font-bold">{freeCount}</p>
        </div>
        <div className="border-primary bg-primary rounded-xl border p-6">
          <p className="text-secondary text-sm">Basic Plan</p>
          <p className="text-primary mt-2 text-3xl font-bold">{basicCount}</p>
        </div>
        <div className="border-primary bg-primary rounded-xl border p-6">
          <p className="text-secondary text-sm">Pro Plan</p>
          <p className="text-primary mt-2 text-3xl font-bold">{proCount}</p>
        </div>
      </div>

      <div className="border-primary bg-primary mb-6 rounded-xl border p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="text-secondary absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search by name, username, or email..."
              value={searchQuery}
              onChange={e => handleSearch(e.target.value)}
              className="input-field border-primary pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-secondary text-sm">Rows per page:</span>
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

      <div className="border-primary bg-primary rounded-xl border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-primary hover:bg-transparent">
                <TableHead className="text-primary font-semibold">
                  Name
                </TableHead>
                <TableHead className="text-primary font-semibold">
                  Email
                </TableHead>
                <TableHead className="text-primary font-semibold">
                  Username
                </TableHead>
                <TableHead className="text-primary font-semibold">
                  Plan
                </TableHead>
                <TableHead className="text-primary font-semibold">
                  Role
                </TableHead>
                <TableHead className="text-primary font-semibold">
                  Created At
                </TableHead>
                <TableHead className="text-primary font-semibold">
                  Updated At
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-secondary text-center">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map(user => (
                  <TableRow
                    key={user.id}
                    className="border-primary hover:bg-brand-secondary"
                  >
                    <TableCell className="text-primary font-medium">
                      {user.name}
                    </TableCell>
                    <TableCell className="text-secondary">
                      {user.email}
                    </TableCell>
                    <TableCell className="text-secondary">
                      @{user.username}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={getPlanBadgeColor(user.plan)}
                        variant="outline"
                      >
                        {user.plan}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={getRoleBadgeColor(user.role)}
                        variant="outline"
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-secondary text-sm">
                      {format(new Date(user.createdAt), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell className="text-secondary text-sm">
                      {format(new Date(user.updatedAt), "MMM dd, yyyy")}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="border-primary flex items-center justify-between border-t px-6 py-4">
          <p className="text-secondary text-sm">
            Showing {users.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}{" "}
            to {Math.min(currentPage * pageSize, total)} of {total} users
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
    </>
  );
};
