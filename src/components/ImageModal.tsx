"use client";

import { useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import Image from 'next/image';

type MemeItem = { id: number; src: string; kind: "user" | "feed" };

interface ImageModalProps {
  meme: MemeItem;
  memeTitle: string;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function ImageModal({
  meme,
  memeTitle,
  onClose,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
}: ImageModalProps) {
  // Убираем состояние загрузки, так как мы полагаемся на предзагрузку

  // Обработчик событий клавиатуры
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && hasNext) onNext();
      if (e.key === 'ArrowLeft' && hasPrev) onPrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNext, onPrev, hasNext, hasPrev]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="relative bg-neutral-900 p-4 md:p-6 rounded-xl border border-neutral-700 w-11/12 max-w-4xl max-h-[90vh] flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-xl">{memeTitle}</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-neutral-800 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Контейнер для изображения. Теперь без спиннера и логики загрузки. */}
        <div className="relative flex-grow flex items-center justify-center">
          <Image
            key={meme.id}
            src={meme.src}
            alt={memeTitle}
            width={1000}
            height={1000}
            className="max-w-full max-h-[70vh] w-auto h-auto object-contain"
            priority // Повышаем приоритет загрузки
          />
        </div>
      </div>

      {/* Стрелки навигации */}
      {hasPrev && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full hover:bg-black/80 transition-colors z-10"
        >
          <ChevronLeft size={32} />
        </button>
      )}
      {hasNext && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full hover:bg-black/80 transition-colors z-10"
        >
          <ChevronRight size={32} />
        </button>
      )}
    </div>
  );
}