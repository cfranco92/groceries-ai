import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { StorageService } from './storage.service';

jest.mock('fs', () => ({
  existsSync: jest.fn().mockReturnValue(true),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
  unlinkSync: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
const fs = require('fs');

jest.mock('@google-cloud/storage', () => ({
  Storage: jest.fn().mockImplementation(() => ({
    bucket: jest.fn().mockReturnValue({
      file: jest.fn().mockReturnValue({
        save: jest.fn().mockResolvedValue(undefined),
        getSignedUrl: jest
          .fn()
          .mockResolvedValue(['https://signed-url.example.com']),
        delete: jest.fn().mockResolvedValue(undefined),
      }),
    }),
  })),
}));

describe('StorageService', () => {
  describe('with GCS configured', () => {
    let service: StorageService;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          StorageService,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn((key: string) => {
                const env: Record<string, string> = {
                  GCS_BUCKET_NAME: 'test-bucket',
                  GCP_PROJECT_ID: 'test-project',
                };
                return env[key];
              }),
            },
          },
        ],
      }).compile();

      service = module.get(StorageService);
    });

    it('should upload file to GCS and return a key', async () => {
      const buffer = Buffer.from('fake-image-data');
      const key = await service.upload(
        buffer,
        'receipt.jpg',
        'image/jpeg',
        'household-1',
      );

      expect(key).toMatch(/^receipts\/household-1\/.+\.jpg$/);
    });

    it('should return a signed URL', async () => {
      const url = await service.getSignedUrl('receipts/household-1/test.jpg');

      expect(url).toBe('https://signed-url.example.com');
    });

    it('should delete a file from GCS', async () => {
      await expect(
        service.delete('receipts/household-1/test.jpg'),
      ).resolves.not.toThrow();
    });
  });

  describe('with local fallback', () => {
    let service: StorageService;

    beforeEach(async () => {
      jest.clearAllMocks();
      fs.existsSync.mockReturnValue(true);

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          StorageService,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn(() => undefined),
            },
          },
        ],
      }).compile();

      service = module.get(StorageService);
    });

    it('should upload file locally and return a key', async () => {
      const buffer = Buffer.from('fake-image-data');
      const key = await service.upload(
        buffer,
        'receipt.png',
        'image/png',
        'household-1',
      );

      expect(key).toMatch(/^receipts\/household-1\/.+\.png$/);
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    it('should return file:// URL for signed URL fallback', async () => {
      const url = await service.getSignedUrl('receipts/household-1/test.jpg');

      expect(url).toMatch(/^file:\/\//);
      expect(url).toContain('receipts/household-1/test.jpg');
    });

    it('should delete local file', async () => {
      fs.existsSync.mockReturnValue(true);

      await service.delete('receipts/household-1/test.jpg');

      expect(fs.unlinkSync).toHaveBeenCalled();
    });

    it('should not throw when deleting non-existent local file', async () => {
      fs.existsSync.mockReturnValue(false);

      await expect(
        service.delete('receipts/household-1/nonexistent.jpg'),
      ).resolves.not.toThrow();
    });
  });
});
