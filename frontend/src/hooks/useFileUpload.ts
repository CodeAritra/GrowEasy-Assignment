"use client";

import { useState, useCallback, type DragEvent, type ChangeEvent } from "react";

const MAX_FILE_SIZE_BYTES: number = 10 * 1024 * 1024; // 10MB

interface UseFileUploadReturn {
  file: File | null;
  isDragging: boolean;
  error: string | null;
  handleDragOver: (e: DragEvent<HTMLDivElement>) => void;
  handleDragLeave: (e: DragEvent<HTMLDivElement>) => void;
  handleDrop: (e: DragEvent<HTMLDivElement>) => void;
  handleFileSelect: (e: ChangeEvent<HTMLInputElement>) => void;
  resetFile: () => void;
}

/**
 * Custom hook for managing file upload state with drag-and-drop support.
 * Validates file type (.csv) and file size (max 10MB).
 */
export function useFileUpload(): UseFileUploadReturn {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = useCallback((selectedFile: File): boolean => {
    setError(null);

    if (!selectedFile.name.toLowerCase().endsWith(".csv")) {
      setError("Invalid file type. Please upload a .csv file.");
      return false;
    }

    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      setError(
        `File is too large (${(selectedFile.size / 1024 / 1024).toFixed(1)}MB). Maximum size is 10MB.`
      );
      return false;
    }

    if (selectedFile.size === 0) {
      setError("File is empty. Please upload a valid CSV file.");
      return false;
    }

    return true;
  }, []);

  const handleDragOver = useCallback(
    (e: DragEvent<HTMLDivElement>): void => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    },
    []
  );

  const handleDragLeave = useCallback(
    (e: DragEvent<HTMLDivElement>): void => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    },
    []
  );

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>): void => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const droppedFile: File | undefined = e.dataTransfer.files[0];
      if (droppedFile && validateFile(droppedFile)) {
        setFile(droppedFile);
      }
    },
    [validateFile]
  );

  const handleFileSelect = useCallback(
    (e: ChangeEvent<HTMLInputElement>): void => {
      const selectedFile: File | undefined = e.target.files?.[0];
      if (selectedFile && validateFile(selectedFile)) {
        setFile(selectedFile);
      }
    },
    [validateFile]
  );

  const resetFile = useCallback((): void => {
    setFile(null);
    setError(null);
    setIsDragging(false);
  }, []);

  return {
    file,
    isDragging,
    error,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileSelect,
    resetFile,
  };
}
