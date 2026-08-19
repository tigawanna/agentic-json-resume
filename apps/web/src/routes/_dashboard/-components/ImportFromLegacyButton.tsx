import { Button } from "@/components/ui/button";
import { useViewer } from "@/data-access-layer/auth/viewer";
import { useEventSourcedDb } from "@/data-access-layer/event-sourced/provider";
import { unwrapUnknownError } from "@/utils/errors";
import { Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { formatImportToast } from "../-utils/import-from-legacy/fetch-pages";
import { legacyImporters, type LegacyImporterKey } from "../-utils/import-from-legacy/importers";

interface ImportFromLegacyButtonProps {
  importer: LegacyImporterKey;
}

export function ImportFromLegacyButton({ importer }: ImportFromLegacyButtonProps) {
  const db = useEventSourcedDb();
  const { viewer } = useViewer();
  const [pending, setPending] = useState(false);
  const spec = legacyImporters[importer];

  async function handleImport() {
    const userId = viewer.user?.id;
    if (!userId) {
      console.error(`[import ${importer}] missing signed-in user`);
      toast.error("Sign in to import from the old API");
      return;
    }

    setPending(true);
    try {
      const stats = await spec.run({ db, userId });
      if (stats.failed > 0) {
        toast.error(formatImportToast(spec.noun, stats), {
          description: "Open the console for [import …] errors",
        });
      } else {
        toast.success(formatImportToast(spec.noun, stats));
      }
    } catch (err: unknown) {
      console.error(`[import ${importer}] aborted`, err);
      toast.error("Import failed", {
        description: unwrapUnknownError(err).message,
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => void handleImport()}
      disabled={pending}
      data-test={`import-legacy-${importer}-btn`}
    >
      <Download className="mr-1 size-4" />
      {pending ? "Importing…" : "Import"}
    </Button>
  );
}
