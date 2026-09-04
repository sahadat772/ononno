import { Readable } from "stream";
import { google, type drive_v3 } from "googleapis";
import type {
  CurriculumFileMetadata,
  CurriculumStorageListItem,
  CurriculumStorageProvider,
  UploadResult,
} from "./curriculum-storage";

/**
 * Phase 3 — Google Drive curriculum PDF storage.
 *
 * Server-only credentials (never NEXT_PUBLIC_*):
 * - GOOGLE_DRIVE_CLIENT_EMAIL
 * - GOOGLE_DRIVE_PRIVATE_KEY
 * - GOOGLE_DRIVE_FOLDER_ID  (bare id only, not ?usp=sharing)
 */

function requireEnv(name: string): string {
  const v = process.env[name]?.trim();
  if (!v) {
    throw new Error(
      `GOOGLE_DRIVE_CONFIG_MISSING: ${name} is required for google_drive provider.`,
    );
  }
  return v;
}

function normalizePrivateKey(raw: string): string {
  return raw.replace(/\\n/g, "\n").replace(/"/g, "");
}

/** Strip URL / ?usp=sharing — Google API needs bare folder id only. */
function sanitizeDriveId(raw: string): string {
  let v = raw.trim().replace(/^["']|["']$/g, "");
  try {
    if (v.startsWith("http://") || v.startsWith("https://")) {
      const u = new URL(v);
      const m = u.pathname.match(/\/folders\/([a-zA-Z0-9_-]+)/);
      if (m?.[1]) return m[1];
      const openId = u.searchParams.get("id");
      if (openId) return openId;
    }
  } catch {
    /* ignore */
  }
  v = v.split("?")[0].split("&")[0].trim();
  const folderMatch = v.match(/folders\/([a-zA-Z0-9_-]+)/);
  if (folderMatch?.[1]) return folderMatch[1];
  return v;
}

function formatDriveError(e: unknown, context: string): Error {
  const anyErr = e as {
    message?: string;
    errors?: { message?: string; reason?: string }[];
    response?: { data?: { error?: { message?: string } } };
  };
  const apiMsg =
    anyErr?.response?.data?.error?.message ||
    anyErr?.errors?.[0]?.message ||
    (e instanceof Error ? e.message : String(e));
  const lower = String(apiMsg).toLowerCase();
  if (lower.includes("file not found") || lower.includes("not found")) {
    return new Error(
      `GOOGLE_DRIVE_FOLDER_NOT_FOUND (${context}): GOOGLE_DRIVE_FOLDER_ID ভুল (শুধু id দাও, ?usp=sharing নয়), অথবা service account-কে folder-এ Editor share করা হয়নি। Detail: ${apiMsg}`,
    );
  }
  if (lower.includes("insufficient") || lower.includes("permission")) {
    return new Error(
      `GOOGLE_DRIVE_PERMISSION (${context}): service account-কে Drive folder-এ Editor দাও। ${apiMsg}`,
    );
  }
  return new Error(`GOOGLE_DRIVE_ERROR (${context}): ${apiMsg}`);
}

export class GoogleDriveCurriculumStorage implements CurriculumStorageProvider {
  readonly name = "google_drive" as const;
  private drive: drive_v3.Drive | null = null;
  private rootFolderId: string | null = null;
  private folderCache = new Map<string, string>();

  private getClient(): drive_v3.Drive {
    if (this.drive) return this.drive;

    const email = requireEnv("GOOGLE_DRIVE_CLIENT_EMAIL");
    const key = normalizePrivateKey(requireEnv("GOOGLE_DRIVE_PRIVATE_KEY"));
    this.rootFolderId = sanitizeDriveId(requireEnv("GOOGLE_DRIVE_FOLDER_ID"));

    const auth = new google.auth.JWT({
      email,
      key,
      scopes: ["https://www.googleapis.com/auth/drive"],
    });

    this.drive = google.drive({ version: "v3", auth });
    return this.drive;
  }

  private rootId(): string {
    this.getClient();
    return this.rootFolderId!;
  }

  private splitPath(path: string): { dirParts: string[]; fileName: string } {
    const normalized = path.replace(/^\/+|\/+$/g, "");
    const parts = normalized.split("/").filter(Boolean);
    if (parts.length === 0) {
      throw new Error("STORAGE_INVALID_PATH");
    }
    const fileName = parts[parts.length - 1]!;
    const dirParts = parts.slice(0, -1);
    return { dirParts, fileName };
  }

  private async findChildFolder(
    parentId: string,
    name: string,
  ): Promise<string | null> {
    const drive = this.getClient();
    const q = [
      `name = '${name.replace(/'/g, "\\'")}'`,
      `mimeType = 'application/vnd.google-apps.folder'`,
      `'${parentId}' in parents`,
      "trashed = false",
    ].join(" and ");

    const res = await drive.files.list({
      q,
      fields: "files(id, name)",
      pageSize: 5,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });
    return res.data.files?.[0]?.id ?? null;
  }

  private async ensureFolder(
    parentId: string,
    name: string,
  ): Promise<string> {
    const existing = await this.findChildFolder(parentId, name);
    if (existing) return existing;

    const drive = this.getClient();
    try {
      const created = await drive.files.create({
        requestBody: {
          name,
          mimeType: "application/vnd.google-apps.folder",
          parents: [parentId],
        },
        fields: "id",
        supportsAllDrives: true,
      });
      if (!created.data.id) throw new Error("GOOGLE_DRIVE_FOLDER_CREATE_FAILED");
      return created.data.id;
    } catch (e) {
      throw formatDriveError(e, `ensureFolder parent=${parentId} name=${name}`);
    }
  }

  private async ensurePathFolders(dirParts: string[]): Promise<string> {
    let parent = this.rootId();
    let prefix = "";
    for (const part of dirParts) {
      prefix = prefix ? `${prefix}/${part}` : part;
      const cached = this.folderCache.get(prefix);
      if (cached) {
        parent = cached;
        continue;
      }
      parent = await this.ensureFolder(parent, part);
      this.folderCache.set(prefix, parent);
    }
    return parent;
  }

  private async findFileInFolder(
    parentId: string,
    fileName: string,
  ): Promise<{ id: string; size?: string; mimeType?: string } | null> {
    const drive = this.getClient();
    const q = [
      `name = '${fileName.replace(/'/g, "\\'")}'`,
      `mimeType != 'application/vnd.google-apps.folder'`,
      `'${parentId}' in parents`,
      "trashed = false",
    ].join(" and ");

    const res = await drive.files.list({
      q,
      fields: "files(id, name, size, mimeType)",
      pageSize: 5,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });
    const f = res.data.files?.[0];
    if (!f?.id) return null;
    return {
      id: f.id,
      size: f.size ?? undefined,
      mimeType: f.mimeType ?? undefined,
    };
  }

  private async resolveFile(
    path: string,
  ): Promise<{ id: string; size?: string; mimeType?: string }> {
    if (/^[a-zA-Z0-9_-]{10,}$/.test(path) && !path.includes("/")) {
      const drive = this.getClient();
      const meta = await drive.files.get({
        fileId: path,
        fields: "id, size, mimeType, trashed",
        supportsAllDrives: true,
      });
      if (meta.data.trashed || !meta.data.id) {
        throw new Error("STORAGE_NOT_FOUND");
      }
      return {
        id: meta.data.id,
        size: meta.data.size ?? undefined,
        mimeType: meta.data.mimeType ?? undefined,
      };
    }

    const { dirParts, fileName } = this.splitPath(path);
    const parent = await this.ensurePathFolders(dirParts);
    const found = await this.findFileInFolder(parent, fileName);
    if (!found) throw new Error("STORAGE_NOT_FOUND");
    return found;
  }

  async upload(input: {
    path: string;
    data: Uint8Array | Buffer | Blob;
    contentType?: string;
    upsert?: boolean;
  }): Promise<UploadResult> {
    const drive = this.getClient();

    try {
      await drive.files.get({
        fileId: this.rootId(),
        fields: "id, name",
        supportsAllDrives: true,
      });
    } catch (e) {
      throw formatDriveError(e, "root folder check");
    }

    const { dirParts, fileName } = this.splitPath(input.path);
    let parentId: string;
    try {
      parentId = await this.ensurePathFolders(dirParts);
    } catch (e) {
      throw formatDriveError(e, "ensurePathFolders");
    }

    const existing = await this.findFileInFolder(parentId, fileName);
    if (existing && !input.upsert) {
      throw new Error("PDF_UPLOAD_FAILED: file already exists on Google Drive");
    }

    let body: Buffer;
    if (Buffer.isBuffer(input.data)) {
      body = input.data;
    } else if (input.data instanceof Uint8Array) {
      body = Buffer.from(input.data);
    } else {
      body = Buffer.from(await input.data.arrayBuffer());
    }

    const media = {
      mimeType: input.contentType ?? "application/pdf",
      body: Readable.from(body),
    };

    try {
      if (existing && input.upsert) {
        const updated = await drive.files.update({
          fileId: existing.id,
          media,
          fields: "id",
          supportsAllDrives: true,
        });
        return {
          path: input.path,
          provider: "google_drive",
          providerFileId: updated.data.id ?? existing.id,
        };
      }

      const created = await drive.files.create({
        requestBody: {
          name: fileName,
          parents: [parentId],
          appProperties: { ononno_path: input.path },
        },
        media,
        fields: "id",
        supportsAllDrives: true,
      });

      if (!created.data.id) throw new Error("PDF_UPLOAD_FAILED");

      return {
        path: input.path,
        provider: "google_drive",
        providerFileId: created.data.id,
      };
    } catch (e) {
      if (e instanceof Error && e.message.startsWith("GOOGLE_DRIVE_")) throw e;
      if (e instanceof Error && e.message.startsWith("PDF_UPLOAD_FAILED"))
        throw e;
      throw formatDriveError(e, "upload");
    }
  }

  async download(path: string): Promise<Blob> {
    const drive = this.getClient();
    const file = await this.resolveFile(path);
    const res = await drive.files.get(
      {
        fileId: file.id,
        alt: "media",
        supportsAllDrives: true,
      },
      { responseType: "arraybuffer" },
    );

    const buf = Buffer.from(res.data as ArrayBuffer);
    return new Blob([buf], {
      type: file.mimeType ?? "application/pdf",
    });
  }

  async getSignedUrl(path: string, expiresInSeconds = 3600): Promise<string> {
    const drive = this.getClient();
    const file = await this.resolveFile(path);

    try {
      await drive.permissions.create({
        fileId: file.id,
        requestBody: { role: "reader", type: "anyone" },
        supportsAllDrives: true,
      });
    } catch (e) {
      console.warn("[google-drive] permission create:", e);
    }

    const meta = await drive.files.get({
      fileId: file.id,
      fields: "webContentLink, webViewLink",
      supportsAllDrives: true,
    });

    const link = meta.data.webContentLink || meta.data.webViewLink;
    if (!link) {
      throw new Error("STORAGE_NOT_FOUND: no shareable link");
    }

    void expiresInSeconds;
    return link;
  }

  async delete(path: string): Promise<void> {
    const drive = this.getClient();
    try {
      const file = await this.resolveFile(path);
      await drive.files.delete({
        fileId: file.id,
        supportsAllDrives: true,
      });
    } catch (e) {
      if (e instanceof Error && e.message.includes("STORAGE_NOT_FOUND")) return;
      throw e;
    }
  }

  async exists(path: string): Promise<boolean> {
    try {
      await this.resolveFile(path);
      return true;
    } catch {
      return false;
    }
  }

  async getMetadata(path: string): Promise<CurriculumFileMetadata | null> {
    try {
      const file = await this.resolveFile(path);
      return {
        path,
        size: file.size ? Number(file.size) : undefined,
        contentType: file.mimeType,
        provider: "google_drive",
        providerFileId: file.id,
      };
    } catch {
      return null;
    }
  }

  async list(prefix = ""): Promise<CurriculumStorageListItem[]> {
    const drive = this.getClient();
    const normalized = prefix.replace(/^\/+|\/+$/g, "");
    let parentId = this.rootId();

    if (normalized) {
      const parts = normalized.split("/").filter(Boolean);
      for (const part of parts) {
        const next = await this.findChildFolder(parentId, part);
        if (!next) return [];
        parentId = next;
      }
    }

    const res = await drive.files.list({
      q: `'${parentId}' in parents and trashed = false`,
      fields: "files(id, name, size, mimeType, modifiedTime)",
      pageSize: 200,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      orderBy: "name",
    });

    return (res.data.files ?? []).map((f) => {
      const isFolder = f.mimeType === "application/vnd.google-apps.folder";
      const name = f.name ?? "unknown";
      const path = normalized ? `${normalized}/${name}` : name;
      return {
        name,
        path,
        size: f.size ? Number(f.size) : undefined,
        contentType: f.mimeType ?? undefined,
        isFolder,
        updatedAt: f.modifiedTime ?? undefined,
      };
    });
  }
}

export function createGoogleDriveCurriculumStorage(): GoogleDriveCurriculumStorage {
  return new GoogleDriveCurriculumStorage();
}
