import { useEffect, useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

interface Props {
  src: string;
  poster?: string;
  className?: string;
}

const formatTime = (s: number) => {
  if (!isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

/**
 * Player de vídeo customizado que:
 * - Permite Play / Pause e controle de volume
 * - Mostra barra de progresso visual NÃO interativa
 * - Bloqueia avanço (seek) além do ponto já assistido
 * - Desativa menu de contexto, download e PiP
 */
export const LockedVideoPlayer = ({ src, poster, className = "" }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const maxWatchedRef = useRef(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showOverlay, setShowOverlay] = useState(true);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setIsMuted(v.muted);
    if (!v.muted && v.volume === 0) {
      v.volume = 1;
      setVolume(1);
    }
  };

  const onVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v) return;
    const newVol = Number(e.target.value);
    v.volume = newVol;
    v.muted = newVol === 0;
    setVolume(newVol);
    setIsMuted(v.muted);
  };

  const handleStart = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = false;
    setIsMuted(false);
    v.play().catch(() => {});
    setShowOverlay(false);
  };

  // Bloqueia tentativas de seek (clique na timeline nativa, atalhos, etc.)
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onTimeUpdate = () => {
      setCurrentTime(v.currentTime);
      if (v.currentTime > maxWatchedRef.current) {
        maxWatchedRef.current = v.currentTime;
      }
    };

    const onSeeking = () => {
      // Se tentou pular para frente, força voltar ao máximo já assistido
      if (v.currentTime > maxWatchedRef.current + 0.5) {
        v.currentTime = maxWatchedRef.current;
      }
    };

    const onLoaded = () => setDuration(v.duration || 0);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);

    // Bloqueia atalhos de teclado de seek quando o vídeo está focado
    const onKeyDown = (e: KeyboardEvent) => {
      const blocked = ["ArrowRight", "ArrowLeft", "j", "J", "l", "L"];
      if (blocked.includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    v.addEventListener("timeupdate", onTimeUpdate);
    v.addEventListener("seeking", onSeeking);
    v.addEventListener("loadedmetadata", onLoaded);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("ended", onEnded);
    v.addEventListener("keydown", onKeyDown);

    return () => {
      v.removeEventListener("timeupdate", onTimeUpdate);
      v.removeEventListener("seeking", onSeeking);
      v.removeEventListener("loadedmetadata", onLoaded);
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("ended", onEnded);
      v.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className={`relative w-full aspect-video bg-black rounded-md overflow-hidden shadow-2xl group ${className}`}
      onContextMenu={(e) => e.preventDefault()}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        playsInline
        preload="metadata"
        controlsList="nodownload noremoteplayback noplaybackrate"
        disablePictureInPicture
        className="w-full h-full object-contain bg-black"
        onClick={togglePlay}
      />

      {/* Overlay inicial — convida a iniciar com som */}
      {showOverlay && (
        <button
          type="button"
          onClick={handleStart}
          className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/40 text-white transition hover:bg-black/50"
          aria-label="Iniciar vídeo"
        >
          <span className="flex size-20 items-center justify-center rounded-full bg-white/90 text-black shadow-xl">
            <Play size={36} className="ml-1" fill="currentColor" />
          </span>
          <span className="text-[16px] font-medium tracking-wide uppercase">
            Clique para assistir com som
          </span>
        </button>
      )}

      {/* Barra de controles */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/85 via-black/55 to-transparent px-4 pt-8 pb-3 opacity-100 transition-opacity">
        {/* Barra de progresso (apenas visual, não clicável) */}
        <div
          className="relative h-1.5 w-full rounded-full bg-white/25 mb-3 overflow-hidden select-none"
          aria-hidden="true"
        >
          <div
            className="absolute left-0 top-0 h-full bg-webinar-accent transition-[width] duration-150"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <div className="flex items-center gap-3 text-white">
          <button
            type="button"
            onClick={togglePlay}
            className="flex items-center justify-center rounded-full p-2 hover:bg-white/15 transition"
            aria-label={isPlaying ? "Pausar" : "Reproduzir"}
          >
            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleMute}
              className="flex items-center justify-center rounded-full p-2 hover:bg-white/15 transition"
              aria-label={isMuted ? "Ativar som" : "Silenciar"}
            >
              {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={onVolumeChange}
              className="w-20 accent-webinar-accent cursor-pointer"
              aria-label="Volume"
            />
          </div>

          <div className="ml-auto text-xs sm:text-sm tabular-nums text-white/80">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>
      </div>
    </div>
  );
};
