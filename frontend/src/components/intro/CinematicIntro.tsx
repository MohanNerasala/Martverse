'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Store, ChevronDown, Mouse, ArrowRight, Volume2, Sparkles } from 'lucide-react';
import { sounds } from '@/lib/sound';

gsap.registerPlugin(ScrollTrigger);

interface CinematicIntroProps {
  onComplete: () => void;
}

const TOTAL_FRAMES = 280;

// Format frame index to 3-digit padded filename: ezgif-frame-001.jpg -> ezgif-frame-280.jpg
const getFrameUrl = (index: number): string => {
  const paddedIndex = String(index + 1).padStart(3, '0');
  return `/frames/ezgif-frame-${paddedIndex}.jpg`;
};

export const CinematicIntro: React.FC<CinematicIntroProps> = ({ onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollWrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // In-memory decoded image cache to prevent frame flickering or GC pauses
  const imageCacheRef = useRef<(HTMLImageElement | null)[]>(new Array(TOTAL_FRAMES).fill(null));
  const currentFrameRef = useRef<number>(0);
  const lastRenderedIndexRef = useRef<number>(-1);
  const isTransitioningRef = useRef<boolean>(false);
  const isComponentMounted = useRef<boolean>(true);

  // UI state
  const [loadedCount, setLoadedCount] = useState<number>(0);
  const [isFirstFrameReady, setIsFirstFrameReady] = useState<boolean>(false);
  const [scrollProgress, setScrollProgress] = useState<number>(0);

  // --- High-Performance Aspect-Ratio Canvas Drawing ---
  const renderFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Retrieve target frame or find nearest available loaded frame (guarantees zero blank frames)
    let img = imageCacheRef.current[frameIndex];
    if (!img || !img.complete) {
      for (let offset = 1; offset < 35; offset++) {
        if (frameIndex - offset >= 0 && imageCacheRef.current[frameIndex - offset]?.complete) {
          img = imageCacheRef.current[frameIndex - offset];
          break;
        }
        if (frameIndex + offset < TOTAL_FRAMES && imageCacheRef.current[frameIndex + offset]?.complete) {
          img = imageCacheRef.current[frameIndex + offset];
          break;
        }
      }
    }

    if (!img || !img.complete) return;

    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth || 1280;
    const ih = img.naturalHeight || 720;

    // Aspect-cover scaling: perfectly fills viewport with zero distortion
    const scale = Math.max(cw / iw, ch / ih);
    const nw = iw * scale;
    const nh = ih * scale;
    const cx = (cw - nw) * 0.5;
    const cy = (ch - nh) * 0.5;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, iw, ih, cx, cy, nw, nh);
    lastRenderedIndexRef.current = frameIndex;
  }, []);

  // --- Resize Handler ---
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    renderFrame(currentFrameRef.current);
  }, [renderFrame]);

  // --- Cinematic Transition to Interactive 3D Supermarket ---
  const triggerCompletion = useCallback(() => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;

    try {
      sounds.playGateOpen();
    } catch {}

    if (overlayRef.current) {
      gsap.to(overlayRef.current, {
        opacity: 0,
        scale: 1.05,
        duration: 0.9,
        ease: 'power2.inOut',
        onComplete: () => {
          sessionStorage.setItem('martverse_entered', 'true');
          ScrollTrigger.getAll().forEach((t) => t.kill());
          onComplete();
        },
      });
    } else {
      sessionStorage.setItem('martverse_entered', 'true');
      onComplete();
    }
  }, [onComplete]);

  // --- Progressive Staged Preloader ---
  useEffect(() => {
    isComponentMounted.current = true;
    let loaded = 0;

    // Size canvas immediately on mount
    handleResize();

    const loadSingleFrame = (index: number): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        if (imageCacheRef.current[index]?.complete) {
          resolve(imageCacheRef.current[index]!);
          return;
        }
        const img = new Image();
        img.src = getFrameUrl(index);
        img.decoding = 'async';
        img.onload = () => {
          if (!isComponentMounted.current) return;
          imageCacheRef.current[index] = img;
          loaded++;
          setLoadedCount(loaded);
          resolve(img);
        };
        img.onerror = reject;
      });
    };

    // Stage 1: Load Frame 1 immediately (0ms First Paint)
    loadSingleFrame(0).then((firstImg) => {
      if (!isComponentMounted.current) return;
      setIsFirstFrameReady(true);
      handleResize();
      renderFrame(0);
    });

    // Stage 2: Priority buffer (first 25 frames)
    const priorityPromises = [];
    for (let i = 1; i < Math.min(25, TOTAL_FRAMES); i++) {
      priorityPromises.push(loadSingleFrame(i));
    }

    // Stage 3: Progressive streaming of remaining frames in concurrent pools
    Promise.all(priorityPromises).then(() => {
      if (!isComponentMounted.current) return;

      let nextIndex = 25;
      const concurrency = 6;

      const worker = () => {
        if (nextIndex >= TOTAL_FRAMES || !isComponentMounted.current) return;
        const currentIndex = nextIndex++;
        loadSingleFrame(currentIndex).finally(() => {
          worker();
        });
      };

      for (let c = 0; c < concurrency; c++) {
        worker();
      }
    });

    window.addEventListener('resize', handleResize);
    return () => {
      isComponentMounted.current = false;
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize, renderFrame]);

  // --- GSAP ScrollTrigger Frame Engine ---
  useEffect(() => {
    const scrollWrapper = scrollWrapperRef.current;
    const container = containerRef.current;
    if (!scrollWrapper || !container) return;

    // Connect GSAP ScrollTrigger directly to the dedicated intro scroll viewport
    const st = ScrollTrigger.create({
      trigger: scrollWrapper,
      scroller: container,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.35, // Balanced, buttery-smooth cinematic inertia
      onUpdate: (self) => {
        const rawProgress = self.progress;
        setScrollProgress(rawProgress);

        const targetFrame = Math.min(
          TOTAL_FRAMES - 1,
          Math.max(0, Math.round(rawProgress * (TOTAL_FRAMES - 1)))
        );

        if (targetFrame !== currentFrameRef.current) {
          currentFrameRef.current = targetFrame;
          renderFrame(targetFrame);
        }

        // When user reaches the final frames of the sequence (progress >= 0.99)
        if (rawProgress >= 0.995 && !isTransitioningRef.current) {
          currentFrameRef.current = TOTAL_FRAMES - 1;
          renderFrame(TOTAL_FRAMES - 1);
          setTimeout(() => {
            triggerCompletion();
          }, 120);
        }
      },
    });

    // Ensure ScrollTrigger accurately calculates scroller track dimensions
    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);

    // Keyboard navigation: Down/Right/Space/PageDown advances, Up/Left/PageUp reverses, Esc skips
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        triggerCompletion();
      } else if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === 'ArrowRight') {
        container.scrollBy({ top: 350, behavior: 'smooth' });
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp' || e.key === 'ArrowLeft') {
        container.scrollBy({ top: -350, behavior: 'smooth' });
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        container.scrollBy({ top: 400, behavior: 'smooth' });
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(refreshTimer);
      st.kill();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [renderFrame, triggerCompletion]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-[#080B11] text-white overflow-y-auto overflow-x-hidden select-none scroll-smooth"
      style={{ scrollbarWidth: 'none' }}
    >
      {/* Scrollable Track that controls the GSAP ScrollTrigger timeline */}
      <div
        ref={scrollWrapperRef}
        className="w-full h-[540vh] relative pointer-events-auto"
      >
        {/* Pinned Cinematic Full-Screen Viewport */}
        <div
          ref={overlayRef}
          className="fixed inset-0 w-screen h-screen flex flex-col justify-between pointer-events-none"
        >
          {/* Main Full-Screen Hardware-Accelerated Canvas */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Cinematic Letterbox Vignette Shadows */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/75 pointer-events-none" />
          <div className="absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.85)] pointer-events-none" />

          {/* --- TOP HEADER BAR --- */}
          <header className="relative z-20 px-6 sm:px-10 py-6 flex items-center justify-between">
            {/* Brand Logo & Tag */}
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 border border-white/20">
                <Store className="w-5 h-5 text-white stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-black tracking-wider uppercase font-sans">
                    MART<span className="text-blue-500">VERSE</span>
                  </h1>
                  <span className="text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full font-mono font-bold">
                    3D CINEMATIC INTRO
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">
                  Next-Gen Virtual Hypermarket Experience
                </p>
              </div>
            </div>

            {/* Skip Intro Button */}
            <button
              type="button"
              onClick={triggerCompletion}
              className="pointer-events-auto px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-xs font-bold flex items-center gap-2 transition-all duration-200 border border-white/15 hover:border-white/30 shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>Skip to Store</span>
              <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
            </button>
          </header>

          {/* --- BOTTOM INTERACTIVE HUD BAR --- */}
          <footer className="relative z-20 px-6 sm:px-10 py-7 flex flex-col items-center gap-4">
            {/* Animated Mouse Wheel Scroll Prompt */}
            {scrollProgress < 0.9 && (
              <div className="flex flex-col items-center gap-2 animate-bounce opacity-90 transition-opacity">
                <div className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-white/90 drop-shadow">
                  <Mouse className="w-4 h-4 text-blue-400 animate-pulse" />
                  <span>Scroll Down to Enter Supermarket</span>
                </div>
                <ChevronDown className="w-4 h-4 text-blue-400" />
              </div>
            )}

            {/* High-Tech Cinematic Scrub Progress Bar */}
            <div className="w-full max-w-xl space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 font-bold">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
                  CAMERA SEQUENCE
                </span>
                <span className="text-blue-400">
                  FRAME {String(currentFrameRef.current + 1).padStart(3, '0')} / {TOTAL_FRAMES}
                </span>
                <span>{Math.round(scrollProgress * 100)}%</span>
              </div>

              {/* Progress Track */}
              <div className="w-full h-1.5 rounded-full bg-white/10 backdrop-blur-sm overflow-hidden p-0.5 border border-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-600 via-cyan-400 to-indigo-500 shadow-md shadow-cyan-400/50 transition-all duration-75"
                  style={{ width: `${Math.max(2, scrollProgress * 100)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                <span>Roll Mouse Wheel Down / Swipe Up</span>
                <span>Loaded {loadedCount} / {TOTAL_FRAMES} frames</span>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};
