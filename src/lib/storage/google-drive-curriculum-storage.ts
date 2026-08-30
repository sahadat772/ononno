import type {
  CurriculumFileMetadata,
  CurriculumStorageListItem,
  CurriculumStorageProvider,
  UploadResult,
} from "./curriculum-storage";

/**
 * Google Drive provider — Phase 10 placeholder.
 * Selecting this provider fails fast with a stable error code so app code
 * can switch via env/DB without client secrets leaking.
 *
 * Credentials must only live server-side (never NEXT_PUBLIC_* / browser).
 */
export class GoogleDriveCurriculumStorage implements CurriculumStorageProvider {
  readonly name = "google_drive" as const;

  private notImplemented(): never {
    throw new Error(
      "GOOGLE_DRIVE_NOT_IMPLEMENTED: Drive provider is reserved for Phase 10. Use storage_provider=supabase for testing.",
    );
  }

  async upload(): Promise<UploadResult> {
    this.notImplemented();
  }

  async download(): Promise<Blob> {
    this.notImplemented();
  }

  async getSignedUrl(): Promise<string> {
    this.notImplemented();
  }

  async delete(): Promise<void> {
    this.notImplemented();
  }

  async exists(): Promise<boolean> {
    this.notImplemented();
  }

  async getMetadata(): Promise<CurriculumFileMetadata | null> {
    this.notImplemented();
  }

  async list(): Promise<CurriculumStorageListItem[]> {
    this.notImplemented();
  }
}

export function createGoogleDriveCurriculumStorage(): GoogleDriveCurriculumStorage {
  return new GoogleDriveCurriculumStorage();
}
