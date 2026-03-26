export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
};

export const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const validateFile = (file: File): string | null => {
  if (!ALLOWED_TYPES.includes(file.type)) return "Formato não aceito. Use PDF, JPG ou PNG.";
  if (file.size > MAX_FILE_SIZE) return "Arquivo excede 5MB.";
  return null;
};
