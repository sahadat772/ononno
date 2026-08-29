import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CurriculumFileMetadata,
  CurriculumStorageProvider,
  UploadResult,
} from "./curriculum-storage";

const BUCKET = "curriculum-pdfs";

export class SupabaseCurriculumStorage implements CurriculumStorageProvider {
  readonly name = "supabase" as const;

  constructor(private readonly supabase: SupabaseClient) {}

  async upload(input: {
    path: string;
    data: Uint8Array | Buffer | Blob;
    contentType?: string;
    upsert?: boolean;
  }): Promise<UploadResult> {
    const { data, error } = await this.supabase.storage
      .from(BUCKET)
      .upload(input.path, input.data, {
        contentType: input.contentType ?? "application/pdf",
        upsert: input.upsert ?? false,
      });

    if (error || !data) {
      throw new Error(error?.message ?? "PDF_UPLOAD_FAILED");
    }

    return {
      path: data.path,
      provider: "supabase",
      providerFileId: null,
    };
  }

  async download(path: string): Promise<Blob> {
    const { data, error } = await this.supabase.storage
      .from(BUCKET)
      .download(path);

    if (error || !data) {
      throw new Error(error?.message ?? "PDF_NOT_FOUND");
    }
    return data;
  }

  async getSignedUrl(path: string, expiresInSeconds = 3600): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from(BUCKET)
      .createSignedUrl(path, expiresInSeconds);

    if (error || !data?.signedUrl) {
      throw new Error(error?.message ?? "PDF_NOT_FOUND");
    }
    return data.signedUrl;
  }

  async delete(path: string): Promise<void> {
    const { error } = await this.supabase.storage.from(BUCKET).remove([path]);
    if (error) {
      throw new Error(error.message);
    }
  }

  async exists(path: string): Promise<boolean> {
    const dir = path.includes("/") ? path.replace(/\/[^/]+$/, "") : "";
    const fileName = path.split("/").pop() ?? path;
    const { data, error } = await this.supabase.storage.from(BUCKET).list(dir, {
      search: fileName,
      limit: 5,
    });
    if (error) return false;
    return (data ?? []).some((f) => f.name === fileName);
  }

  async getMetadata(path: string): Promise<CurriculumFileMetadata | null> {
    const dir = path.includes("/") ? path.replace(/\/[^/]+$/, "") : "";
    const fileName = path.split("/").pop() ?? path;
    const { data, error } = await this.supabase.storage.from(BUCKET).list(dir, {
      search: fileName,
      limit: 5,
    });
    if (error || !data) return null;
    const file = data.find((f) => f.name === fileName);
    if (!file) return null;
    return {
      path,
      size: file.metadata?.size as number | undefined,
      contentType: (file.metadata?.mimetype as string | undefined) ?? undefined,
      provider: "supabase",
      providerFileId: null,
    };
  }
}

export function createSupabaseCurriculumStorage(
  supabase: SupabaseClient,
): SupabaseCurriculumStorage {
  return new SupabaseCurriculumStorage(supabase);
}
