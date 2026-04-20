import { Button } from "@/components/ui/button";
import {
  educationCollection,
  educationCollectionMetaQueryOptions,
} from "@/data-access-layer/resume/education/education.collection";
import { deleteEducationMutationOptions } from "@/data-access-layer/resume/education/education.mutation-options";
import { gt, ilike, or, useLiveSuspenseQuery } from "@tanstack/react-db";
import { useMutation, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, GraduationCap } from "lucide-react";
import { useState } from "react";
import { Route } from "..";
import { EducationListCard } from "./EducationListCard";

export function EducationList() {
  const { sq } = Route.useSearch();
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const cursor = cursorStack[cursorStack.length - 1] as string | undefined;

  const { data: items } = useLiveSuspenseQuery(
    (q) => {
      let query = q.from({ education: educationCollection });
      if (cursor) {
        query = query.where(({ education }) => gt(education.id, cursor));
      }
      if (sq) {
        const pattern = `%${sq}%`;
        query = query.where(({ education }) =>
          or(
            ilike(education.school, pattern),
            ilike(education.degree, pattern),
            ilike(education.field, pattern),
            ilike(education.description, pattern),
          ),
        );
      }
      return query;
    },
    [sq, cursor],
  );
  console.log("data from live query== ", items);
  const { data: meta } = useSuspenseQuery(educationCollectionMetaQueryOptions);
  console.log("meta== ", meta);
  const deleteMutation = useMutation(deleteEducationMutationOptions);

  function goNext() {
    if (meta?.nextCursor) {
      setCursorStack((prev) => [...prev, meta.nextCursor!]);
    }
  }

  function goPrevious() {
    setCursorStack((prev) => prev.slice(0, -1));
  }

  return (
    <div className="flex w-full h-full flex-col gap-6" data-test="education-list-page">
      <div className="flex-1" data-test="education-list">
        {items.length === 0 ? (
          <div className="flex flex-col h-full items-center justify-center gap-4 py-16">
            <GraduationCap className="text-muted-foreground size-12" />
            <p className="text-muted-foreground text-sm">
              No education entries found. Add education to your resumes first.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <EducationListCard
                key={item.id}
                education={item}
                onDelete={(id) => {
                  educationCollection.utils.writeDelete(id);
                  deleteMutation.mutate(id);
                }}
              />
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center justify-between border-t pt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={goPrevious}
          disabled={cursorStack.length === 0}
          data-test="pagination-prev"
        >
          <ChevronLeft className="mr-1 size-4" /> Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={goNext}
          disabled={!meta?.nextCursor}
          data-test="pagination-next"
        >
          Next <ChevronRight className="ml-1 size-4" />
        </Button>
      </div>
    </div>
  );
}
