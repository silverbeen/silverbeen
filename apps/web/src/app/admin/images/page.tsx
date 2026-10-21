'use client';

import { useState, useMemo } from 'react';
import { Plus, Trash2, Search, Check, X } from 'lucide-react';
import { deleteImage, deleteImages, listImages, type StoredImage } from '@/lib/supabase/storage';
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
import { AdminPageShell } from '@/components/admin/AdminPageShell';
import { ImageCard } from '@/components/admin/images/ImageCard';
import { UploadFolderModal } from '@/components/admin/images/UploadFolderModal';
import {
  ALL_FOLDERS_VALUE,
  FOLDER_FILTER_OPTIONS,
  IMAGE_FOLDER_VALUES,
} from '@/components/admin/images/constants';
import { useAdminResource } from '@/hooks/useAdminResource';

const loadImages = () => listImages(IMAGE_FOLDER_VALUES);

function ImageGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="aspect-square animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"
        />
      ))}
    </div>
  );
}

export default function AdminImagesPage() {
  const {
    data: images,
    setData: setImages,
    loading,
    error,
    reload,
  } = useAdminResource<StoredImage[]>(loadImages, []);
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>(ALL_FOLDERS_VALUE);
  const [uploadFolder, setUploadFolder] = useState<string>('posts');
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const { toast } = useToast();
  const { confirm } = useConfirm();

  const filteredImages = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return images.filter(
      (image) =>
        image.name.toLowerCase().includes(query) &&
        (selectedFolder === ALL_FOLDERS_VALUE || image.folder === selectedFolder),
    );
  }, [images, searchQuery, selectedFolder]);

  const removeFromList = (paths: string[]) => {
    const removed = new Set(paths);
    setImages((prev) => prev.filter((img) => !removed.has(img.path)));
  };

  const handleDelete = async (image: StoredImage) => {
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
      removeFromList([image.path]);
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
    setSelectedImages(new Set(filteredImages.map((img) => img.path)));
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

    const paths = Array.from(selectedImages);
    try {
      await deleteImages(paths);
      removeFromList(paths);
      toast(`${paths.length}개의 이미지가 삭제되었습니다.`, 'success');
    } catch {
      toast('이미지 삭제에 실패했습니다.', 'error');
    } finally {
      clearSelection();
    }
  };

  const actions = isSelectionMode ? (
    <>
      <span className="text-sm text-gray-600 dark:text-gray-400">{selectedImages.size}개 선택</span>
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
      <Button variant="ghost" size="icon-sm" onClick={clearSelection} aria-label="선택 취소">
        <X className="h-5 w-5" />
      </Button>
    </>
  ) : (
    <>
      <Button variant="outline" size="sm" onClick={() => setIsSelectionMode(true)}>
        <Check className="h-4 w-4" />
        선택
      </Button>
      <Button size="sm" onClick={() => setFolderModalOpen(true)}>
        <Plus className="h-4 w-4" />
        업로드
      </Button>
    </>
  );

  return (
    <AdminPageShell
      title="이미지 관리"
      maxWidth="7xl"
      actions={actions}
      loading={loading}
      error={error}
      onRetry={reload}
      skeleton={<ImageGridSkeleton />}
    >
      {/* 필터 */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <div className="relative max-w-md flex-1">
          <Search className="absolute top-1/2 left-3 z-10 h-4 w-4 -translate-y-1/2 text-gray-400" />
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
            {FOLDER_FILTER_OPTIONS.map((folder) => (
              <SelectItem key={folder.value} value={folder.value}>
                {folder.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredImages.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            {searchQuery || selectedFolder !== ALL_FOLDERS_VALUE
              ? '검색 결과가 없습니다.'
              : '이미지가 없습니다.'}
          </p>
        </div>
      ) : (
        <>
          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            총 {filteredImages.length}개의 이미지
          </p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
            {filteredImages.map((image) => (
              <ImageCard
                key={image.path}
                image={image}
                selectionMode={isSelectionMode}
                selected={selectedImages.has(image.path)}
                onToggleSelect={toggleImageSelection}
                onCopyUrl={handleCopyUrl}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </>
      )}

      <UploadFolderModal
        isOpen={folderModalOpen}
        folder={uploadFolder}
        onFolderChange={setUploadFolder}
        onClose={() => setFolderModalOpen(false)}
        onConfirm={() => {
          setFolderModalOpen(false);
          setUploadModalOpen(true);
        }}
      />

      <ImageUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSelect={() => {
          setUploadModalOpen(false);
          void reload();
        }}
        folder={uploadFolder}
        title="이미지 업로드"
      />
    </AdminPageShell>
  );
}
