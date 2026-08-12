import axios from "axios";
import { toast } from "sonner";
import { useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { FolderClosed, FolderOpen, MoveLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFile } from "../context/FileContext";
import FileCard from "./FileCard";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const Dashboard = () => {
  const { folderName } = useParams();
  const navigate = useNavigate();

  const { files, fetchImages } = useFile();
  const [selectedLetter, setSelectedLetter] = useState(null);

  const folders = [...new Set(files.map((f) => f.folder))].sort();

  const folderFiles = files.filter((f) => f.folder === folderName);

  const availableLetters = useMemo(() => {
    const set = new Set(
      folderFiles.map((f) => f.fileName?.[0]?.toUpperCase()).filter(Boolean),
    );
    return set;
  }, [folderFiles]);

  const visibleFiles = selectedLetter
    ? folderFiles.filter(
        (f) => f.fileName?.[0]?.toUpperCase() === selectedLetter,
      )
    : folderFiles;

  const handleDelete = async (fileKey) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/minxs-music/delete`,
        {
          params: { fileKey },
        },
      );

      toast.success("File Deleted");
      await fetchImages();

      if (folderName && folderFiles.length === 0) navigate("/");
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.error || "Delete failed");
    }
  };

  const renderImages = (list = []) =>
    list
      .slice()
      .sort((a, b) => a.fileName.localeCompare(b.fileName))
      .map((file, i) => (
        <FileCard key={file._id ?? i} file={file} onDelete={handleDelete} />
      ));

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
        <div>
          <h4 className="text-xl font-bold mb-1.5">Images</h4>
          <p className="text-zinc-500">
            Total ({files.length}) files uploaded.
          </p>
        </div>

        {folderName && (
          <Button
            variant="outline"
            className="rounded-full transition-all duration-300 group mt-4"
            onClick={() => navigate("/")}
          >
            <span className="transition-transform duration-300 group-hover:-translate-x-1">
              <MoveLeft />
            </span>{" "}
            Back
          </Button>
        )}

        {folderName && (
          <div className="mt-5 flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedLetter(null)}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition ${
                selectedLetter === null
                  ? "bg-red-600 text-white"
                  : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
              }`}
            >
              All
            </button>

            {ALPHABET.map((letter) => {
              const hasFiles = availableLetters.has(letter);
              const isActive = selectedLetter === letter;

              return (
                <button
                  key={letter}
                  disabled={!hasFiles}
                  onClick={() => setSelectedLetter(letter)}
                  className={`w-7 h-7 flex items-center justify-center text-xs font-semibold rounded-full transition ${
                    isActive
                      ? "bg-red-600 text-white"
                      : hasFiles
                        ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                        : "bg-zinc-900 text-zinc-600 cursor-not-allowed"
                  }`}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {!folderName &&
            folders.map((folder) => (
              <Link
                key={folder}
                to={`/folder/${folder}`}
                className="group p-5 rounded-lg bg-zinc-900 text-white flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-800 transition"
              >
                <FolderClosed size={100} className="group-hover:hidden" />
                <FolderOpen size={100} className="hidden group-hover:block" />

                <p className="mt-2 font-semibold">{folder}</p>
                <p className="text-xs text-zinc-400">
                  {files.filter((f) => f.folder === folder).length} files
                </p>
              </Link>
            ))}

          {/* Files inside folder */}
          {folderName && renderImages(visibleFiles)}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
