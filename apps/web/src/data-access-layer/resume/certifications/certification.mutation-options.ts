import { unwrapUnknownError } from "@/utils/errors";
import { mutationOptions } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeyPrefixes } from "../../query-keys";
import { deleteCertificationFn } from "./certification.functions";

export const deleteCertificationMutationOptions = mutationOptions({
  mutationFn: async (certId: string) => deleteCertificationFn({ data: { id: certId } }),
  onSuccess() {
    toast.success("Certification deleted");
  },
  onError(err: unknown) {
    toast.error("Failed to delete certification", {
      description: unwrapUnknownError(err).message,
    });
  },
  meta: { invalidates: [[queryKeyPrefixes.certifications], [queryKeyPrefixes.resumes]] },
});
