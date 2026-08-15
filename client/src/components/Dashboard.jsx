import axios from "axios";
import { toast } from "sonner";
import { useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { FolderClosed, FolderOpen, MoveLeft, Upload } from "lucide-react";
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
      <div className="panel rounded-2xl p-8 md:p-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="rail pl-5">
          <p className="text-[11px] uppercase tracking-[0.35em] text-muted-foreground">
            Media console
          </p>
          <h1 className="mt-2 text-3xl md:text-4xl font-bold text-gradient">
            Asset Library
          </h1>

          <div className="mt-3 flex gap-6">
            <div>
              <p className="text-2xl font-semibold">{folders.length}</p>
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                folders
              </p>
            </div>
            <div>
              <p className="text-2xl font-semibold">{files.length}</p>
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                files
              </p>
            </div>
          </div>
        </div>
        <Link
          to="/upload-image"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:opacity-90 hover:glow-ring"
        >
          <Upload size={16} />
          Upload Image
        </Link>
      </div>

      <div className="mt-10">
        <div className="rail pl-5">
          <h4 className="text-xl font-bold mb-1.5 uppercase">
            {folderName ? folderName : "Images"}
          </h4>
          <p className="text-sm text-muted-foreground">
            Total ({folderName ? folderFiles.length : files.length}) files
            {folderName ? " in this folder." : " uploaded."}
          </p>
        </div>

        {folderName && (
          <Button
            variant="outline"
            className="rounded-full border-border/80 bg-surface-elevated/60 transition-all duration-300 group mt-5"
            onClick={() => navigate("/")}
          >
            <span className="transition-transform duration-300 group-hover:-translate-x-1">
              <MoveLeft />
            </span>{" "}
            Back
          </Button>
        )}

        {folderName && (
          <div className="panel mt-5 flex flex-wrap gap-1.5 rounded-2xl p-3">
            <button
              onClick={() => setSelectedLetter(null)}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition ${
                selectedLetter === null
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface-elevated text-muted-foreground hover:text-foreground"
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
                      ? "bg-primary text-primary-foreground"
                      : hasFiles
                        ? "bg-surface-elevated text-muted-foreground hover:text-foreground"
                        : "bg-surface/60 text-muted-foreground/35 cursor-not-allowed"
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
                className="panel group p-6 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-500 hover:-translate-y-1 hover:glow-ring"
              >
                <FolderClosed
                  size={84}
                  strokeWidth={1}
                  className="group-hover:hidden text-muted-foreground"
                />
                <FolderOpen
                  size={84}
                  strokeWidth={1}
                  className="hidden group-hover:block text-primary"
                />

                <p className="mt-3 font-semibold tracking-tight">{folder}</p>
                <p className="text-xs text-muted-foreground font-mono mt-0.5 uppercase">
                  {files.filter((f) => f.folder === folder).length} files
                </p>
              </Link>
            ))}

          {/* Files inside folder */}
          {folderName && renderImages(visibleFiles)}
        </div>

        {folderName && visibleFiles.length === 0 && (
          <div className="panel mt-7 rounded-2xl p-10 text-center text-sm text-muted-foreground">
            Nothing here yet.
          </div>
        )}
      </div>
    </>
  );
};

export default Dashboard;
