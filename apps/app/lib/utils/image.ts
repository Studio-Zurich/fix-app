import sharp from "sharp";

interface CompressImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: "jpeg" | "png" | "webp";
}

export async function compressImage(
  buffer: Buffer,
  options: CompressImageOptions = {}
): Promise<Buffer> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 80,
    format = "jpeg",
  } = options;

  let image = sharp(buffer);

  // Get image metadata
  const metadata = await image.metadata();

  // Resize if needed while maintaining aspect ratio
  if (metadata.width && metadata.height) {
    if (metadata.width > maxWidth || metadata.height > maxHeight) {
      image = image.resize(maxWidth, maxHeight, {
        fit: "inside",
        withoutEnlargement: true,
      });
    }
  }

  // Convert to specified format and compress
  switch (format) {
    case "jpeg":
      return image.jpeg({ quality, progressive: true }).toBuffer();
    case "png":
      return image.png({ quality, compressionLevel: 9 }).toBuffer();
    case "webp":
      return image.webp({ quality }).toBuffer();
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

export async function processImageForUpload(
  file: File,
  options: CompressImageOptions = {}
): Promise<{ buffer: Buffer; fileName: string }> {
  // Convert File to Buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // For HEIC/HEIF files, pass through without compression
  if (file.type === "image/heic" || file.type === "image/heif") {
    const fileExt = file.type === "image/heic" ? "heic" : "heif";
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    return {
      buffer,
      fileName,
    };
  }

  try {
    // For other formats, compress and process as usual
    const compressedBuffer = await compressImage(buffer, options);
    const fileExt = file.type === "image/png" ? "png" : "jpg";
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    return {
      buffer: compressedBuffer,
      fileName,
    };
  } catch (error) {
    console.error("Image processing error:", {
      error,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });
    throw new Error("Failed to process image");
  }
}
