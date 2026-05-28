import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const S3_FOLDER = "astrologerimages";
const AWS_REGION = process.env.NEXT_PUBLIC_AWS_REGION || "ap-south-1";
const AWS_BUCKET = process.env.NEXT_PUBLIC_AWS_BUCKET_NAME || "nashatra-s3";

const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
  },
});

/**
* Uploads a File object to S3 using AWS SDK V4 Signature via a Presigned URL.
*
* @param {File} file - The browser File object to upload.
* @param {string} [folder] - Optional S3 folder prefix. Defaults to "astrologerimages".
* @returns {Promise<string>} The S3 object key.
*/
export async function uploadToS3(file, folder = S3_FOLDER) {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1_000_000_000);
  const ext = file.name.split(".").pop() || "jpg";
  const key = `${folder}/image-${timestamp}-${random}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: AWS_BUCKET,
    Key: key,
    ContentType: file.type || "image/jpeg",
  });

  try {
    // 1. Generate a pre-signed URL (valid for 60 seconds)
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 });

    // 2. Use native browser fetch() to upload the file to the signed URL
    const uploadRes = await fetch(signedUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type || "image/jpeg",
      },
    });

    if (!uploadRes.ok) {
      throw new Error(`Upload failed with status: ${uploadRes.status}`);
    }

    return key;
  } catch (error) {
    console.error("S3 upload error:", error);
    throw new Error("S3 upload failed");
  }
}
 