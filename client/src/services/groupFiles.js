export const groupFiles = (files) => {
  const grouped = {};
  const rootFiles = [];

  files.forEach((file) => {
    if (file.fileKey.includes("/")) {
      const [folder, ...rest] = file.fileKey.split("/");
      const fileName = rest.join("/");

      if (!grouped[folder]) grouped[folder] = [];

      grouped[folder].push({ ...file, fileName });
    } else {
      rootFiles.push({ ...file, fileName: file.fileKey });
    }
  });

  return { grouped, rootFiles };
};
