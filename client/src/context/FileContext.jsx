import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const FileContext = createContext(null);
export const useFile = () => useContext(FileContext);

const BASE_URL = import.meta.env.VITE_BASE_URL;
const schema = z.object({
  imageKey: z.string().trim().min(1),
  imageFile: z.any().refine((f) => f instanceof File, "Image file is required"),
});

export const FileProvider = ({ children }) => {
  const form = useForm({
    resolver: zodResolver(schema),
    mode: "onSubmit",
    defaultValues: {
      imageKey: "",
      imageFile: null,
    },
  });

  const [files, setFiles] = useState([]);
  const fetchImages = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/minxs-music/images`);
      setFiles(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const { setValue } = form;

  const uploadPreview = async (file) => {
    const data = new FormData();
    data.append("image", file);

    const res = await axios.post(`${BASE_URL}/minxs-music/preview`, data);

    if (res.data?.imageKey) {
      setValue("imageKey", res.data.imageKey, {
        shouldValidate: false,
        shouldDirty: true,
      });
    }

    setValue("imageFile", file, { shouldValidate: true, shouldDirty: true });
    return res.data;
  };

  const saveImage = async (values) => {
    const data = new FormData();

    if (values.imageFile) data.append("image", values.imageFile);
    if (values.imageKey) data.append("imageKey", values.imageKey);

    const res = await axios.post(`${BASE_URL}/minxs-music/upload`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    await fetchImages();
    return res.data;
  };

  return (
    <FileContext.Provider
      value={{ form, uploadPreview, saveImage, files, fetchImages }}
    >
      {children}
    </FileContext.Provider>
  );
};
