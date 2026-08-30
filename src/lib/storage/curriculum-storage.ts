import type { SupabaseClient } from "@supabase/supabase-js";
import { createGoogleDriveCurriculumStorage } from "./google-drive-curriculum-storage";
import { createSupabaseCurriculumStorage } from "./supabase-curriculum-storage";

export type CurriculumStorageProviderName = "supabase" | "google_drive";

export type CurriculumFileMetadata = {
  path: string;
  size?: number;
  contentType?: string;
  provider: CurriculumStorageProviderName;
  providerFileId?: string | null;
};

export type CurriculumStorageListItem = {
  name: string;
  path: string;
  size?: number;
  contentType?: string;
  isFolder: boolean;
  updatedAt?: string;
};

export type UploadResult = {
  path: string;
  provider: CurriculumStorageProviderName;
  providerFileId?: string | null;
};

/**
 * Storage abstraction for curriculum PDFs.
 * Application code must depend only on this interface — never on a concrete
 * Supabase/Drive client for curriculum files.
 *
 * Current default: Supabase Storage (`curriculum-pdfs` bucket).
 * Future: Google Drive (Phase 10) — interface is compatible; no credentials here.
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

  /** List objects under a path prefix (for catalog discovery). */
  list(prefix?: string): Promise<CurriculumStorageListItem[]>;
}

export function getDefaultStorageProviderName(): CurriculumStorageProviderName {
  const raw = (process.env.CURRICULUM_STORAGE_PROVIDER ?? "supabase")
    .trim()
    .toLowerCase();
  if (raw === "google_drive" || raw === "drive") return "google_drive";
  return "supabase";
}

/**
 * Resolve storage provider by name.
 * Google Drive is future-compatible: selecting it throws a clear error until Phase 10.
 */
export function createCurriculumStorage(
  supabase: SupabaseClient,
  providerName: CurriculumStorageProviderName = getDefaultStorageProviderName(),
): CurriculumStorageProvider {
  if (providerName === "google_drive") {
    return createGoogleDriveCurriculumStorage();
  }
  return createSupabaseCurriculumStorage(supabase);
}
