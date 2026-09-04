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
  providerFileId?: string | null;
};

export type UploadResult = {
  path: string;
  provider: CurriculumStorageProviderName;
  providerFileId?: string | null;
};

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

  list(prefix?: string): Promise<CurriculumStorageListItem[]>;
}

export function getDefaultStorageProviderName(): CurriculumStorageProviderName {
  const raw = (process.env.CURRICULUM_STORAGE_PROVIDER ?? "supabase")
    .trim()
    .toLowerCase();
  if (raw === "google_drive" || raw === "drive") return "google_drive";
  return "supabase";
}

export function createCurriculumStorage(
  supabase: SupabaseClient,
  providerName: CurriculumStorageProviderName = getDefaultStorageProviderName(),
): CurriculumStorageProvider {
  if (providerName === "google_drive") {
    return createGoogleDriveCurriculumStorage();
  }
  return createSupabaseCurriculumStorage(supabase);
}
