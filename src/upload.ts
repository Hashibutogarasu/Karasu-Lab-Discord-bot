import {
  S3Client,
  PutObjectCommand,
  PutObjectCommandInput,
  DeleteObjectCommand,
  DeleteObjectCommandInput,
} from 'npm:@aws-sdk/client-s3'
import Environments from "./keys.ts";

const client = new S3Client({
  region: 'auto',
  endpoint: Environments.CLOUDFLARE_ENDPOINT,
  credentials: {
    accessKeyId: Environments.CLOUDFLARE_ACCESS_KEY_ID,
    secretAccessKey: Environments.CLOUDFLARE_ACCESS_KEY,
  },
});

export const getFileFromUrl = async (url: string): Promise<Uint8Array> => {
  const response = await fetch(url);
  return new Uint8Array(await response.arrayBuffer());
}

/**
 * get file name of url the get parameter of url was removed
 * @param url 
 * @returns 
 */
export const getFileNamefromUrl = (url: string): string => {
  const urlObj = new URL(url);
  const path = urlObj.pathname.split('/');
  return path[path.length - 1];
}

export const uint8ArrayToFile = (array: Uint8Array, filename: string): File => {
  return new File([array], filename);
}

export const putImage = async (file: ArrayBuffer, pathname: string, contentType: string): Promise<string> => {
  const uploadParams: PutObjectCommandInput = {
    Bucket: 'karasu-lab-storage',
    Key: pathname,
    Body: file,
    ContentType: contentType,
    ACL: 'public-read',
  };

  const command = new PutObjectCommand(uploadParams);
  await client.send(command);

  return `${Environments.IMAGE_HOST_URL}/${pathname}`;
};

export const deleteImage = (pathname: string) => {
  const uploadParams: DeleteObjectCommandInput = {
    Bucket: 'karasu-lab-storage',
    Key: pathname,
  };

  const command = new DeleteObjectCommand(uploadParams);
  return client.send(command);
};