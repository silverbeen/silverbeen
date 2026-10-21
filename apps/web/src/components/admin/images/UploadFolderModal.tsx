'use client';

import {
  Modal,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { IMAGE_FOLDERS } from './constants';

interface UploadFolderModalProps {
  isOpen: boolean;
  folder: string;
  onFolderChange: (folder: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export function UploadFolderModal({
  isOpen,
  folder,
  onFolderChange,
  onClose,
  onConfirm,
}: UploadFolderModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="업로드 폴더 선택"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            취소
          </Button>
          <Button size="sm" onClick={onConfirm}>
            확인
          </Button>
        </>
      }
    >
      <Select value={folder} onValueChange={onFolderChange}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {IMAGE_FOLDERS.map((f) => (
            <SelectItem key={f.value} value={f.value}>
              {f.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Modal>
  );
}
