export const IMAGE_FOLDERS = [
  { value: 'posts', label: '포스트' },
  { value: 'covers', label: '커버' },
  { value: 'profiles', label: '프로필' },
  { value: 'resume', label: '이력서' },
  { value: 'portfolio', label: '포트폴리오' },
] as const;

export const ALL_FOLDERS_VALUE = 'all';

export const FOLDER_FILTER_OPTIONS = [
  { value: ALL_FOLDERS_VALUE, label: '전체' },
  ...IMAGE_FOLDERS,
] as const;

export const IMAGE_FOLDER_VALUES: string[] = IMAGE_FOLDERS.map((f) => f.value);

export function getFolderLabel(folder: string): string | undefined {
  return IMAGE_FOLDERS.find((f) => f.value === folder)?.label;
}
