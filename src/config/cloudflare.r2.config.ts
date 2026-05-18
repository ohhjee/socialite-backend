import { R2_ACCESSKEY, R2_SECRETACCESSKEY, R2_URL } from "@/constant";
import { S3Client } from "@aws-sdk/client-s3";

export const s3Client = new S3Client({
  region: "auto",
  endpoint: R2_URL,
  credentials: {
    accessKeyId: R2_ACCESSKEY,
    secretAccessKey: R2_SECRETACCESSKEY,
  },
});
