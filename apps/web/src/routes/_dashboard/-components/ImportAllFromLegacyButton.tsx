import { Button } from "@/components/ui/button";
import { useViewer } from "@/data-access-layer/auth/viewer";
import { useEventSourcedDb } from "@/data-access-layer/event-sourced/provider";
import { unwrapUnknownError } from "@/utils/errors";
import { Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { formatImportToast } from "../-utils/import-from-legacy/fetch-pages";
import { importAllFromLegacy, legacyImportSequence } from "../-utils/import-from-legacy/importers";

const TOAST_ID = "import-all-legacy";

export function ImportAllFromLegacyButton() {
  const db = useEventSourcedDb();
  const { viewer } = useViewer();
  const [pending, setPending] = useState(false);
  const [progressLabel, setProgressLabel] = useState<string | null>(null);

  async function handleImport() {
    const userId = viewer.user?.id;
    if (!userId) {
      console.error("[import all] missing signed-in user");
      toast.error("Sign in to import from the old API");
      return;
    }

    setPending(true);
    setProgressLabel(`1/${legacyImportSequence.length}`);
    toast.loading("Importing remote library…", { id: TOAST_ID });

    try {
      const { totals } = await importAllFromLegacy({ db, userId }, (progress) => {
        const label = `${progress.index}/${progress.total} · ${progress.noun}`;
        setProgressLabel(label);
        toast.loading(`Importing ${progress.noun}…`, {
          id: TOAST_ID,
          description: `${progress.index} of ${progress.total} tables`,
        });
      });

      const summary = formatImportToast("rows", totals);
      if (totals.failed > 0) {
        toast.error(summary, {
          id: TOAST_ID,
          description: "Open the console for [import …] errors",
        });
      } else {
        toast.success(summary, {
          id: TOAST_ID,
          description: `${legacyImportSequence.length} tables processed`,
        });
      }
    } catch (err: unknown) {
      console.error("[import all] aborted", err);
      toast.error("Import failed", {
        id: TOAST_ID,
        description: unwrapUnknownError(err).message,
      });
    } finally {
      setPending(false);
      setProgressLabel(null);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => void handleImport()}
      disabled={pending}
      data-test="import-all-legacy-btn"
    >
      <Download className="mr-1 size-4" />
      {pending ? `Importing${progressLabel ? ` ${progressLabel}` : "…"}` : "Import remote library"}
    </Button>
  );
}
