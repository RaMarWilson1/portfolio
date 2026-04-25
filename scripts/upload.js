// scripts/upload.js
// Reusable script to upload poems (JSON) and photos (images) to Vercel Blob
// Skips files that already exist to prevent duplicates
// Usage:
//   node scripts/upload.js poems     → uploads everything in ./upload/poetry/
//   node scripts/upload.js photos    → uploads everything in ./upload/photography/
//   node scripts/upload.js           → uploads both

import { put, list } from "@vercel/blob";
import { readFileSync, readdirSync, existsSync } from "fs";
import { join, extname } from "path";
import { config } from "dotenv";

config({ path: ".env.local" });

const TOKEN = process.env.BLOB_READ_WRITE_TOKEN; // eslint-disable-line no-undef

if (!TOKEN) {
  console.error("❌ BLOB_READ_WRITE_TOKEN not found in .env.local");
  process.exit(1); // eslint-disable-line no-undef
}

const UPLOAD_DIRS = {
  poems: {
    localDir: "./upload/poetry",
    blobPrefix: "poetry/",
    extensions: [".json"],
    contentType: "application/json",
  },
  photos: {
    localDir: "./upload/photography",
    blobPrefix: "photography/",
    extensions: [".jpg", ".jpeg", ".png", ".webp", ".heic"],
    contentType: null,
  },
};

const IMAGE_CONTENT_TYPES = {
  ".jpg":  "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png":  "image/png",
  ".webp": "image/webp",
  ".heic": "image/heic",
};

async function getExistingBlobs(prefix) {
  const existing = new Set();
  let cursor;

  do {
    const result = await list({ prefix, token: TOKEN, cursor });
    result.blobs.forEach((b) => existing.add(b.pathname));
    cursor = result.cursor;
  } while (cursor);

  return existing;
}

async function uploadDir({ localDir, blobPrefix, extensions, contentType }) {
  if (!existsSync(localDir)) {
    console.log(`⚠️  Directory not found: ${localDir} — skipping.`);
    return;
  }

  const files = readdirSync(localDir).filter((f) =>
    extensions.includes(extname(f).toLowerCase())
  );

  if (files.length === 0) {
    console.log(`⚠️  No files found in ${localDir}`);
    return;
  }

  console.log(`\n📂 Checking existing blobs at "${blobPrefix}"...`);
  const existing = await getExistingBlobs(blobPrefix);
  console.log(`   Found ${existing.size} existing file(s).`);

  let uploaded = 0;
  let skipped = 0;

  for (const file of files) {
    const blobPath = `${blobPrefix}${file}`;

    if (existing.has(blobPath)) {
      console.log(`   ⏭️  Skipping (already exists): ${file}`);
      skipped++;
      continue;
    }

    const filePath = join(localDir, file);
    const fileContent = readFileSync(filePath);
    const ext = extname(file).toLowerCase();
    const type = contentType ?? IMAGE_CONTENT_TYPES[ext] ?? "application/octet-stream";

    try {
      const blob = await put(blobPath, fileContent, {
        access: "public",
        contentType: type,
        token: TOKEN,
      });
      console.log(`   ✅ Uploaded: ${file} → ${blob.url}`);
      uploaded++;
    } catch (err) {
      console.error(`   ❌ Failed: ${file} —`, err.message);
    }
  }

  console.log(`\n   Done — ${uploaded} uploaded, ${skipped} skipped.`);
}

async function main() {
  const arg = process.argv[2]; // eslint-disable-line no-undef

  console.log("🚀 Vercel Blob Upload Script");
  console.log("================================");

  if (!arg || arg === "poems") {
    console.log("\n📝 Uploading POEMS...");
    await uploadDir(UPLOAD_DIRS.poems);
  }

  if (!arg || arg === "photos") {
    console.log("\n📷 Uploading PHOTOS...");
    await uploadDir(UPLOAD_DIRS.photos);
  }

  console.log("\n✨ All done!");
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1); // eslint-disable-line no-undef
});