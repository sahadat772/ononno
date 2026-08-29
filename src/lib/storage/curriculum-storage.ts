export type CurriculumStorageProviderName = "supabase" | "google_drive";

export type CurriculumFileMetadata = {
  path: string;
  size?: number;
  contentType?: string;
  provider: CurriculumStorageProviderName;
  providerFileId?: string | null;
};

export type UploadResult = {
  path: string;
  provider: CurriculumStorageProviderName;
  providerFileId?: string | null;
};

/**
 * Storage abstraction for curriculum PDFs.
 * Current default: Supabase Storage (curriculum-pdfs bucket).
 * Future: GoogleDriveStorageProvider (not implemented in this phase).
 */
export interface CurriculumStorageProvider {
  readonly name: CurriculumStorageProviderName;
  upload(input: {
    path: string;
    data: Uint8Array | Buffer | Blob;
    contentType?: string;
    upsert?: boolean;
  }): Promise<UploadResult>;
  download(path: string): Promise<Blob>;
  getSignedUrl(path: string, expiresInSeconds?: number): Promise<string>;
  delete(path: string): Promise<void>;
  exists(path: string): Promise<boolean>;
  getMetadata(path: string): Promise<CurriculumFileMetadata | null>;
}

export function getDefaultStorageProviderName(): CurriculumStorageProviderName {
  return "supabase";
}
