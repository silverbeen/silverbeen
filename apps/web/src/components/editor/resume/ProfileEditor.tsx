'use client';

import { useState } from 'react';
import type { Profile } from '@/types/resume';
import { FormField, inputClassName, AutoTextarea } from '../FormField';
import { ImageUploadModal } from '@/components/ui';
import { User, Mail, Github, Globe, Linkedin, Phone, Upload, Trash2 } from 'lucide-react';

interface ProfileEditorProps {
  data: Profile;
  onChange: (data: Profile) => void;
  errors?: Record<string, string>;
}

export function ProfileEditor({ data, onChange, errors }: ProfileEditorProps) {
  const [imageModalOpen, setImageModalOpen] = useState(false);

  const handleChange = (field: keyof Profile, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-8">
      {/* 프로필 사진 섹션 */}
      <div className="flex items-start gap-6 p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="relative group">
          {data.photo ? (
            <img
              src={data.photo}
              alt="Profile"
              className="w-24 h-24 rounded-2xl object-cover border-2 border-gray-200 dark:border-gray-600"
            />
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
              <User className="w-10 h-10 text-gray-400" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setImageModalOpen(true)}
              className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Upload className="w-4 h-4 text-gray-700" />
            </button>
            {data.photo && (
              <button
                type="button"
                onClick={() => handleChange('photo', '')}
                className="p-2 bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4 text-white" />
              </button>
            )}
          </div>
        </div>
        <div className="flex-1 space-y-4">
          <FormField label="이름" required error={errors?.['profile.name']}>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={data.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`${inputClassName} pl-10`}
                placeholder="홍길동"
              />
            </div>
          </FormField>
          <FormField label="직함" error={errors?.['profile.title']}>
            <input
              type="text"
              value={data.title || ''}
              onChange={(e) => handleChange('title', e.target.value)}
              className={inputClassName}
              placeholder="프론트엔드 개발자"
            />
          </FormField>
        </div>
      </div>

      {/* 연락처 섹션 */}
      <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Mail className="w-4 h-4 text-primary-500" />
          연락처
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="이메일" required error={errors?.['profile.email']}>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={data.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className={`${inputClassName} pl-10`}
                placeholder="email@example.com"
              />
            </div>
          </FormField>
          <FormField label="전화번호" error={errors?.['profile.phone']}>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="tel"
                value={data.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                className={`${inputClassName} pl-10`}
                placeholder="010-1234-5678"
              />
            </div>
          </FormField>
        </div>
      </div>

      {/* 소셜 링크 섹션 */}
      <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary-500" />
          소셜 링크
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="GitHub" required error={errors?.['profile.github']}>
            <div className="relative">
              <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="url"
                value={data.github}
                onChange={(e) => handleChange('github', e.target.value)}
                className={`${inputClassName} pl-10`}
                placeholder="https://github.com/username"
              />
            </div>
          </FormField>
          <FormField label="블로그" required error={errors?.['profile.blog']}>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="url"
                value={data.blog}
                onChange={(e) => handleChange('blog', e.target.value)}
                className={`${inputClassName} pl-10`}
                placeholder="https://blog.example.com"
              />
            </div>
          </FormField>
          <FormField label="LinkedIn" error={errors?.['profile.linkedin']}>
            <div className="relative">
              <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="url"
                value={data.linkedin || ''}
                onChange={(e) => handleChange('linkedin', e.target.value)}
                className={`${inputClassName} pl-10`}
                placeholder="https://linkedin.com/in/username"
              />
            </div>
          </FormField>
        </div>
      </div>

      {/* 소개 섹션 */}
      <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
          소개
        </h4>
        <div className="space-y-4">
          <FormField label="인사말" error={errors?.['profile.greeting']}>
            <input
              type="text"
              value={data.greeting || ''}
              onChange={(e) => handleChange('greeting', e.target.value)}
              className={inputClassName}
              placeholder="안녕하세요, 프론트엔드 개발자 홍길동입니다."
            />
          </FormField>
          <FormField label="자기소개" error={errors?.['profile.introduction']}>
            <AutoTextarea
              value={data.introduction || ''}
              onChange={(e) => handleChange('introduction', e.target.value)}
              placeholder="자신을 소개하는 글을 작성하세요."
              minRows={4}
              maxRows={12}
            />
          </FormField>
        </div>
      </div>

      <ImageUploadModal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        onSelect={(url) => {
          handleChange('photo', url);
          setImageModalOpen(false);
        }}
        folder="profiles"
        title="프로필 사진 업로드"
      />
    </div>
  );
}
