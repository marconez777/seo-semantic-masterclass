import { useEffect, useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from "lucide-react";
import { webinarTracker } from "@/lib/webinarTracker";

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

const SPEEDS = [1, 1.5, 2] as const;

export const LockedVideoPlayer = ({ src, poster, className = "" }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const maxWatchedRef = useRef(0);
  const watchAccumRef = useRef(0); // segundos efetivamente assistidos
  const playStartRef = useRef<number | null>(null);
  const milestonesRef = useRef<Set<number>>(new Set());
  const maxSpeedRef = useRef(1);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showOverlay, setShowOverlay] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [speed, setSpeed] = useState<number>(1);

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
    const willUnmute = v.muted;
    v.muted = !v.muted;
    setIsMuted(v.muted);
    if (!v.muted && v.volume === 0) {
      v.volume = 1;
      setVolume(1);
    }
    if (willUnmute) {
      webinarTracker.patchMetrics({ unmuted: true });
      webinarTracker.track("video_unmute", { at: v.currentTime });
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
    webinarTracker.patchMetrics({ unmuted: true });
    webinarTracker.track("video_overlay_start", {});
  };

  const toggleFullscreen = () => {
    const el = containerRef.current as any;
    const v = videoRef.current as any;
    const doc = document as any;

    const fsElement =
      doc.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.webkitCurrentFullScreenElement ||
      (v && v.webkitDisplayingFullscreen);

    try {
      if (!fsElement) {
        webinarTracker.patchMetrics({ went_fullscreen: true });
        webinarTracker.track("video_fullscreen", { at: v?.currentTime ?? 0 });
        if (v && typeof v.webkitEnterFullscreen === "function") {
          if (v.muted) {
            v.muted = false;
            setIsMuted(false);
          }
          v.webkitEnterFullscreen();
          return;
        }
        if (el?.requestFullscreen) {
          el.requestFullscreen().catch(() => {});
        } else if (el?.webkitRequestFullscreen) {
          el.webkitRequestFullscreen();
        } else if (v?.requestFullscreen) {
          v.requestFullscreen().catch(() => {});
        }
      } else {
        if (doc.exitFullscreen) {
          doc.exitFullscreen().catch(() => {});
        } else if (doc.webkitExitFullscreen) {
          doc.webkitExitFullscreen();
        } else if (v && typeof v.webkitExitFullscreen === "function") {
          v.webkitExitFullscreen();
        }
      }
    } catch {
      /* ignore */
    }
  };

  const changeSpeed = (rate: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.playbackRate = rate;
    setSpeed(rate);
    if (rate > maxSpeedRef.current) maxSpeedRef.current = rate;
    webinarTracker.patchMetrics({ max_speed: rate });
    webinarTracker.track("video_speed_change", { speed: rate, at: v.currentTime });
  };

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
      if (v.currentTime > maxWatchedRef.current + 0.5) {
        v.currentTime = maxWatchedRef.current;
      }
    };

    const onLoaded = () => setDuration(v.duration || 0);
    const onPlay = () => {
      setIsPlaying(true);
      setShowOverlay(false);
    };
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);

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

  useEffect(() => {
    const onFsChange = () =>
      setIsFullscreen(
        !!(
          document.fullscreenElement ||
          (document as any).webkitFullscreenElement ||
          (document as any).webkitCurrentFullScreenElement
        )
      );
    document.addEventListener("fullscreenchange", onFsChange);
    document.addEventListener("webkitfullscreenchange", onFsChange);

    const v = videoRef.current as any;
    const onBeginIos = () => setIsFullscreen(true);
    const onEndIos = () => setIsFullscreen(false);
    v?.addEventListener?.("webkitbeginfullscreen", onBeginIos);
    v?.addEventListener?.("webkitendfullscreen", onEndIos);

    return () => {
      document.removeEventListener("fullscreenchange", onFsChange);
      document.removeEventListener("webkitfullscreenchange", onFsChange);
      v?.removeEventListener?.("webkitbeginfullscreen", onBeginIos);
      v?.removeEventListener?.("webkitendfullscreen", onEndIos);
    };
  }, []);

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
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

      {/* Overlay inicial — só aparece antes de começar */}
      {showOverlay && !isPlaying && (
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
        <div
          className="relative h-1.5 w-full rounded-full bg-white/25 mb-3 overflow-hidden select-none"
          aria-hidden="true"
        >
          <div
            className="absolute left-0 top-0 h-full bg-webinar-accent transition-[width] duration-150"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <div className="flex items-center gap-2 sm:gap-3 text-white">
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
              className="w-16 sm:w-20 accent-webinar-accent cursor-pointer"
              aria-label="Volume"
            />
          </div>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <div className="hidden xs:flex items-center gap-1 mr-1 text-xs sm:text-sm tabular-nums text-white/80">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>

            {/* Velocidade */}
            <div className="flex items-center rounded-full bg-white/10 p-0.5">
              {SPEEDS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => changeSpeed(s)}
                  className={`px-2 py-0.5 text-[11px] sm:text-xs font-semibold rounded-full transition ${
                    speed === s
                      ? "bg-webinar-accent text-black"
                      : "text-white/80 hover:text-white"
                  }`}
                  aria-label={`Velocidade ${s}x`}
                >
                  {s}x
                </button>
              ))}
            </div>

            {/* Tela cheia */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="flex items-center justify-center rounded-full p-2 hover:bg-white/15 transition"
              aria-label={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
            >
              {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
