import { IStorageProvider, UploadResult } from './storage.interface';

export class StorageService {
  constructor(private providers: IStorageProvider[]) {}

  async upload(file: Express.Multer.File, folder?: string): Promise<UploadResult> {
    let lastError: any;

    for (const provider of this.providers) {
      try {
        return await provider.upload(file, folder);
      } catch (err) {
        lastError = err;
        console.error(`[Storage] Provider failed:`, provider.constructor.name);
      }
    }

    throw new Error(`All storage providers failed: ${lastError?.message}`);
  }

  async delete(key: string): Promise<void> {
    for (const provider of this.providers) {
      try {
        await provider.delete(key);
        return;
      } catch (err) {
        console.warn(`[Storage delete failed]:`, provider.constructor.name);
      }
    }
  }
}