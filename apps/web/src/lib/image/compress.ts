import imageCompression from 'browser-image-compression';

export interface ImageOptimizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  convertToWebP?: boolean;
}

export interface OptimizedImage {
  file: File;
  preview: string;
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
}

const DEFAULT_OPTIONS: Required<ImageOptimizeOptions> = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.8,
  convertToWebP: true,
};

/**
 * 이미지를 최적화합니다 (WebP 변환, 리사이징, 압축)
 */
export async function optimizeImage(
  file: File,
  options: ImageOptimizeOptions = {}
): Promise<OptimizedImage> {
  const { maxWidth, maxHeight, quality, convertToWebP } = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  const originalSize = file.size;

  const compressedFile = await imageCompression(file, {
    maxWidthOrHeight: Math.max(maxWidth, maxHeight),
    initialQuality: quality,
    fileType: convertToWebP ? 'image/webp' : undefined,
    useWebWorker: true,
  });

  // WebP 파일명 변환
  const baseName = file.name.replace(/\.[^.]+$/, '');
  const fileName = convertToWebP ? `${baseName}.webp` : file.name;

  const optimizedFile = new File([compressedFile], fileName, {
    type: convertToWebP ? 'image/webp' : compressedFile.type,
  });

  const preview = URL.createObjectURL(optimizedFile);

  return {
    file: optimizedFile,
    preview,
    originalSize,
    optimizedSize: optimizedFile.size,
    compressionRatio: Math.round((1 - optimizedFile.size / originalSize) * 100),
  };
}

/**
 * 미리보기 URL을 해제합니다
 */
export function revokePreview(preview: string): void {
  URL.revokeObjectURL(preview);
}
