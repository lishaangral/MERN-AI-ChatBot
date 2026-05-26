import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuid } from "uuid";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_KEY!,
  },
});

export const uploadFileToS3 = async (file: any) => {
  try {
    const key = `documents/${uuid()}-${file.originalname}`;

    const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET!,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
    });

    await s3.send(command);

    return {
      key,
      fileUrl: `https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
    };
  } catch (err) {
    console.error("S3 upload error:", err);
    throw new Error("Failed to upload file");
  }
};

export const deleteFromS3 = async (fileUrl: string) => {
  try {
    const bucket = process.env.AWS_BUCKET!;

    // extract key from URL
    const key = fileUrl.split(".amazonaws.com/")[1];

    if (!key) throw new Error("Invalid S3 URL");

    await s3.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );

    console.log("S3 DELETE SUCCESS:", key);

  } catch (err) {
    console.error("S3 DELETE ERROR:", err);
  }
};

export const generateSignedPreviewUrl = async (fileUrl: string) => {

  const key = fileUrl.split(".amazonaws.com/")[1];

  if (!key) {
    throw new Error("Invalid S3 key");
  }

  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET!,
    Key: key,
  });

  return await getSignedUrl(s3, command, {
    expiresIn: 3600,
  });
};