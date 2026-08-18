import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export type ResponsiveColumn<T> = {
  id: string;
  header: string;
  /** Desktop table cell */
  cell: (row: T) => ReactNode;
  /** Optional mobile label; defaults to header */
  mobileLabel?: string;
  /** Hide this column on the mobile stack (still shown in table) */
  hideOnMobile?: boolean;
  className?: string;
  headClassName?: string;
};

type ResponsiveEntityTableProps<T extends { id: string }> = {
  rows: T[];
  columns: ResponsiveColumn<T>[];
  /** Primary line on mobile (defaults to first non-hidden column) */
  mobileTitle?: (row: T) => ReactNode;
  /** Secondary line under the title on mobile */
  mobileSubtitle?: (row: T) => ReactNode;
  actions?: (row: T) => ReactNode;
  dataTest?: string;
  empty?: ReactNode;
};

/**
 * Desktop: real table. Mobile: stacked rows with labeled fields
 * (tables are painful on narrow viewports).
 */
export function ResponsiveEntityTable<T extends { id: string }>({
  rows,
  columns,
  mobileTitle,
  mobileSubtitle,
  actions,
  dataTest,
  empty,
}: ResponsiveEntityTableProps<T>) {
  if (rows.length === 0) {
    return <>{empty ?? null}</>;
  }

  const mobileColumns = columns.filter((c) => !c.hideOnMobile);

  return (
    <div data-test={dataTest}>
      {/* Desktop / tablet table */}
      <div className="border-border hidden overflow-hidden rounded-lg border md:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              {columns.map((col) => (
                <TableHead key={col.id} className={col.headClassName}>
                  {col.header}
                </TableHead>
              ))}
              {actions ? <TableHead className="w-[1%] text-right">Actions</TableHead> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id} data-test={`row-${row.id}`}>
                {columns.map((col) => (
                  <TableCell key={col.id} className={cn("max-w-md truncate", col.className)}>
                    {col.cell(row)}
                  </TableCell>
                ))}
                {actions ? (
                  <TableCell className="text-right whitespace-nowrap">{actions(row)}</TableCell>
                ) : null}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile stacked fallback */}
      <ul className="flex flex-col gap-3 md:hidden" data-test={`${dataTest ?? "list"}-mobile`}>
        {rows.map((row) => {
          const title = mobileTitle?.(row) ?? mobileColumns[0]?.cell(row) ?? null;
          const subtitle = mobileSubtitle?.(row);

          return (
            <li
              key={row.id}
              className="border-border bg-base-100 rounded-lg border p-4"
              data-test={`mobile-row-${row.id}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{title}</div>
                  {subtitle ? (
                    <div className="text-muted-foreground mt-0.5 truncate text-xs">{subtitle}</div>
                  ) : null}
                </div>
                {actions ? (
                  <div className="flex shrink-0 items-center gap-0.5">{actions(row)}</div>
                ) : null}
              </div>
              <dl className="mt-3 space-y-1.5">
                {(mobileTitle ? mobileColumns.slice(1) : mobileColumns).map((col) => (
                  <div key={col.id} className="flex gap-3 text-xs">
                    <dt className="text-muted-foreground w-24 shrink-0">
                      {col.mobileLabel ?? col.header}
                    </dt>
                    <dd className="min-w-0 flex-1 truncate font-medium">{col.cell(row)}</dd>
                  </div>
                ))}
              </dl>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
