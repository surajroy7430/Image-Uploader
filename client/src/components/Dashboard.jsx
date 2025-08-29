import { Link } from "react-router-dom";
import { toast } from "sonner";
import { ExternalLink, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useFile } from "../context/FileContext";
import axios from "axios";

const Dashboard = () => {
  const { files, fetchImages } = useFile();

  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/minxs-music/delete/${id}`
      );
      toast.success("File Deleted");
      await fetchImages();
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.error || "Delete failed");
    }
  };

  // console.log(files);

  return (
    <>
      <div className="text-center">
        <Link
          to="/upload-image"
          className="bg-red-600 hover:bg-red-700 py-2.5 px-10 rounded-full"
        >
          Upload Image
        </Link>
      </div>
      <div className="mt-10">
        <div className="">
          <h4 className="text-xl font-bold mb-1.5">Images</h4>
          <p className="text-zinc-500">
            Total ({files.length}) files uploaded.
          </p>
        </div>
        <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {files
            .slice()
            .sort((a, b) =>
              a.fileKey
                .replace("uploads/", "")
                .localeCompare(b.fileKey.replace("uploads/", ""))
            )
            .map((file) => {
              const fileName = file.fileKey.replace("uploads/", "");
              const fileSize =
                file.fileSize >= 1024 * 1024
                  ? `${(file.fileSize / (1024 * 1024)).toFixed(2)} MB`
                  : `${(file.fileSize / 1024).toFixed(2)} KB`;

              return (
                <div
                  key={file._id}
                  className="relative h-60 aspect-auto overflow-hidden rounded-lg group"
                >
                  {/* Image */}
                  <img
                    src={file.fileUrl}
                    alt={fileName}
                    loading="lazy"
                    className="w-full h-full object-fill"
                  />

                  {/* Overlay Content */}
                  <div className="absolute inset-0 bg-black/40 flex flex-col justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex justify-between p-4 items-center">
                      <Trash2
                        size={20}
                        onClick={() => handleDelete(file._id)}
                        className="text-red-100 hover:text-red-600 cursor-pointer transition"
                      />
                      <a
                        href={file.fileUrl}
                        rel="nooperner noreferrer"
                        target="_blank"
                      >
                        <ExternalLink
                          size={20}
                          className="text-zinc-300 hover:text-blue-600 transition"
                        />
                      </a>
                    </div>

                    {/* File Info */}
                    <div className="text-xs md:text-sm p-3 space-y-0.5 pointer-events-none">
                      <div className="font-semibold text-center">
                        {fileName}
                      </div>
                      <div className="text-center mt-1">
                        <Badge className="bg-muted/30 text-zinc-300">
                          {fileSize}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
