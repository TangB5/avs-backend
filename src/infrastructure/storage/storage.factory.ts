import { StorageService } from './storage.service';
import { SupabaseProvider } from './providers/supabase.provider';
import { CloudinaryProvider } from './providers/cloudinary.provider';
import { AwsProvider } from './providers/aws.provider';
import { FirebaseProvider } from './providers/firebase.provider';

export function createStorageService() {
  const providers = [];

  // ordre = priorité (important pour fallback)
  if (process.env.SUPABASE_URL) {
    providers.push(new SupabaseProvider());
  }

  if (process.env.CLOUDINARY_CLOUD_NAME) {
    providers.push(new CloudinaryProvider());
  }

  if (process.env.AWS_BUCKET) {
    providers.push(new AwsProvider());
  }

  if (process.env.FIREBASE_BUCKET) {
    providers.push(new FirebaseProvider());
  }

  return new StorageService(providers);
}