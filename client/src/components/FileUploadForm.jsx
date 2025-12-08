import { cn } from "../lib/utils";
import { useEffect, useState } from "react";
import { useFile } from "../context/FileContext";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { FileKey, ImageUp, MoveLeft, RotateCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getFormatedDate } from "../services/getFormatedDate";

const FileUploadForm = () => {
  const { form, uploadPreview, saveImage } = useFile();
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [fileSize, setFileSize] = useState(null);
  const [formatedDate, setFormatedDate] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setFormatedDate(getFormatedDate());
  }, []);

  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    form.setValue("imageFile", file);

    try {
      setProgress(0);
      setStatus("Getting preview...");
      for (let i = 1; i <= 100; i += 20) {
        await new Promise((r) => setTimeout(r, 80));
        setProgress(i);
      }

      const res = await uploadPreview(file);
      if (res?.size) setFileSize(res.size);

      toast.info("Preview Ready");
    } catch (error) {
      console.error(error.response);
      toast.error(error.response?.data?.error || "preview upload failed");
    } finally {
      setTimeout(() => {
        setProgress(0);
        setStatus("");
      }, 800);
    }

    e.target.value = "";
  };

  const resetForm = () => {
    form.reset({
      imageKey: "",
      imageFile: null,
    });
    setFileSize(null);
    setFormatedDate(getFormatedDate());
  };

  const onSubmit = async (values) => {
    try {
      if (!values.imageKey || !values.imageFile) {
        toast.error("No file to save. Please upload a preview first.");
        return;
      }

      setProgress(0);
      setStatus("Saving file...");
      for (let i = 1; i <= 100; i += 10) {
        await new Promise((r) => setTimeout(r, 100));
      }

      const res = await saveImage(values);
      toast.success("Image Saved!", { description: res?.fileKey });

      resetForm();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || "failed to save file");
    } finally {
      setTimeout(() => {
        setProgress(0);
        setStatus("");
      }, 800);
    }
  };

  return (
    <>
      {/* Back button */}
      <div className="mb-5">
        <Button
          variant="outline"
          className="rounded-full transition-all duration-300 group"
          onClick={() => navigate(-1)}
        >
          <span className="transition-transform duration-300 group-hover:-translate-x-1">
            <MoveLeft />
          </span>{" "}
          Back
        </Button>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4 p-6 bg-card rounded-lg"
        >
          <FormField
            name="imageFile"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (file) onFileChange({ target: { files: [file] } });
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDragEnter={(e) => e.preventDefault()}
                  >
                    <Label
                      className={cn(
                        "flex flex-col items-center justify-center border border-dashed bg-zinc-800/40 hover:bg-zinc-800 rounded cursor-pointer transition text-center min-h-[200px]",
                        form.formState.errors.imageFile
                          ? "border-red-500"
                          : "border-zinc-600"
                      )}
                    >
                      <ImageUp size={40} className="text-zinc-400" />
                      <p className="mb-0 mt-2 text-sm text-blue-200">
                        {form.getValues("imageFile")?.name ||
                          "Choose an image or drag & drop"}
                      </p>
                      <Input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          field.onChange(e.target.files?.[0]);
                          onFileChange(e);
                        }}
                      />
                    </Label>
                  </div>
                </FormControl>

                {status && (
                  <div className="flex flex-col gap-1 mt-3">
                    <p className="text-xs text-blue-300">
                      {status} ({progress}%)
                    </p>
                    <Progress value={progress} className="h-2 bg-zinc-700" />
                  </div>
                )}

                {fileSize && (
                  <div className="mt-2">
                    <Badge variant="secondary" className="text-xs px-2 py-1">
                      {`Size: ${
                        fileSize >= 1024 * 1024
                          ? `${(fileSize / (1024 * 1024)).toFixed(2)} MB`
                          : `${(fileSize / 1024).toFixed(2)} KB`
                      }`}
                    </Badge>
                  </div>
                )}
              </FormItem>
            )}
          />

          <FormField
            name="imageKey"
            control={form.control}
            render={({ field }) => (
              <FormItem className="mt-6">
                <FormLabel htmlFor="imageKey">Image Key</FormLabel>
                <FormControl>
                  <div className="relative">
                    <FileKey className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      {...field}
                      id="imageKey"
                      autoComplete="off"
                      className="pl-8 py-5.5"
                      placeholder="folder/filename.ext"
                      disabled={form.formState.isSubmitting}
                    />
                  </div>
                </FormControl>
              </FormItem>
            )}
          />

          <div className="flex gap-3 items-center">
            <Button
              size="icon"
              type="button"
              disabled={form.formState.isSubmitting}
              onClick={() => setFormatedDate(getFormatedDate())}
            >
              <RotateCw />
            </Button>
            <p className="text-lg font-medium">{formatedDate}</p>
          </div>

          <Button
            type="button"
            disabled={form.formState.isSubmitting}
            onClick={resetForm}
            className="cursor-pointer text-white bg-red-500 hover:bg-red-600 py-5.5"
          >
            Reset
          </Button>

          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="cursor-pointer text-white  bg-emerald-600 hover:bg-emerald-700 py-6"
          >
            {form.formState.isSubmitting ? "Saving..." : "Save Image"}
          </Button>
        </form>
      </Form>
    </>
  );
};

export default FileUploadForm;
