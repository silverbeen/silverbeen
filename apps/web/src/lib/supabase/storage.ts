import { createClient } from './client';

const BUCKET_NAME = 'images';

export interface UploadResult {
  url: string;
  path: string;
}

export interface UploadError {
  message: string;
}

/**
 * Supabase Storage에 이미지를 업로드합니다.
 * @param file - 업로드할 파일
 * @param folder - 저장할 폴더 경로 (예: 'posts', 'covers')
 * @returns 업로드된 이미지의 공개 URL
 */
export async function uploadImage(
  file: File,
  folder: string = 'posts'
): Promise<UploadResult> {
  const supabase = createClient();

  // 파일 확장자 추출
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';

  // 허용된 이미지 확장자 검증
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  if (!allowedExtensions.includes(fileExt)) {
    throw new Error('지원하지 않는 이미지 형식입니다. (jpg, jpeg, png, gif, webp만 허용)');
  }

  // 파일 크기 검증 (5MB 제한)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('파일 크기는 5MB를 초과할 수 없습니다.');
  }

  // 고유한 파일명 생성
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const fileName = `${folder}/${timestamp}-${randomStr}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw new Error(`이미지 업로드 실패: ${error.message}`);
  }

  // 공개 URL 생성
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path);

  return {
    url: urlData.publicUrl,
    path: data.path,
  };
}

/**
 * Supabase Storage에서 이미지를 삭제합니다.
 * @param path - 삭제할 이미지 경로
 */
export async function deleteImage(path: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.storage.from(BUCKET_NAME).remove([path]);

  if (error) {
    throw new Error(`이미지 삭제 실패: ${error.message}`);
  }
}
