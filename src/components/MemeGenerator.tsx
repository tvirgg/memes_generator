"use client";

import { useState, useRef, useEffect } from "react";
import JSZip from "jszip";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import Image from "next/image";

export default function MemeGenerator() {
  const [text, setText] = useState("");
  const [generatedMemes, setGeneratedMemes] = useState<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Загружаем изображение при монтировании компонента
  useEffect(() => {
    const image = new window.Image();
    image.src = "/drake-meme.png";
    image.crossOrigin = "anonymous"; // Важно для canvas, если изображение с другого домена
    image.onload = () => {
      if (imageRef.current) {
        imageRef.current.src = image.src;
        setImageLoaded(true);
      }
    };
  }, []);

  const generateMeme = () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (canvas && image && imageLoaded) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Устанавливаем размеры холста равными размерам изображения
        // ИСПРАВЛЕНО: Убираем масштабирование, используем полное разрешение. Это решит проблему с "приближением".
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;

        ctx.drawImage(image, 0, 0);

        // Стилизация текста
        ctx.fillStyle = "white";
        const fontSize = canvas.width * 0.045;
        ctx.font = `${fontSize}px Arial, sans-serif`;
        ctx.textBaseline = "middle";

        // Отрисовка нижнего текста с фоном
        if (text) {
          const yPos = canvas.height * 0.90;
          const metrics = ctx.measureText(text);
          const textHeight = fontSize * 1.4; // Высота фона
          const textWidth = metrics.width + fontSize * 0.5;

          ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'; // Цвет фона
          ctx.textAlign = "left";
          ctx.fillRect(40, yPos - textHeight / 2, textWidth, textHeight);
          
          ctx.fillStyle = 'white'; // Цвет текста
          ctx.fillText(text, 40, yPos);
        }

        const newMemeUrl = canvas.toDataURL("image/png");
        setGeneratedMemes(prevMemes => [...prevMemes, newMemeUrl]);
      }
    }
  };

  const handleSaveSingle = (memeUrl: string, index: number) => {
    const link = document.createElement('a');
    link.href = memeUrl;
    link.download = `meme-${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveAll = async () => {
    const zip = new JSZip();
    
    generatedMemes.forEach((memeUrl, index) => {
      // Убираем префикс data URL, чтобы получить чистые base64 данные
      const base64Data = memeUrl.split(',')[1];
      zip.file(`meme-${index + 1}.png`, base64Data, { base64: true });
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

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold text-center text-white mb-8">
        Генератор Мемов
      </h1>
 
      {/* Редактор (теперь всегда виден) */}
      <div className="relative w-full min-h-[300px] bg-neutral-800 rounded-lg flex items-center justify-center overflow-hidden border border-neutral-700">
        {/* Скрытые элементы для рендеринга */}
        <img ref={imageRef} alt="Meme template" className="hidden" />
        <canvas ref={canvasRef} className="hidden" />
        
        <img src="/drake-meme.png" alt="Meme template" className="w-full h-auto" />
        <input
          type="text"
          placeholder="Введите текст..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}
          className="absolute bottom-[10%] left-4 w-1/2 p-2 bg-black bg-opacity-30 border-2 border-dashed border-gray-400 rounded-md text-white text-lg focus:outline-none focus:border-solid focus:border-white transition"
        />
      </div>

      {/* Блок с кнопками */}
      <div className="mt-6">
        <Button onClick={generateMeme} variant="primary" className="py-3 text-lg px-12">
          Сгенерировать в Дашборд
        </Button>
      </div>

      {/* Дашборд с генерациями */}
      {generatedMemes.length > 0 && (
        <div className="w-full mt-12 border-t-2 border-neutral-700 pt-8">
          <h2 className="text-3xl font-bold text-center mb-6">Ваши Генерации</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {generatedMemes.map((meme, index) => (
              <div key={index} className="flex flex-col gap-3 items-center p-4 bg-neutral-800 rounded-lg border border-neutral-700">
                <Image
                  src={meme}
                  alt={`Generated meme ${index + 1}`}
                  width={500}
                  height={500}
                  className="w-full h-auto rounded-md"
                />
                <Button onClick={() => handleSaveSingle(meme, index)} variant="ghost" className="w-full">
                  Сохранить Мем #{index + 1}
                </Button>
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
  );
}
