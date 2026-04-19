import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuid } from "uuid";

const s3 = new S3Client({
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
        fileUrl: `https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
        key
    };
  } catch (err) {
    console.error("S3 upload error:", err);
    throw new Error("Failed to upload file");
  }
};

// export const uploadToS3 = async (file: any) => {
//   const key = `documents/${uuid()}-${file.originalname}`;

//   const command = new PutObjectCommand({
//     Bucket: process.env.AWS_BUCKET!,
//     Key: key,
//     Body: file.buffer,
//     ContentType: file.mimetype,
//   });

//   await s3.send(command);

//   return `https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
// };