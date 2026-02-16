import crypto from "crypto";
import config from "../config/index.js";

const algorithm = "aes-256-ctr";
const secretKey = crypto
  .createHash("sha256")
  .update(String(config.jwtSecret))
  .digest("base64")
  .substring(0, 32);

export const encrypt = (text) => {
  if (!text) return null;
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
};

export const decrypt = (hash) => {
  if (!hash) return null;
  const [iv, content] = hash.split(":");
  if (!iv || !content) return null;
  
  const decipher = crypto.createDecipheriv(
    algorithm,
    secretKey,
    Buffer.from(iv, "hex")
  );
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(content, "hex")),
    decipher.final(),
  ]);
  return decrypted.toString();
};
