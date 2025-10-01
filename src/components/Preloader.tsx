"use client";

export default function Preloader({
  onBootComplete,
}: {
  onBootComplete: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black overflow-hidden"
      style={{ animation: "preloader-fade-out 2.5s ease-out forwards" }}
      onAnimationEnd={onBootComplete}
    >
      {/* Виньетка + сканлайны */}
      <div className="absolute inset-0 pointer-events-none tv-vignette" />
      <div className="absolute inset-0 pointer-events-none tv-scanlines" />

      {/* Анимация «включение ТВ» */}
      <div className="tv-boot w-full h-full" />

      <div className="absolute bottom-10 text-neutral-300 text-sm opacity-70">
        <span className="animate-pulse">booting CRT…</span>
      </div>
    </div>
  );
}
