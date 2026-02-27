import { useCallback, useState } from 'react';
import { Upload } from '@/components/ui/icons';
import { toast } from 'sonner';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  fileName: string | null;
}

export function FileUpload({ onFileSelect, fileName }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const validateFile = useCallback((file: File): boolean => {
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File too large. Maximum size is 10MB.');
      return false;
    }
    return true;
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type === 'text/csv') {
        if (validateFile(file)) {
          onFileSelect(file);
        }
      }
    },
    [onFileSelect, validateFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        if (validateFile(file)) {
          onFileSelect(file);
        }
      }
    },
    [onFileSelect, validateFile]
  );

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative rounded-lg transition-all cursor-pointer
        flex flex-col items-center justify-center py-8 px-4 overflow-hidden
        border border-border shadow-[inset_0_2px_8px_rgba(0,0,0,0.4)]
        ${isDragging ? 'border-border bg-white/5' : 'hover:border-border hover:shadow-[inset_0_2px_12px_rgba(0,0,0,0.5)]'}
      `}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/10 pointer-events-none" />
      <input
        type="file"
        accept=".csv"
        onChange={handleFileInput}
        className="hidden"
        id="csv-upload"
      />
      <label htmlFor="csv-upload" className="cursor-pointer text-center">
        <Upload className="w-6 h-6 mx-auto mb-3 text-muted-foreground" />
        {fileName ? (
          <p className="text-sm">{fileName}</p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Drop CSV here or click to select
            </p>
          </>
        )}
      </label>
    </div>
  );
}
