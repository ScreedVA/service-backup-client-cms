import fs from "fs/promises";
import path from "path";
import { getDriveClient } from "./OAuth2client"; // adjust path

const parentFolderId = "1UsanPg2N0ftRTEXzwWkLJRhQ1dTUPVLz";

let drive: any = undefined;

const initDriveClient = async () => {
  try {
    if (!drive) {
      drive = await getDriveClient();
      console.log("✅ Google Drive client initialized");
    }
    return drive;
  } catch (err) {
    console.error("⛔ Failed to initialize Google Drive client:", err);
    throw err;
  }
};

const folderCache = new Map<string, string>();
const folderLocks = new Map<string, Promise<string>>();
// Create or get folder on Google Drive (returns folder ID)

async function ensureDriveFolder(folderName: string, parentId: string): Promise<string> {
  const key = `${parentId}/${folderName}`;

  if (folderCache.has(key)) return folderCache.get(key)!;
  if (folderLocks.has(key)) return folderLocks.get(key)!;

  const promise = (async () => {
    const drive = await initDriveClient();

    const res = await drive.files.list({
      q: `'${parentId}' in parents and name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: "files(id)",
    });

    if (res.data.files?.length) {
      folderCache.set(key, res.data.files[0].id!);
      return res.data.files[0].id!;
    }

    const createRes = await drive.files.create({
      requestBody: {
        name: folderName,
        mimeType: "application/vnd.google-apps.folder",
        parents: [parentId],
        appProperties: {
          logicalPath: key,
        },
      },

      fields: "id",
    });

    folderCache.set(key, createRes.data.id!);
    return createRes.data.id!;
  })();

  folderLocks.set(key, promise);

  const result = await promise;
  folderLocks.delete(key);
  return result;
}

// Recursively ensure full path exists on Drive
async function ensureDrivePath(filePath: string): Promise<string> {
  const parts = filePath.split("/"); // e.g., client/collections/slug.json
  parts.pop(); // remove filename
  let currentParent = parentFolderId;

  for (const part of parts) {
    currentParent = await ensureDriveFolder(part, currentParent);
  }

  return currentParent; // ID of the final folder
}

// Write file to Drive
const fileLocks = new Map<string, Promise<void>>();

async function writeFileToDrive(filePath: string, data: any) {
  const drive = await initDriveClient();
  const folderId = await ensureDrivePath(filePath);
  const fileName = path.basename(filePath);

  const lockKey = `${folderId}/${fileName}`;

  if (fileLocks.has(lockKey)) {
    await fileLocks.get(lockKey);
    return;
  }

  const promise = (async () => {
    const res = await drive.files.list({
      q: `'${folderId}' in parents and name='${fileName}' and trashed=false`,
      fields: "files(id)",
    });

    const existing = res.data.files?.[0];

    const media = {
      mimeType: "application/json",
      body: JSON.stringify(data, null, 2),
    };

    if (existing) {
      await drive.files.update({
        fileId: existing.id!,
        media,
      });
      console.log(`♻️ Updated: ${filePath}`);
    } else {
      await drive.files.create({
        requestBody: {
          name: fileName,
          parents: [folderId],
        },
        media,
        fields: "id",
      });
      console.log(`🌐 Created: ${filePath}`);
    }
  })();

  fileLocks.set(lockKey, promise);

  await promise;
  fileLocks.delete(lockKey);
}
// Unified writeBackup function
export async function writeBackup(filePath: string, data: any) {
  if (process.env.STORAGE === "drive") {
    await writeFileToDrive(filePath, data);
  } else {
    // Local storage
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
    console.log(`💾 Backup saved to ${filePath}`);
  }
}
