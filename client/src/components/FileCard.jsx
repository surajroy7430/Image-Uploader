import { ExternalLink, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const FileCard = ({ file, onDelete }) => {
  const fileSize =
    file.fileSize >= 1024 * 1024
      ? `${(file.fileSize / (1024 * 1024)).toFixed(2)} MB`
      : `${(file.fileSize / 1024).toFixed(2)} KB`;

  return (
    <div className="relative h-60 aspect-auto overflow-hidden rounded-lg group">
      {/* Image */}
      <img
        src={file.fileUrl}
        alt={file.fileName}
        loading="eager"
        className="w-full h-full object-contain rounded-lg"
      />

      {/* Overlay Content */}
      <div className="absolute inset-0 bg-black/40 flex flex-col justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="flex justify-between p-4 items-center">
          <Trash2
            size={20}
            onClick={() => onDelete(file.fileKey)}
            className="text-red-100 hover:text-red-600 cursor-pointer transition"
          />
          <a href={file.fileUrl} rel="nooperner noreferrer" target="_blank">
            <ExternalLink
              size={20}
              className="text-zinc-300 hover:text-blue-600 transition"
            />
          </a>
        </div>

        {/* File Info */}
        <div className="text-xs md:text-sm p-3 space-y-0.5 pointer-events-none">
          <div className="font-semibold text-center">{file.fileName}</div>
          <div className="text-center mt-1">
            <Badge className="bg-muted/30 text-zinc-300">{fileSize}</Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileCard;
