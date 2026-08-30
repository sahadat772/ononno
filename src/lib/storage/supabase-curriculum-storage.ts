import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CurriculumFileMetadata,
  CurriculumStorageListItem,
  CurriculumStorageProvider,
  UploadResult,
} from "./curriculum-storage";

export const CURRICULUM_PDF_BUCKET = "curriculum-pdfs";

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
      .from(CURRICULUM_PDF_BUCKET)
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
      .from(CURRICULUM_PDF_BUCKET)
      .download(path);

    if (error || !data) {
      throw new Error(error?.message ?? "STORAGE_NOT_FOUND");
    }
    return data;
  }

  async getSignedUrl(path: string, expiresInSeconds = 3600): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from(CURRICULUM_PDF_BUCKET)
      .createSignedUrl(path, expiresInSeconds);

    if (error || !data?.signedUrl) {
      throw new Error(error?.message ?? "STORAGE_NOT_FOUND");
    }
    return data.signedUrl;
  }

  async delete(path: string): Promise<void> {
    const { error } = await this.supabase.storage
      .from(CURRICULUM_PDF_BUCKET)
      .remove([path]);
    if (error) {
      throw new Error(error.message);
    }
  }

  async exists(path: string): Promise<boolean> {
    const meta = await this.getMetadata(path);
    return meta !== null;
  }

  async getMetadata(path: string): Promise<CurriculumFileMetadata | null> {
    const dir = path.includes("/") ? path.replace(/\/[^/]+$/, "") : "";
    const fileName = path.split("/").pop() ?? path;
    const { data, error } = await this.supabase.storage
      .from(CURRICULUM_PDF_BUCKET)
      .list(dir, {
        search: fileName,
        limit: 20,
      });
    if (error || !data) return null;
    const file = data.find((f) => f.name === fileName);
    if (!file) return null;
    return {
      path,
      size: (file.metadata?.size as number | undefined) ?? undefined,
      contentType:
        (file.metadata?.mimetype as string | undefined) ?? undefined,
      provider: "supabase",
      providerFileId: null,
    };
  }

  async list(prefix = ""): Promise<CurriculumStorageListItem[]> {
    const normalized = prefix.replace(/^\/+|\/+$/g, "");
    const { data, error } = await this.supabase.storage
      .from(CURRICULUM_PDF_BUCKET)
      .list(normalized || undefined, {
        limit: 200,
        sortBy: { column: "name", order: "asc" },
      });

    if (error) {
      throw new Error(error.message ?? "STORAGE_ACCESS_FAILED");
    }

    return (data ?? []).map((item) => {
      const isFolder = !item.id && !item.metadata;
      const path = normalized ? `${normalized}/${item.name}` : item.name;
      return {
        name: item.name,
        path,
        size: (item.metadata?.size as number | undefined) ?? undefined,
        contentType:
          (item.metadata?.mimetype as string | undefined) ?? undefined,
        isFolder,
        updatedAt: item.updated_at ?? undefined,
      };
    });
  }
}

export function createSupabaseCurriculumStorage(
  supabase: SupabaseClient,
): SupabaseCurriculumStorage {
  return new SupabaseCurriculumStorage(supabase);
}
