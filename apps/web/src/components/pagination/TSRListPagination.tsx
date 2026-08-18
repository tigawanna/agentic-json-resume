import { Button } from "@/components/ui/button";
import type { TRouteID } from "@/lib/tanstack/router/router-types";
import { getRouteApi } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";

type TSRListPaginationProps = {
  routeID: TRouteID;
  totalPages: number;
};

/**
 * Page controls driven by the route's `page` search param.
 * Returns null when there is nothing to paginate.
 */
export function TSRListPagination({ routeID, totalPages }: TSRListPaginationProps) {
  const routeApi = getRouteApi(routeID);
  const search = routeApi.useSearch();
  const navigate = routeApi.useNavigate();

  if (totalPages <= 1) return null;

  const page =
    "page" in search && typeof search.page === "number" && search.page > 0 ? search.page : 1;

  function goTo(nextPage: number) {
    void navigate({
      search: (prev) => ({
        ...prev,
        page: nextPage <= 1 ? undefined : nextPage,
      }),
    });
  }

  return (
    <div className="flex items-center justify-between border-t pt-4" data-test="list-pagination">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => goTo(page - 1)}
        disabled={page <= 1}
        data-test="pagination-prev"
      >
        <ChevronLeft className="mr-1 size-4" /> Previous
      </Button>
      <span className="text-muted-foreground text-sm">
        Page {page} of {totalPages}
      </span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => goTo(page + 1)}
        disabled={page >= totalPages}
        data-test="pagination-next"
      >
        Next <ChevronRight className="ml-1 size-4" />
      </Button>
    </div>
  );
}
