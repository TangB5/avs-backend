// storage.types.ts
export type UploadResult = {
  url: string;
  key: string;
  provider: 'supabase' | 'cloudinary' | 'aws' | 'firebase' | 'local';
  size?: number;
  mimeType?: string;
};