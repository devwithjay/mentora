"use client";

import React, {useState} from "react";

import {useSession} from "next-auth/react";
import {toast} from "sonner";

import {createIssue} from "@/actions";
import {Button} from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";

const ReportIssuePage = () => {
  const {data: session} = useSession();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user?.id) {
      toast.error("You must be logged in to report an issue.");
      return;
    }

    setLoading(true);

    const form = new FormData(e.target as HTMLFormElement);
    const data = {
      userId: session.user.id,
      title: form.get("title")?.toString() ?? "",
      description: form.get("description")?.toString() ?? "",
      category: form.get("category")?.toString() ?? "",
    };

    const response = await createIssue(data);

    if (response.success) {
      toast.success("Issue reported successfully!");
      (e.target as HTMLFormElement).reset();
    } else {
      toast.error(
        typeof response.error === "string"
          ? response.error
          : "Failed to submit issue."
      );
    }

    setLoading(false);
  };

  return (
    <div className="bg-primary min-h-screen px-6 py-8 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <Card className="border-primary bg-primary shadow-sm">
          <CardHeader className="space-y-3 pb-6">
            <CardTitle className="text-primary text-3xl font-bold sm:text-4xl">
              Report an Issue
            </CardTitle>
            <CardDescription className="text-secondary text-base">
              Facing a bug or unexpected behaviour? Tell us what went wrong —
              we&apos;ll look into it.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="title"
                  className="text-primary text-sm font-medium"
                >
                  Title <span className="text-brand">*</span>
                </Label>
                <Input
                  id="title"
                  name="title"
                  required
                  className="input-field border-primary"
                  placeholder="Brief summary of the issue"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="category"
                  className="text-primary text-sm font-medium"
                >
                  Category <span className="text-brand">*</span>
                </Label>
                <Input
                  id="category"
                  name="category"
                  required
                  placeholder="UI, Payment, Chat, Account, etc."
                  className="input-field border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="description"
                  className="text-primary text-sm font-medium"
                >
                  Description <span className="text-brand">*</span>
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  required
                  className="input-field border-primary h-40 resize-none"
                  placeholder="Explain exactly what went wrong..."
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="btn-primary w-full font-semibold sm:w-auto"
              >
                {loading ? "Submitting..." : "Submit Issue"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportIssuePage;
