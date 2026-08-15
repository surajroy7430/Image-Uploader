import { ExternalLink, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const FileCard = ({ file, onDelete }) => {
  const fileSize =
    file.fileSize >= 1024 * 1024
      ? `${(file.fileSize / (1024 * 1024)).toFixed(2)} MB`
      : `${(file.fileSize / 1024).toFixed(2)} KB`;

  return (
    <div className="panel relative h-60 aspect-auto overflow-hidden rounded-lg group transition-all duration-500 hover:-translate-y-1 hover:glow-ring">
      {/* Image */}
      <img
        src={file.fileUrl}
        alt={file.fileName}
        loading="lazy"
        className="w-full h-full object-fill rounded-lg transition-transform duration-700 group-hover:scale-105"
      />

      {/* Overlay Content */}
      <div className="absolute inset-0 flex flex-col justify-between rounded-lg bg-gradient-to-t from-background/95 via-background/35 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="flex items-center justify-between p-4">
          <button
            type="button"
            onClick={() => onDelete(file.fileKey)}
            className="grid size-9 place-items-center rounded-full border border-border bg-surface/80 text-muted-foreground hover:text-destructive hover:border-destructive/60 cursor-pointer transition"
          >
            <Trash2 size={16} />
          </button>

          <a
            href={file.fileUrl}
            rel="nooperner noreferrer"
            target="_blank"
            className="grid size-9 place-items-center rounded-full border border-border bg-surface/80 text-muted-foreground hover:text-signal hover:border-signal/60 transition"
          >
            <ExternalLink size={16} />
          </a>
        </div>

        {/* File Info */}
        <div className="text-xs md:text-sm p-4 space-y-1 pointer-events-none">
          <div className="font-semibold text-center tracking-tight truncate">
            {file.fileName}
          </div>
          <div className="text-center mt-1">
            <Badge className="bg-surface-elevated text-muted-foreground border border-border font-mono">
              {fileSize}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileCard;
