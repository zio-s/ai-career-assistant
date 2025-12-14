'use client';

/**
 * 드래그앤드롭 파일 업로더 컴포넌트
 * PDF, Word 파일 지원
 */

import { useState, useCallback, useRef } from 'react';
import { Upload, FileText, X, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FileUploaderProps {
  onFileContent: (content: string, fileName: string) => void;
  isLoading?: boolean;
  accept?: string;
  maxSizeMB?: number;
  className?: string;
}

export default function FileUploader({
  onFileContent,
  isLoading = false,
  accept = '.pdf,.doc,.docx',
  maxSizeMB = 10,
  className,
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const validateFile = useCallback(
    (file: File): string | null => {
      const maxSize = maxSizeMB * 1024 * 1024;
      if (file.size > maxSize) {
        return `파일 크기는 ${maxSizeMB}MB 이하여야 합니다`;
      }

      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
      if (!allowedTypes.includes(file.type)) {
        return 'PDF 또는 Word 파일만 업로드 가능합니다';
      }

      return null;
    },
    [maxSizeMB]
  );

  const parseFile = useCallback(
    async (file: File) => {
      setIsParsing(true);
      setError(null);

      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/parse-file', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (result.success) {
          onFileContent(result.data.text, file.name);
        } else {
          setError(result.error || '파일 파싱에 실패했습니다');
        }
      } catch {
        setError('파일 처리 중 오류가 발생했습니다');
      } finally {
        setIsParsing(false);
      }
    },
    [onFileContent]
  );

  const handleFile = useCallback(
    (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      setSelectedFile(file);
      setError(null);
      parseFile(file);
    },
    [validateFile, parseFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile]
  );

  const handleButtonClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className={cn('w-full', className)}>
      {/* 드래그앤드롭 영역 */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative border-2 border-dashed rounded-2xl p-8 transition-all cursor-pointer',
          isDragging
            ? 'border-indigo-500 bg-indigo-50'
            : 'border-[#E8E2D9] hover:border-indigo-300 hover:bg-indigo-50/30',
          (isParsing || isLoading) && 'pointer-events-none opacity-60'
        )}
        onClick={handleButtonClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          disabled={isParsing || isLoading}
        />

        {/* 파일 선택 전 */}
        {!selectedFile && !isParsing && (
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
              <Upload className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="font-medium text-[#1E293B] mb-2">
              이력서 파일을 드래그하거나 클릭하여 업로드
            </h3>
            <p className="text-sm text-[#64748B] mb-4">PDF, Word 파일 지원 (최대 {maxSizeMB}MB)</p>
            <Button
              type="button"
              variant="outline"
              className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
              onClick={e => {
                e.stopPropagation();
                handleButtonClick();
              }}
            >
              <Upload className="w-4 h-4 mr-2" />
              파일 선택
            </Button>
          </div>
        )}

        {/* 파싱 중 */}
        {isParsing && (
          <div className="flex flex-col items-center justify-center text-center py-4">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
            <p className="text-[#1E293B] font-medium">파일을 분석하고 있습니다...</p>
            <p className="text-sm text-[#64748B]">잠시만 기다려주세요</p>
          </div>
        )}

        {/* 파일 선택됨 */}
        {selectedFile && !isParsing && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                <FileText className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="font-medium text-[#1E293B]">{selectedFile.name}</p>
                <p className="text-sm text-[#64748B]">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={e => {
                e.stopPropagation();
                handleRemoveFile();
              }}
              className="text-gray-500 hover:text-red-600"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        )}
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
