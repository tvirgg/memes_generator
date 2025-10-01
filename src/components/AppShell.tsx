"use client";

import { useState, useEffect, useRef } from "react";
import Preloader from "./Preloader";
import MemeGenerator from "./MemeGenerator";
import { Header } from "./Header";
import { ToastProvider } from "../contexts/ToastContext";

export default function AppShell() {
  const [bootDone, setBootDone] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  // 1. Начинаем со звуком, но готовы к тому, что браузер его заблокирует.
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // 2. Как только прелоадер закончил, пытаемся запустить музыку
    if (bootDone) {
      audio.volume = 0.5;
      audio.muted = isMuted;

      // Пытаемся включить. Если не получится (из-за правил браузера),
      // то ждем первого клика от пользователя.
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Если автозапуск со звуком не удался, включаем его по первому клику
          const enableSoundOnClick = () => {
            setIsMuted(false);
            audio.play();
            window.removeEventListener('click', enableSoundOnClick);
            window.removeEventListener('keydown', enableSoundOnClick);
          };
          window.addEventListener('click', enableSoundOnClick);
          window.addEventListener('keydown', enableSoundOnClick);
        });
      }
    }
  }, [bootDone, isMuted]);

  return (
    <ToastProvider>
      <div className="flex flex-col min-h-screen text-white relative">
        <audio ref={audioRef} src="/bst.mp3" loop />
        {!bootDone && <Preloader onBootComplete={() => setBootDone(true)} />}
        <Header isMuted={isMuted} onToggleMute={() => setIsMuted(!isMuted)} />
        <main className="flex-grow flex items-center justify-center p-4 pt-20">
          <MemeGenerator />
        </main>
      </div>
    </ToastProvider>
  );
}
