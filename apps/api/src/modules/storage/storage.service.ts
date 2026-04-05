import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Storage } from '@google-cloud/storage';
import { randomUUID } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly storage: Storage | null;
  private readonly bucketName: string | null;
  private readonly localUploadDir = '/tmp/uploads';

  constructor(private readonly config: ConfigService) {
    const bucketName = this.config.get<string>('GCS_BUCKET_NAME');
    const projectId = this.config.get<string>('GCP_PROJECT_ID');

    if (bucketName && projectId) {
      this.storage = new Storage({ projectId });
      this.bucketName = bucketName;
      this.logger.log('StorageService initialized with Google Cloud Storage');
    } else {
      this.storage = null;
      this.bucketName = null;
      this.logger.warn(
        'GCS env vars not set — using local file storage fallback at /tmp/uploads',
      );
      if (!fs.existsSync(this.localUploadDir)) {
        fs.mkdirSync(this.localUploadDir, { recursive: true });
      }
    }
  }

  async upload(
    file: Buffer,
    filename: string,
    mimeType: string,
    householdId: string,
  ): Promise<string> {
    const mimeExtension = this.extensionFromMime(mimeType);
    const filenameExtension = path.extname(filename).toLowerCase();
    const ext =
      mimeExtension && filenameExtension === mimeExtension
        ? filenameExtension
        : mimeExtension;
    const key = `receipts/${householdId}/${randomUUID()}${ext}`;

    if (this.storage && this.bucketName) {
      const bucket = this.storage.bucket(this.bucketName);
      const blob = bucket.file(key);
      await blob.save(file, { contentType: mimeType });
      return key;
    }

    // Local fallback — async I/O to avoid blocking the event loop
    const dir = path.join(this.localUploadDir, 'receipts', householdId);
    await fs.promises.mkdir(dir, { recursive: true });
    const localPath = path.join(this.localUploadDir, key);
    await fs.promises.writeFile(localPath, file);
    return key;
  }

  async getSignedUrl(
    key: string,
    expiresInMinutes: number = 60,
  ): Promise<string> {
    if (this.storage && this.bucketName) {
      const [url] = await this.storage
        .bucket(this.bucketName)
        .file(key)
        .getSignedUrl({
          action: 'read',
          expires: Date.now() + expiresInMinutes * 60 * 1000,
        });
      return url;
    }

    // Local fallback — return file:// path
    return `file://${path.join(this.localUploadDir, key)}`;
  }

  async delete(key: string): Promise<void> {
    if (this.storage && this.bucketName) {
      await this.storage
        .bucket(this.bucketName)
        .file(key)
        .delete({ ignoreNotFound: true });
      return;
    }

    // Local fallback — async I/O, best-effort
    const localPath = path.join(this.localUploadDir, key);
    await fs.promises.unlink(localPath).catch(() => {
      // File may already be gone — ignore
    });
  }

  private extensionFromMime(mimeType: string): string {
    const map: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'application/pdf': '.pdf',
    };
    return map[mimeType] || '';
  }
}
