import Nprogress from "@/components/navigation/nprogress/Nprogress";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { queryKeyPrefixes } from "@/data-access-layer/query-keys";
import { listEducation } from "@/data-access-layer/resume/education/education.functions";
import { deleteEducationMutationOptions } from "@/data-access-layer/resume/education/education.mutation-options";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Navigate } from "@tanstack/react-router";
import { GraduationCap, Loader, Plus } from "lucide-react";
import { useState } from "react";
import { Route } from "..";
import { EducationCreateFormDilaog } from "./EducationCreateForm";
import { EducationListCard } from "./EducationListCard";

export function EducationList() {
  const { sq, cursor, dir } = Route.useSearch();
  const [createOpen, setCreateOpen] = useState(false);
  const { data, isLoading, isRefetching } = useQuery({
    queryKey: [queryKeyPrefixes.education, "page", cursor, dir ?? "after", sq],
    queryFn: () => listEducation({ data: { cursor, direction: dir, keyword: sq } }),
    placeholderData: (prevData) => prevData,
  });
  const deleteMutation = useMutation(deleteEducationMutationOptions);

  if (isLoading) {
    return (
      <div className="flex w-full h-full flex-col gap-6" data-test="education-list-page">
        <Loader className="animate-spin" />
      </div>
    );
  }
  if (!data) {
    return (
      <div className="flex w-full h-full flex-col gap-6" data-test="education-list-page">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <GraduationCap className="text-muted-foreground size-12" />
            </EmptyMedia>
            <EmptyTitle>No Education Entries Yet</EmptyTitle>
            <EmptyDescription>
              You haven&apos;t added any education entries yet. Get started by adding your first
              education entry.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent className="flex-row justify-center gap-2">
            <Button>Create Education Entry</Button>
            <Button
              variant="outline"
              onClick={() => {
                Navigate({
                  to: ".",
                  search: (prev) => {
                    const { sq, cursor, dir, ...rest } = prev;
                    return rest;
                  },
                  replace: true,
                });
              }}
            >
              Clear filters
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCreateOpen(true)}
              data-test="add-education-btn"
            >
              <Plus className="mr-1 size-4" /> Add
            </Button>
          </EmptyContent>
          <EducationCreateFormDilaog open={createOpen} setOpen={setCreateOpen} />
        </Empty>
      </div>
    );
  }

  return (
    <div className="flex w-full h-full flex-col gap-6" data-test="education-list-page">
      <Nprogress isAnimating={isRefetching} />
      {data.items.length === 0 ? (
        <div className="flex flex-col h-full items-center justify-center gap-4 py-16">
          <GraduationCap className="text-muted-foreground size-12" />
          <p className="text-muted-foreground text-sm">
            No education entries found. Add education to your resumes first.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-test="education-list">
          {data.items.map((item) => (
            <EducationListCard
              key={item.id}
              education={item}
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
