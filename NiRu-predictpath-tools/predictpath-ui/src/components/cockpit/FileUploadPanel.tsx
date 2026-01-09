import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  status: "pending" | "ready" | "error";
  serverPath?: string;
}

interface FileUploadPanelProps {
  onFilesReady: (files: UploadedFile[]) => void;
  onClear: () => void;
}

const API_BASE = "http://localhost:8000";

export const FileUploadPanel = ({ onFilesReady, onClear }: FileUploadPanelProps) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      processFiles(selectedFiles);
    }
  }, []);

  const processFiles = async (newFiles: File[]) => {
    // 1. Create Placeholder Entries
    const newEntries: UploadedFile[] = newFiles.map(file => ({
      id: `file-${Date.now()}-${file.name}`,
      name: file.name,
      size: file.size,
      status: "pending"
    }));

    setFiles(prev => [...prev, ...newEntries]);

    // 2. Upload Each File
    const updatedEntries = [...newEntries];

    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];
      const entry = updatedEntries[i];

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch(`${API_BASE}/api/upload`, {
          method: "POST",
          body: formData
        });

        if (!res.ok) throw new Error("Upload Failed");

        const data = await res.json();
        entry.status = "ready";
        entry.serverPath = data.path; // e.g. "data/uploads/filename"

      } catch (err) {
        entry.status = "error";
        console.error(err);
      }
    }

    // 3. Update State & Notify Parent
    setFiles(prev => {
      // Merge pending updates
      const final = prev.map(p => {
        const updated = updatedEntries.find(u => u.id === p.id);
        return updated || p;
      });

      // Only notify parent of READY files
      const readyFiles = final.filter(f => f.status === "ready");
      onFilesReady(readyFiles);

      return final;
    });
  };

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const updated = prev.filter((f) => f.id !== id);
      onFilesReady(updated.filter(f => f.status === "ready"));
      return updated;
    });
  };

  const handleClearAll = () => {
    setFiles([]);
    onClear();
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="p-4 border-b border-border bg-card/50">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Upload className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Log Files for Tool 1</span>
        </div>
        {files.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="h-7 text-xs text-muted-foreground hover:text-destructive"
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-4 text-center transition-all cursor-pointer
          ${isDragging
            ? "border-primary bg-primary/10"
            : "border-border hover:border-primary/50 hover:bg-card/80"
          }
        `}
      >
        <input
          type="file"
          multiple
          accept=".log,.txt,.json,.csv,.evtx,.xml"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="flex flex-col items-center gap-2">
          <div className={`p-2 rounded-full transition-colors ${isDragging ? "bg-primary/20" : "bg-muted"}`}>
            <Upload className={`h-5 w-5 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
          </div>
          <div className="text-xs">
            <span className="text-muted-foreground">Drop log files or </span>
            <span className="text-primary underline underline-offset-2">browse</span>
          </div>
          <p className="text-[10px] text-muted-foreground">
            .log, .txt, .json, .csv, .evtx, .xml
          </p>
        </div>
      </div>

      {/* File List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 space-y-2"
          >
            {files.map((file) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-2 p-2 rounded bg-background/50 border border-border"
              >
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{file.name}</p>
                  <p className="text-[10px] text-muted-foreground">{formatSize(file.size)}</p>
                </div>
                {file.status === "pending" && (
                  <Loader2 className="h-4 w-4 text-primary animate-spin shrink-0" />
                )}
                {file.status === "ready" && (
                  <CheckCircle className="h-4 w-4 text-success shrink-0" />
                )}
                {file.status === "error" && (
                  <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0"
                  onClick={() => removeFile(file.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </motion.div>
            ))}

            <div className="pt-2 border-t border-border">
              <p className="text-[10px] text-muted-foreground text-center">
                {files.filter(f => f.status === "ready").length} file(s) ready for Tool 1 ingestion
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export type { UploadedFile };
