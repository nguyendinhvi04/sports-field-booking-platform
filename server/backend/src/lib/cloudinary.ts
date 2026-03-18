import { v2 as cloudinary } from "cloudinary";

/**
 * Lazy-init Cloudinary mỗi khi cần upload.
 * Đảm bảo process.env đã được Next.js inject đầy đủ trước khi dùng.
 */
function getConfiguredCloudinary() {
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;

  if (!cloud_name || !api_key || !api_secret) {
    throw new Error(
      `Thiếu Cloudinary credentials trong .env! ` +
      `cloud_name=${cloud_name}, api_key=${api_key ? "✓" : "✗"}, api_secret=${api_secret ? "✓" : "✗"}`
    );
  }

  // Log để debug (xóa sau khi xác nhận hoạt động)
  console.log(`[Cloudinary] Initializing with cloud_name: ${cloud_name}`);

  cloudinary.config({ cloud_name, api_key, api_secret, secure: true });
  return cloudinary;
}

export type UploadFolder =
  | "users/avatars"       // Ảnh đại diện người dùng
  | "users/kyc"           // Ảnh CCCD / giấy tờ KYC
  | "clubs/logos"         // Logo câu lạc bộ
  | "clubs/covers"        // Ảnh bìa câu lạc bộ
  | "clubs/gallery"       // Bộ sưu tập ảnh câu lạc bộ
  | "courts/images"       // Ảnh sân bóng
  | "documents/licenses"  // Giấy phép kinh doanh
  | "payments/proofs";    // Ảnh bằng chứng thanh toán

export interface UploadResult {
  url: string;           // URL công khai để hiển thị
  secureUrl: string;     // HTTPS URL (dùng trong production)
  publicId: string;      // ID để xóa/cập nhật ảnh sau này
  width: number;
  height: number;
  format: string;
  bytes: number;
}

/**
 * Upload một ảnh lên Cloudinary từ Buffer (binary data)
 * @param buffer - Binary data của file ảnh
 * @param folder - Thư mục lưu trữ trên Cloudinary
 * @param publicId - Tên định danh (nếu muốn ghi đè ảnh cũ)
 */
export async function uploadImage(
  buffer: Buffer,
  folder: UploadFolder,
  publicId?: string
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const uploadOptions: Record<string, unknown> = {
      folder,
      resource_type: "image",
      // Tự động tối ưu chất lượng và format
      quality: "auto",
      fetch_format: "auto",
      // Giới hạn kích thước upload tối đa: 5MB
      allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
    };

    if (publicId) {
      uploadOptions.public_id = publicId;
      uploadOptions.overwrite = true;
    }

    const cld = getConfiguredCloudinary();
    const uploadStream = cld.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error || !result) {
          return reject(new Error(error?.message || "Upload thất bại"));
        }
        resolve({
          url: result.url,
          secureUrl: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
        });
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * Xóa một ảnh khỏi Cloudinary theo publicId
 */
export async function deleteImage(publicId: string): Promise<boolean> {
  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch {
    return false;
  }
}

export default cloudinary;
