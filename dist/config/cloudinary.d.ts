import { v2 as cloudinary } from 'cloudinary';
export declare const uploadToCloudinary: (file: Express.Multer.File) => Promise<string>;
export declare const deleteFromCloudinary: (publicId: string) => Promise<void>;
export default cloudinary;
//# sourceMappingURL=cloudinary.d.ts.map