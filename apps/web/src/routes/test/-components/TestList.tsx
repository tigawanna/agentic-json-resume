import {
  experimentsCollection,
  experimentsCollectionMetaQueryOptions,
} from "@/data-access-layer/experiments/query-collection";
import { gt, useLiveSuspenseQuery } from "@tanstack/react-db";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";

export default function TestList() {
  const [nextCursor, setNextCursor] = useState<number | undefined>(undefined);
  const { data } = useLiveSuspenseQuery(
    (q) =>
      q
        .from({ exp: experimentsCollection })
        .where(({ exp }) => gt(exp.id, String(nextCursor ?? 0)))
        .orderBy(({ exp }) => exp.id, "asc")
        .limit(12),
    [nextCursor],
  );
  const metaQuery = useSuspenseQuery(experimentsCollectionMetaQueryOptions);
  console.log("Meta query data:", metaQuery.data);
  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold">Experiment List</h1>
      <ul className="w-full h-full flex flex-wrap gap-4 items-start justify-center mt-4">
        {data.map((item) => (
          <li key={item.id} className="p-4 border rounded bg-base-200 w-[23%]">
            <h2 className="text-3xl font-semibold card-body">{item.name}</h2>
          </li>
        ))}
      </ul>
      {metaQuery.data?.nextCursor && (
        <button
          onClick={() => setNextCursor(Number(metaQuery.data?.nextCursor))}
          className="mt-4 p-2 bg-blue-500 text-white rounded"
        >
          Load More
        </button>
      )}
    </div>
  );
}
