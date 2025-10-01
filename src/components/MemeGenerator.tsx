"use client";

import { useState, useRef, useEffect } from "react";
import JSZip from "jszip";
import Image from "next/image";
import { Button } from "./ui/Button";
import ImageModal from "./ImageModal";
import { useToasts } from "../hooks/useToasts";

type MemeItem = { id: number; src: string; isNew?: boolean; kind: "user" | "feed" };

// Функция для предзагрузки изображений в кэш браузера
const preloadImage = (src: string) => {
  const img = new window.Image();
  img.src = src;
};

export default function MemeGenerator() {
  const [text, setText] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const feedTimerRef = useRef<number | null>(null);
  const highlightTimeouts = useRef<number[]>([]);

  const MEME_POOL = [
    "/drake-meme.png",
    ...Array.from({ length: 50 }).map((_, i) => `/meme-${i + 1}.png`),
  ];

  const [generatedMemes, setGeneratedMemes] = useState<MemeItem[]>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMemeId, setSelectedMemeId] = useState<number | null>(null);

  const { addToast } = useToasts();
  const MAX_STORED_MEMES = 100; // Define a reasonable limit for stored memes

  // Хелпер для создания пачки новых мемов
  const createNewFeedMemes = (count: number) => {
    return Array.from({ length: count }).map((_, index) => ({
      id: Date.now() + Math.random() + index,
      src: MEME_POOL[Math.floor(Math.random() * MEME_POOL.length)],
      kind: "feed" as const,
    }));
  };

  // Загружаем мемы из localStorage при первой загрузке, или создаем новые
  useEffect(() => {
    try {
      const savedMemes = localStorage.getItem('generatedMemes');
      if (savedMemes) {
        const parsedMemes = JSON.parse(savedMemes);
        if (Array.isArray(parsedMemes) && parsedMemes.length > 0) {
          // Если нашли, добавляем 15 новых в начало
          const newMemesOnRefresh = createNewFeedMemes(15);
          setGeneratedMemes([...newMemesOnRefresh, ...parsedMemes]);
          return; // Загрузили, выходим
        }
      }
    } catch (error) {
      console.error("Ошибка загрузки мемов из localStorage:", error);
    }
    // Резервный вариант для самого первого посещения
    setGeneratedMemes(createNewFeedMemes(111));
  }, []); // Пустой массив зависимостей гарантирует, что это выполнится только один раз

  // Сохраняем мемы в localStorage при каждом их изменении
  useEffect(() => {
    if (generatedMemes.length > 0) {
      try {
        localStorage.setItem('generatedMemes', JSON.stringify(generatedMemes.slice(0, MAX_STORED_MEMES)));
      } catch (error) {
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          console.error("QuotaExceededError: Failed to save memes. Storage limit reached.", error);
          addToast("Storage limit reached! Some older memes might not be saved.", "error");
        } else {
          console.error("Error saving memes to localStorage:", error);
        }
      }
    }
  }, [generatedMemes, addToast]); // Added addToast to dependency array

  useEffect(() => {
    const image = new window.Image();
    image.src = "/drake-meme.png";
    image.crossOrigin = "anonymous";
    image.onload = () => {
      if (imageRef.current) {
        imageRef.current.src = image.src;
        setImageLoaded(true);
      }
    };
  }, []);

  const openModal = (id: number) => {
    setSelectedMemeId(id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMemeId(null);
  };

  const selectedMemeIndex = selectedMemeId !== null
    ? generatedMemes.findIndex((meme) => meme.id === selectedMemeId)
    : -1;
  const selectedMeme = selectedMemeIndex !== -1 ? generatedMemes[selectedMemeIndex] : null;

  const showNextMeme = () => {
    if (selectedMemeIndex !== -1 && selectedMemeIndex < generatedMemes.length - 1) {
      setSelectedMemeId(generatedMemes[selectedMemeIndex + 1].id);
    }
  };

  const showPrevMeme = () => {
    if (selectedMemeIndex > 0) {
      setSelectedMemeId(generatedMemes[selectedMemeIndex - 1].id);
    }
  };

  const generateMeme = () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (canvas && image && imageLoaded && text.trim()) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        ctx.drawImage(image, 0, 0);
        ctx.fillStyle = "white";
        const fontSize = canvas.width * 0.045;
        ctx.font = `${fontSize}px Arial, sans-serif`;
        ctx.textBaseline = "middle";
        const yPos = canvas.height * 0.90;
        const metrics = ctx.measureText(text);
        const textHeight = fontSize * 1.4;
        const textWidth = metrics.width + fontSize * 0.5;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.textAlign = "left";
        ctx.fillRect(40, yPos - textHeight / 2, textWidth, textHeight);
        ctx.fillStyle = 'white';
        ctx.fillText(text, 40 + fontSize * 0.25, yPos);

        const newMemeUrl = canvas.toDataURL("image/png");
        const newMeme: MemeItem = { id: Date.now(), src: newMemeUrl, kind: "user" };

        setGeneratedMemes(prev => [newMeme, ...prev]);
        setText("");
        openModal(newMeme.id);
      }
    }
  };

  const handleSaveAll = async () => {
    const zip = new JSZip();
    generatedMemes.forEach((item, index) => {
      if (item.kind === "user" && item.src.startsWith("data:image/")) {
        const memeNumber = generatedMemes.length - index;
        const base64Data = item.src.split(",")[1];
        zip.file(`meme-${memeNumber}.png`, base64Data, { base64: true });
      }
    });
    const content = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = 'memes-dashboard.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  useEffect(() => {
    const scheduleNext = () => {
      const delay = Math.floor(Math.random() * 900) + 100;
      feedTimerRef.current = window.setTimeout(() => {
        const randomSrc = MEME_POOL[Math.floor(Math.random() * MEME_POOL.length)];
        const newMeme: MemeItem = { id: Date.now() + Math.random(), src: randomSrc, kind: "feed", isNew: true };
        setGeneratedMemes(prev => [newMeme, ...prev]);
        const memeNumber = generatedMemes.length + 1;
        addToast(`A new bother has appeared: Bother #${memeNumber}`);

        const t = window.setTimeout(() => {
          setGeneratedMemes(prev =>
            prev.map(meme =>
              meme.id === newMeme.id ? { ...meme, isNew: false } : meme
            )
          );
        }, 1400);
        highlightTimeouts.current.push(t);
        scheduleNext();
      }, delay);
    };
    scheduleNext();
    return () => {
      if (feedTimerRef.current) clearTimeout(feedTimerRef.current);
      highlightTimeouts.current.forEach((id) => clearTimeout(id));
      highlightTimeouts.current = [];
    };
  }, [addToast, generatedMemes.length]);

  return (
    <>
      <div className="flex flex-col items-center w-full max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-white mb-8">
          Tell what bothers you
        </h1>
        <div className="relative w-full max-w-xl min-h-[300px] bg-neutral-800 rounded-lg flex items-center justify-center overflow-hidden border border-neutral-700 mx-auto">
          <img ref={imageRef} alt="Meme template" className="hidden" />
          <canvas ref={canvasRef} className="hidden" />
          <img src="/drake-meme.png" alt="Meme template" className="w-full h-auto" />
          <input
            type="text"
            placeholder="Enter text..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') generateMeme();
            }}
            style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}
            className="absolute bottom-[10%] left-4 w-3/4 p-4 bg-black bg-opacity-30 border-2 border-dashed border-gray-400 rounded-md text-white text-xl focus:outline-none focus:border-solid focus:border-white transition"
          />
        </div>
        <div className="mt-6">
          <Button onClick={generateMeme} variant="light" className="px-12 py-3 text-lg pulse-animation">
            THAT BOTHERS ME
          </Button>
        </div>
        {generatedMemes.length > 0 && (
          <div className="w-full mt-12 border-t-2 border-neutral-700 pt-8">
            <h2 className="text-3xl font-bold text-center mb-6">What bothers others</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {generatedMemes.map((item, index) => (
                <div
                  key={item.id}
                  className={`flex flex-col gap-3 p-4 bg-neutral-800 rounded-lg border border-neutral-700 transition-shadow cursor-pointer hover:border-purple-600 ${
                    item.isNew ? "new-meme-highlight" : ""
                  }`}
                  onClick={() => openModal(item.id)}
                  onMouseEnter={() => preloadImage(item.src)}
                >
                  <div className="relative w-full aspect-square">
                    <Image
                      src={item.src}
                      alt={`Bother #${generatedMemes.length - index}`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover rounded-md"
                    />
                  </div>
                  <p className="text-center font-semibold">
                    Bother #{generatedMemes.length - index}
                  </p>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Button onClick={handleSaveAll} variant="primary" className="py-3 text-lg px-12">
                Сохранить Все (.zip)
              </Button>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && selectedMeme && (
        <ImageModal
          meme={selectedMeme}
          memeTitle={
            selectedMeme.kind === 'user'
              ? 'Your Creation'
              : `Bother #${generatedMemes.length - (selectedMemeIndex ?? 0)}`
          }
          onClose={closeModal}
          onNext={showNextMeme}
          onPrev={showPrevMeme}
          hasNext={selectedMemeIndex !== -1 && selectedMemeIndex < generatedMemes.length - 1}
          hasPrev={selectedMemeIndex > 0}
        />
      )}
    </>
  );
}
