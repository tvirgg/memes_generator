import os
from pathlib import Path

# --- Содержимое файлов ---
# ВНИМАНИЕ: Теперь здесь используются одинарные фигурные скобки {},
# как и должно быть в JSON и TypeScript/React.

file_contents = {
    "public/drake-meme.png": "", # Оставляем пустым, т.к. скрипт не может создать изображение
    "src/app/globals.css": """@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color-scheme: dark;
}

body {
  @apply bg-gray-900 text-white;
}
""",
    "src/app/layout.tsx": """import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Meme Generator",
  description: "Создайте свой собственный мем!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
""",
    "src/app/page.tsx": """import MemeGenerator from "../components/MemeGenerator";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <main className="flex-grow flex items-center justify-center p-4">
        <MemeGenerator />
      </main>
    </div>
  );
}
""",
    "src/components/ui/Card.tsx": """import React from 'react';
import clsx from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card = ({ className, children, ...props }: CardProps) => {
  return (
    <div className={clsx('bg-neutral-800 border border-neutral-700 rounded-xl shadow-soft p-6', className)} {...props}>
      {children}
    </div>
  );
};
""",
    "src/components/ui/Button.tsx": """import React from 'react';
import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost';
  children: React.ReactNode;
}

export const Button = ({ className, variant = 'primary', children, ...props }: ButtonProps) => {
  const baseStyles = 'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200';
  const primaryStyles = 'bg-gradient-to-r from-purple-700 via-purple-800 to-purple-900 text-white hover:scale-105 hover:brightness-110 active:scale-100';
  const ghostStyles = 'bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700';

  return (
    <button
      className={clsx(
        baseStyles,
        {
          [primaryStyles]: variant === 'primary',
          [ghostStyles]: variant === 'ghost',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
""",
    "src/components/MemeGenerator.tsx": """"use client";

import { useState, useRef, useEffect } from "react";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import Image from "next/image";

export default function MemeGenerator() {
  const [topText, setTopText] = useState("");
  const [bottomText, setBottomText] = useState("");
  const [generatedMeme, setGeneratedMeme] = useState<string | null>(null);
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
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        ctx.drawImage(image, 0, 0);

        // Стилизация текста
        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 4; // Увеличим обводку для лучшей читаемости
        ctx.font = "bold 48px Impact";
        ctx.textAlign = "center";
        
        // Верхний текст
        ctx.textBaseline = "top";
        ctx.fillText(topText.toUpperCase(), canvas.width / 2, 20);
        ctx.strokeText(topText.toUpperCase(), canvas.width / 2, 20);

        // Нижний текст
        ctx.textBaseline = "bottom";
        ctx.fillText(bottomText.toUpperCase(), canvas.width / 2, canvas.height - 20);
        ctx.strokeText(bottomText.toUpperCase(), canvas.width / 2, canvas.height - 20);

        setGeneratedMeme(canvas.toDataURL("image/png"));
      }
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-4xl md:text-5xl font-black mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
        Генератор Мемов
      </h1>
      <Card className="w-full max-w-lg">
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Верхний текст"
            value={topText}
            onChange={(e) => setTopText(e.target.value)}
            className="w-full p-3 rounded bg-neutral-700 border border-neutral-600 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
          />
          <input
            type="text"
            placeholder="Нижний текст"
            value={bottomText}
            onChange={(e) => setBottomText(e.target.value)}
            className="w-full p-3 rounded bg-neutral-700 border border-neutral-600 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
          />
          <Button onClick={generateMeme} variant="primary" className="py-3 text-lg">
            Сгенерировать
          </Button>
        </div>
      </Card>
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4 text-center">Ваш результат:</h2>
        <div className="relative w-full max-w-lg min-h-[300px] bg-neutral-800 rounded-lg flex items-center justify-center overflow-hidden border border-neutral-700">
          {/* Скрытые элементы для рендеринга */}
          <img ref={imageRef} alt="Meme template" className="hidden" />
          <canvas ref={canvasRef} className="hidden" />

          {generatedMeme ? (
            <Image
              src={generatedMeme}
              alt="Generated meme"
              width={500}
              height={500}
              className="rounded-lg object-contain"
            />
          ) : (
            <p className="text-neutral-500">Здесь появится ваш мем</p>
          )}
        </div>
      </div>
    </div>
  );
}
""",
    "package.json": """{
  "name": "meme-generator",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "clsx": "^2.1.1",
    "framer-motion": "^11.2.10",
    "lucide-react": "^0.395.0",
    "next": "14.2.4",
    "react": "^18",
    "react-dom": "^18"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "eslint": "^8",
    "eslint-config-next": "14.2.4",
    "postcss": "^8",
    "tailwindcss": "^3.4.1",
    "typescript": "^5"
  }
}
""",
    "tailwind.config.ts": """import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
export default config;
""",
    "postcss.config.js": """module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
""",
    # ИСПРАВЛЕНО: next.config.ts -> next.config.mjs
    "next.config.mjs": """/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
};

export default nextConfig;
""",
    "tsconfig.json": """{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
""",
    "next-env.d.ts": """/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/basic-features/typescript for more information.
""",
}

def create_project_structure(root_dir):
    """Создает структуру папок и файлов для проекта."""
    root_path = Path(root_dir)
    print(f"Создание проекта в папке: ./{root_path}")

    # Создаем корневую папку, если ее нет
    root_path.mkdir(exist_ok=True)

    for file_path_str, content in file_contents.items():
        # Создаем полный путь к файлу
        file_path = root_path / file_path_str

        # Создаем все родительские директории для файла
        file_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Если это файл изображения, просто создаем пустой файл как плейсхолдер
        if file_path.name == "drake-meme.png":
            file_path.touch()
            print(f"  Создан плейсхолдер для изображения: {file_path_str}")
            continue

        # Записываем содержимое в файл
        try:
            file_path.write_text(content, encoding='utf-8')
            print(f"  Создан файл: {file_path_str}")
        except IOError as e:
            print(f"Ошибка при записи файла {file_path_str}: {e}")

    print("\nСтруктура проекта успешно создана!")
    print("-" * 40)
    print("Дальнейшие шаги:")
    print(f"1. Перейдите в папку проекта: cd {root_dir}")
    print(f"2. ❗️ ВАЖНО: Поместите ваше изображение мема в 'public/drake-meme.png'")
    print(f"3. Установите зависимости: npm install (или yarn)")
    print(f"4. Запустите сервер для разработки: npm run dev (или yarn dev)")
    print("   Откройте http://localhost:3000 в вашем браузере.")
    print("-" * 40)


if __name__ == "__main__":
    PROJECT_NAME = "meme-generator"
    create_project_structure(PROJECT_NAME)