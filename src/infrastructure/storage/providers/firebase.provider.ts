import { initializeApp, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { IStorageProvider } from '../storage.interface';
import { v4 as uuid } from 'uuid';
import * as fs from 'fs';

initializeApp({
  credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT!)),
  storageBucket: process.env.FIREBASE_BUCKET!,
});

export class FirebaseProvider implements IStorageProvider {
  private bucket = getStorage().bucket();

  async upload(file: Express.Multer.File) {
    const key = `patterns/${uuid()}-${file.originalname}`;
    const fileUpload = this.bucket.file(key);

    await fileUpload.save(file.buffer, {
      contentType: file.mimetype,
      resumable: false,
    });

    const url = await fileUpload.getSignedUrl({
      action: 'read',
      expires: '03-01-2030',
    });

    return {
      url: url[0],
      key,
      provider: 'firebase',
    };
  }

  async delete(key: string) {
    await this.bucket.file(key).delete();
  }
}