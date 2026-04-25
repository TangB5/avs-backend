import { createClient } from '@supabase/supabase-js';
import { IStorageProvider } from '../storage.interface';
import { v4 as uuid } from 'uuid';

export class SupabaseProvider implements IStorageProvider {
  private client = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  private bucket = 'patterns';

  async upload(file: Express.Multer.File) {
    const key = `${uuid()}-${file.originalname}`;

    const { error } = await this.client.storage
      .from(this.bucket)
      .upload(key, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) throw error;

    const { data } = this.client.storage
      .from(this.bucket)
      .getPublicUrl(key);

    return {
      url: data.publicUrl,
      key,
      provider: 'supabase',
    };
  }

  async delete(key: string) {
    await this.client.storage.from(this.bucket).remove([key]);
  }
}