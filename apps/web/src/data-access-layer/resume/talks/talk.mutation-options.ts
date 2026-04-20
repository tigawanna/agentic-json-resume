import { unwrapUnknownError } from "@/utils/errors";
import { mutationOptions } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeyPrefixes } from "../../query-keys";
import { deleteTalkFn } from "./talk.functions";

export const deleteTalkMutationOptions = mutationOptions({
  mutationFn: async (talkId: string) => deleteTalkFn({ data: { id: talkId } }),
  onSuccess() {
    toast.success("Talk deleted");
  },
  onError(err: unknown) {
    toast.error("Failed to delete talk", {
      description: unwrapUnknownError(err).message,
    });
  },
  meta: { invalidates: [[queryKeyPrefixes.talks], [queryKeyPrefixes.resumes]] },
});
