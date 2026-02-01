'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { deleteImage } from '@/lib/supabase/storage';
import {
  ImageUploadModal,
  useToast,
  useConfirm,
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { Plus, Trash2, Copy, Search, ArrowLeft, Check, X } from 'lucide-react';
import Link from 'next/link';

interface ImageFile {
  name: string;
  url: string;
  path: string;
  folder: string;
  createdAt: string;
}

const FOLDERS = [
  { value: 'all', label: '전체' },
  { value: 'posts', label: '포스트' },
  { value: 'covers', label: '커버' },
  { value: 'profiles', label: '프로필' },
  { value: 'resume', label: '이력서' },
  { value: 'portfolio', label: '포트폴리오' },
];

export default function AdminImagesPage() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [uploadFolder, setUploadFolder] = useState('posts');
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const supabase = useMemo(() => createClient(), []);

  const fetchImages = useCallback(async () => {
    setLoading(true);
    try {
      // FOLDERS 상수에서 'all'을 제외하고 동적으로 생성
      const foldersToFetch = FOLDERS.filter((f) => f.value !== 'all').map(
        (f) => f.value
      );

      // 병렬로 모든 폴더의 이미지 가져오기 (페이지네이션 적용)
      const PAGE_SIZE = 100;
      const imagePromises = foldersToFetch.map(async (folder) => {
        const folderImages: ImageFile[] = [];
        let offset = 0;
        let hasMore = true;

        // 페이지네이션 루프로 모든 이미지 가져오기
        while (hasMore) {
          const { data, error } = await supabase.storage
            .from('images')
            .list(folder, {
              sortBy: { column: 'created_at', order: 'desc' },
              limit: PAGE_SIZE,
              offset,
            });

          if (error) {
            console.error(`Error fetching images from ${folder}:`, error);
            break;
          }

          const validFiles = data.filter((file) => !file.name.startsWith('.'));
          folderImages.push(
            ...validFiles.map((file) => ({
              name: file.name,
              path: `${folder}/${file.name}`,
              folder,
              url: supabase.storage
                .from('images')
                .getPublicUrl(`${folder}/${file.name}`).data.publicUrl,
              createdAt: file.created_at || '',
            }))
          );

          // 다음 페이지가 있는지 확인
          hasMore = data.length === PAGE_SIZE;
          offset += PAGE_SIZE;
        }

        return folderImages;
      });

      const results = await Promise.all(imagePromises);
      const allImages = results.flat();

      // 최신순 정렬
      allImages.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setImages(allImages);
    } catch {
      toast('이미지 목록을 불러오는데 실패했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  }, [supabase, toast]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const handleDelete = async (image: ImageFile) => {
    const confirmed = await confirm({
      title: '이미지 삭제',
      message: '이 이미지를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
      confirmText: '삭제',
      cancelText: '취소',
      variant: 'danger',
    });

    if (!confirmed) return;

    try {
      await deleteImage(image.path);
      setImages((prev) => prev.filter((img) => img.path !== image.path));
      toast('이미지가 삭제되었습니다.', 'success');
    } catch {
      toast('이미지 삭제에 실패했습니다.', 'error');
    }
  };

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast('URL이 복사되었습니다.', 'success');
    } catch {
      toast('URL 복사에 실패했습니다.', 'error');
    }
  };

  const toggleImageSelection = (path: string) => {
    setSelectedImages((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const selectAllImages = () => {
    const allPaths = filteredImages.map((img) => img.path);
    setSelectedImages(new Set(allPaths));
  };

  const clearSelection = () => {
    setSelectedImages(new Set());
    setIsSelectionMode(false);
  };

  const handleBulkDelete = async () => {
    if (selectedImages.size === 0) return;

    const confirmed = await confirm({
      title: '선택한 이미지 삭제',
      message: `${selectedImages.size}개의 이미지를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`,
      confirmText: '삭제',
      cancelText: '취소',
      variant: 'danger',
    });

    if (!confirmed) return;

    const pathsToDelete = Array.from(selectedImages);
    const results = await Promise.allSettled(
      pathsToDelete.map((path) => deleteImage(path).then(() => path))
    );

    const successfulPaths = new Set<string>();
    let failedCount = 0;

    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        successfulPaths.add(result.value);
      } else {
        failedCount++;
      }
    });

    // 성공한 이미지만 목록에서 제거
    if (successfulPaths.size > 0) {
      setImages((prev) => prev.filter((img) => !successfulPaths.has(img.path)));
    }

    // 항상 선택 해제
    clearSelection();

    // 결과에 따른 토스트 메시지
    if (failedCount === 0) {
      toast(`${successfulPaths.size}개의 이미지가 삭제되었습니다.`, 'success');
    } else if (successfulPaths.size === 0) {
      toast('이미지 삭제에 실패했습니다.', 'error');
    } else {
      toast(
        `${successfulPaths.size}개 삭제, ${failedCount}개 실패`,
        'warning'
      );
    }
  };

  const filteredImages = images.filter((image) => {
    const matchesSearch = image.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFolder =
      selectedFolder === 'all' || image.folder === selectedFolder;
    return matchesSearch && matchesFolder;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 헤더 */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                이미지 관리
              </h1>
            </div>
            <div className="flex items-center gap-2">
              {isSelectionMode ? (
                <>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedImages.size}개 선택
                  </span>
                  <Button variant="outline" size="sm" onClick={selectAllImages}>
                    전체 선택
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
                    disabled={selectedImages.size === 0}
                  >
                    <Trash2 className="h-4 w-4" />
                    삭제
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={clearSelection}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsSelectionMode(true)}
                  >
                    <Check className="h-4 w-4" />
                    선택
                  </Button>
                  <Button size="sm" onClick={() => setFolderModalOpen(true)}>
                    <Plus className="h-4 w-4" />
                    업로드
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* 필터 */}
          <div className="mt-4 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="파일명으로 검색..."
                className="pl-10"
              />
            </div>
            <Select value={selectedFolder} onValueChange={setSelectedFolder}>
              <SelectTrigger className="w-35">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FOLDERS.map((folder) => (
                  <SelectItem key={folder.value} value={folder.value}>
                    {folder.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {/* 이미지 그리드 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery || selectedFolder !== 'all'
                ? '검색 결과가 없습니다.'
                : '이미지가 없습니다.'}
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              총 {filteredImages.length}개의 이미지
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredImages.map((image) => {
                const isSelected = selectedImages.has(image.path);
                return (
                  <div
                    key={image.path}
                    onClick={
                      isSelectionMode
                        ? () => toggleImageSelection(image.path)
                        : undefined
                    }
                    onKeyDown={
                      isSelectionMode
                        ? (e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              toggleImageSelection(image.path);
                            }
                          }
                        : undefined
                    }
                    role={isSelectionMode ? 'button' : undefined}
                    tabIndex={isSelectionMode ? 0 : undefined}
                    aria-pressed={isSelectionMode ? isSelected : undefined}
                    aria-label={
                      isSelectionMode
                        ? `${image.name} ${isSelected ? '선택됨' : '선택 안됨'}`
                        : undefined
                    }
                    className={`group relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 transition-colors ${
                      isSelected
                        ? 'border-primary-500 ring-2 ring-primary-500/30'
                        : 'border-gray-200 dark:border-gray-700'
                    } ${isSelectionMode ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500' : ''}`}
                  >
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {/* 선택 모드 체크박스 */}
                    {isSelectionMode && (
                      <div
                        className={`absolute top-2 left-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-primary-500 border-primary-500'
                            : 'bg-white/80 border-gray-300'
                        }`}
                      >
                        {isSelected && (
                          <Check className="h-4 w-4 text-white" />
                        )}
                      </div>
                    )}
                    {/* 호버 오버레이 (선택 모드가 아닐 때만) */}
                    {!isSelectionMode && (
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleCopyUrl(image.url)}
                          className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                          title="URL 복사"
                        >
                          <Copy className="h-4 w-4 text-gray-700" />
                        </button>
                        <button
                          onClick={() => handleDelete(image)}
                          className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          title="삭제"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                    {/* 파일 정보 */}
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                      <p className="text-xs text-white truncate">{image.name}</p>
                      <p className="text-xs text-gray-300">
                        {FOLDERS.find((f) => f.value === image.folder)?.label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>

      {/* 폴더 선택 모달 */}
      {folderModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg mx-4 bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              업로드 폴더 선택
            </h3>
            <div className="mb-4">
              <Select value={uploadFolder} onValueChange={setUploadFolder}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FOLDERS.filter((f) => f.value !== 'all').map((folder) => (
                    <SelectItem key={folder.value} value={folder.value}>
                      {folder.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFolderModalOpen(false)}
              >
                취소
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setFolderModalOpen(false);
                  setUploadModalOpen(true);
                }}
              >
                확인
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 이미지 업로드 모달 */}
      <ImageUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSelect={() => {
          setUploadModalOpen(false);
          fetchImages();
        }}
        folder={uploadFolder}
        title="이미지 업로드"
      />
    </div>
  );
}
