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

  const isProcessing = status !== "";

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
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Button
          variant="outline"
          className="rounded-full border-border/80 bg-surface-elevated/60 transition-all duration-300 group"
          onClick={() => navigate(-1)}
        >
          <span className="transition-transform duration-300 group-hover:-translate-x-1">
            <MoveLeft />
          </span>{" "}
          Back
        </Button>

        <div className="text-right">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
            New <span className="text-gradient">upload</span>
          </h2>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            drop · preview · save
          </p>
        </div>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="panel flex flex-col gap-4 rounded-2xl p-6 md:p-8"
        >
          <FormField
            name="imageFile"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div
                    onDrop={(e) => {
                      if (isProcessing) return; // disable drag drop
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (file) onFileChange({ target: { files: [file] } });
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDragEnter={(e) => e.preventDefault()}
                    className={
                      isProcessing ? "opacity-50 pointer-events-none" : ""
                    }
                  >
                    <Label
                      className={cn(
                        "flex flex-col items-center justify-center gap-1 rounded-2xl border border-dashed bg-surface/50 cursor-pointer transition-all duration-300 text-center min-h-[220px] hover:bg-surface-elevated/70 hover:border-primary/60",
                        isProcessing && "cursor-not-allowed opacity-50",
                        form.formState.errors.imageFile
                          ? "border-destructive"
                          : "border-border",
                      )}
                    >
                      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-surface-elevated text-primary">
                        <ImageUp size={26} />
                      </span>
                      <p className="mt-3 text-sm font-medium">
                        {form.getValues("imageFile")?.name ||
                          "Choose an image or drag & drop"}
                      </p>
                      <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                        png · jpg · webp
                      </p>

                      <Input
                        type="file"
                        accept="image/*"
                        disabled={isProcessing}
                        className="hidden"
                        onChange={(e) => {
                          if (isProcessing) return;

                          field.onChange(e.target.files?.[0]);
                          onFileChange(e);
                        }}
                      />
                    </Label>
                  </div>
                </FormControl>

                {status && (
                  <div className="flex flex-col gap-1.5 mt-4">
                    <p className="text-xs font-medium text-signal">
                      {status} ({progress}%)
                    </p>
                    <Progress
                      value={progress}
                      className="h-1.5 bg-surface-elevated"
                    />
                  </div>
                )}

                {fileSize && (
                  <div className="mt-3">
                    <Badge
                      variant="secondary"
                      className="border border-border/70 bg-surface-elevated/80 text-[11px] text-muted-foreground"
                    >
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
              <FormItem className="mt-4">
                <FormLabel
                  htmlFor="imageKey"
                  className="text-xs uppercase tracking-[0.2em] text-muted-foreground"
                >
                  Image Key
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <FileKey className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      {...field}
                      id="imageKey"
                      autoComplete="off"
                      className="h-12 bg-surface/60 pl-10"
                      placeholder="folder/filename.ext"
                      disabled={form.formState.isSubmitting}
                    />
                  </div>
                </FormControl>
              </FormItem>
            )}
          />

          <div className="flex items-center gap-3 rounded-lg border border-border/70 bg-surface/50 p-3">
            <Button
              size="icon"
              type="button"
              className="rounded-full"
              disabled={form.formState.isSubmitting}
              onClick={() => setFormatedDate(getFormatedDate())}
            >
              <RotateCw />
            </Button>
            <p className="text-base font-medium text-muted-foreground">
              {formatedDate}
            </p>
          </div>

          <div className="mt-2 flex flex-col gap-3 sm:flex-row-reverse">
            <Button
              type="button"
              variant="outline"
              onClick={resetForm}
              disabled={form.formState.isSubmitting}
              className="h-12 flex-1 rounded-full border-border/80 bg-surface-elevated/60 hover:text-destructive hover:bg-destructive/15"
            >
              Reset
            </Button>

            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="h-12 flex-[2] rounded-full transition-all duration-300 hover:glow-ring"
            >
              {form.formState.isSubmitting ? "Saving..." : "Save Image"}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
};

export default FileUploadForm;
