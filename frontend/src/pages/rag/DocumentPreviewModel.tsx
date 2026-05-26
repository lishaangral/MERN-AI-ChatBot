import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { getDocumentPreviewUrl, getGeminiPreviewUrl } from "@/helpers/api-communicator";

type RagDocument = {
  docId: string;
  filename: string;
  fileUrl: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  document: RagDocument | null;
  pageNumber?: number;
  isGemini?: boolean;
};

export default function DocumentPreviewModal({
  open,
  onClose,
  document,
  pageNumber = 1,
  isGemini = false,
}: Props) {

  const [previewUrl, setPreviewUrl] = useState("");
  useEffect(() => {

    if (!document) return;

    async function loadPreview() {

        const res = isGemini
            ? await getGeminiPreviewUrl(
                document.docId
                )
            : await getDocumentPreviewUrl(
                document.docId
                );
        setPreviewUrl(res.url);
    }

    loadPreview();

    }, [document, isGemini]);

  if (!open || !document) return null;

  const isPdf = document.filename
    .toLowerCase()
    .endsWith(".pdf");

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">

            <div className="relative flex h-[94vh] w-[96vw] max-w-[1800px] flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">

            {/* HEADER */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4 shrink-0">

                <div className="min-w-0">
                <h2 className="truncate text-lg font-semibold text-surface-foreground">
                    {document.filename}
                </h2>

                <p className="text-sm text-surface-foreground/60">
                    Document Preview
                </p>
                </div>

                <button
                onClick={onClose}
                className="rounded-lg p-2 text-surface-foreground/40 transition-all hover:bg-white/5 hover:text-destructive"
                >
                <X className="h-5 w-5" />
                </button>
            </div>

            {/* CONTENT */}
            <div className="flex-1 overflow-hidden bg-background">

                {isPdf ? (

                previewUrl ? (

                    <iframe
                    src={`${previewUrl}#page=${pageNumber}`}
                    className="h-full w-full border-0"
                    />

                ) : (

                    <div className="flex h-full items-center justify-center">
                    <div className="flex flex-col items-center gap-3">

                        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />

                        <p className="text-sm text-surface-foreground/60">
                        Loading document preview...
                        </p>

                    </div>
                    </div>

                )

                ) : (

                <div className="flex h-full items-center justify-center">

                    <div className="rounded-2xl border border-border bg-surface px-8 py-6 text-center">

                    <p className="text-lg font-medium text-surface-foreground">
                        Preview not supported
                    </p>

                    <p className="mt-2 text-sm text-surface-foreground/60">
                        This file type cannot be previewed yet.
                    </p>

                    </div>

                </div>

                )}

            </div>
            </div>
        </div>
    );
}