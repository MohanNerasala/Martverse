'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import { ChevronDown, Mouse, ArrowRight } from 'lucide-react';
import { sounds } from '@/lib/sound';

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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Imperative UI DOM refs to avoid React re-renders during high-speed 60-120fps scrubbing
  const frameCounterRef = useRef<HTMLSpanElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const percentTextRef = useRef<HTMLSpanElement>(null);

  // In-memory decoded image / bitmap cache
  const imageCacheRef = useRef<(HTMLImageElement | ImageBitmap | null)[]>(new Array(TOTAL_FRAMES).fill(null));
  const loadStatusRef = useRef<Uint8Array>(new Uint8Array(TOTAL_FRAMES)); // 0 = idle, 1 = loading, 2 = loaded
  const loadedCountRef = useRef<number>(0);

  // Inertial physics state for 120 FPS buttery-smooth scrubbing
  const currentFloatRef = useRef<number>(0);
  const targetFrameRef = useRef<number>(0);
  const lastDrawnFrameRef = useRef<number>(-1);
  const isTransitioningRef = useRef<boolean>(false);
  const isComponentMounted = useRef<boolean>(true);
  const rafIdRef = useRef<number | null>(null);

  // --- Fast Aspect-Cover Canvas Drawing (Hardware Accelerated) ---
  const renderFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Direct lookup or nearest available neighbor within local 8-frame radius
    let drawable: HTMLImageElement | ImageBitmap | null = imageCacheRef.current[frameIndex];
    if (!drawable) {
      for (let d = 1; d <= 8; d++) {
        if (frameIndex - d >= 0 && imageCacheRef.current[frameIndex - d]) {
          drawable = imageCacheRef.current[frameIndex - d];
          break;
        }
        if (frameIndex + d < TOTAL_FRAMES && imageCacheRef.current[frameIndex + d]) {
          drawable = imageCacheRef.current[frameIndex + d];
          break;
        }
      }
    }

    if (!drawable) return;

    const cw = canvas.width;
    const ch = canvas.height;
    if (cw === 0 || ch === 0) return;

    const iw = (drawable as any).naturalWidth || (drawable as any).width || 1280;
    const ih = (drawable as any).naturalHeight || (drawable as any).height || 720;

    // Aspect-cover scaling: fills viewport with zero distortion
    const scale = Math.max(cw / iw, ch / ih);
    const nw = iw * scale;
    const nh = ih * scale;
    const cx = (cw - nw) * 0.5;
    const cy = (ch - nh) * 0.5;

    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(drawable, 0, 0, iw, ih, cx, cy, nw, nh);
  }, []);

  // --- Resize Handler ---
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(window.innerWidth * dpr);
    const h = Math.round(window.innerHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    renderFrame(Math.round(currentFloatRef.current));
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
        duration: 0.7,
        ease: 'power2.inOut',
        onComplete: () => {
          onComplete();
        },
      });
    } else {
      onComplete();
    }
  }, [onComplete]);

  // --- Update HUD Imperatively (Zero React Re-render Overhead) ---
  const updateHUD = useCallback((frameIndex: number) => {
    if (frameCounterRef.current) {
      frameCounterRef.current.textContent = `FRAME ${String(frameIndex + 1).padStart(3, '0')} OF ${TOTAL_FRAMES}`;
    }
    const progress = frameIndex / (TOTAL_FRAMES - 1);
    if (progressBarRef.current) {
      progressBarRef.current.style.width = `${Math.max(2, progress * 100)}%`;
    }
    if (percentTextRef.current) {
      percentTextRef.current.textContent = `${Math.round(progress * 100)}% EXPLORED`;
    }
  }, []);

  // --- Prioritized Sliding-Window Frame Preloader ---
  const loadSingleFrame = useCallback((i: number, priority: 'high' | 'auto' = 'auto') => {
    if (i < 0 || i >= TOTAL_FRAMES) return;
    if (loadStatusRef.current[i] !== 0) return; // Already requested or loaded

    loadStatusRef.current[i] = 1; // Mark loading

    const img = new Image();
    if ('fetchPriority' in img) {
      (img as any).fetchPriority = priority;
    }
    img.decoding = 'async';
    img.src = getFrameUrl(i);

    img.onload = () => {
      if (!isComponentMounted.current) return;

      // Decode into GPU ImageBitmap off the main thread if supported
      if (typeof createImageBitmap === 'function') {
        createImageBitmap(img)
          .then((bmp) => {
            if (!isComponentMounted.current) return;
            imageCacheRef.current[i] = bmp;
            loadStatusRef.current[i] = 2;
            loadedCountRef.current++;
            if (i === 0 || i === Math.round(currentFloatRef.current)) {
              renderFrame(i);
            }
          })
          .catch(() => {
            imageCacheRef.current[i] = img;
            loadStatusRef.current[i] = 2;
            loadedCountRef.current++;
            if (i === 0 || i === Math.round(currentFloatRef.current)) {
              renderFrame(i);
            }
          });
      } else {
        imageCacheRef.current[i] = img;
        loadStatusRef.current[i] = 2;
        loadedCountRef.current++;
        if (i === 0 || i === Math.round(currentFloatRef.current)) {
          renderFrame(i);
        }
      }
    };

    img.onerror = () => {
      loadStatusRef.current[i] = 0; // Allow retry
    };
  }, [renderFrame]);

  // Ensure lookahead frames right ahead of the playhead are ALWAYS loaded
  const ensureLookaheadLoaded = useCallback((centerFrame: number) => {
    const start = Math.max(0, centerFrame - 4);
    const end = Math.min(TOTAL_FRAMES - 1, centerFrame + 36);
    for (let i = start; i <= end; i++) {
      loadSingleFrame(i, 'high');
    }
  }, [loadSingleFrame]);

  // --- Physics Inertia Animation Loop (120 FPS Gliding, Zero Stutter) ---
  useEffect(() => {
    isComponentMounted.current = true;
    handleResize();

    // 1. Immediately load initial critical batch (frames 0 to 35) with high priority
    for (let i = 0; i <= 35; i++) {
      loadSingleFrame(i, 'high');
    }

    // 2. Progressively stream the remaining frames in the background
    let bgTimer: any = null;
    let nextBgFrame = 36;
    const streamBackground = () => {
      if (!isComponentMounted.current || nextBgFrame >= TOTAL_FRAMES) return;
      const batchEnd = Math.min(TOTAL_FRAMES - 1, nextBgFrame + 6);
      for (let i = nextBgFrame; i <= batchEnd; i++) {
        loadSingleFrame(i, 'auto');
      }
      nextBgFrame = batchEnd + 1;
      bgTimer = setTimeout(streamBackground, 40);
    };
    bgTimer = setTimeout(streamBackground, 200);

    // 3. Continuous Damped Inertia RAF Loop
    const physicsLoop = () => {
      if (!isComponentMounted.current) return;

      const target = targetFrameRef.current;
      const current = currentFloatRef.current;
      const diff = target - current;

      if (Math.abs(diff) > 0.005) {
        // Frictionless exponential glide: 0.16 smoothing factor
        currentFloatRef.current += diff * 0.16;
        const rounded = Math.round(currentFloatRef.current);

        if (rounded !== lastDrawnFrameRef.current) {
          lastDrawnFrameRef.current = rounded;
          renderFrame(rounded);
          updateHUD(rounded);

          if (rounded >= TOTAL_FRAMES - 1 && !isTransitioningRef.current) {
            triggerCompletion();
          }
        }
      }

      rafIdRef.current = requestAnimationFrame(physicsLoop);
    };

    rafIdRef.current = requestAnimationFrame(physicsLoop);

    window.addEventListener('resize', handleResize);

    return () => {
      isComponentMounted.current = false;
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      if (bgTimer) clearTimeout(bgTimer);
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize, loadSingleFrame, renderFrame, triggerCompletion, updateHUD]);

  // --- Smooth Wheel & Gesture Input Capture ---
  const advanceFrames = useCallback(
    (delta: number) => {
      if (isTransitioningRef.current) return;

      targetFrameRef.current = Math.max(
        0,
        Math.min(TOTAL_FRAMES - 1, targetFrameRef.current + delta)
      );

      // Immediately queue upcoming frames so the user never gets stuck
      ensureLookaheadLoaded(Math.round(targetFrameRef.current));
    },
    [ensureLookaheadLoaded]
  );

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (typeof (e as any).stopImmediatePropagation === 'function') {
        (e as any).stopImmediatePropagation();
      }
      // Natural scroll coefficient: ~4.2 frames per wheel click
      const delta = (e.deltaY / 100) * 4.2;
      advanceFrames(delta);
    };

    window.addEventListener('wheel', handleWheel, { passive: false });

    // Touch gesture support for trackpads & touchscreens
    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        touchStartY = e.touches[0].clientY;
      }
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        e.stopPropagation();
        const currentY = e.touches[0].clientY;
        const diff = touchStartY - currentY;
        touchStartY = currentY;
        advanceFrames(diff * 0.38);
      }
    };
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    // Keyboard navigation: Down/PageDown/Right advances, Up/PageUp/Left reverses, Esc skips
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        triggerCompletion();
      } else if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        e.stopPropagation();
        advanceFrames(8);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        e.stopPropagation();
        advanceFrames(-8);
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        e.stopPropagation();
        advanceFrames(16);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [advanceFrames, triggerCompletion]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-[#080B11] text-white overflow-hidden select-none"
    >
      {/* Pinned Cinematic Full-Screen Viewport */}
      <div
        ref={overlayRef}
        className="relative w-screen h-screen flex flex-col justify-between"
      >
        {/* Instant 0ms First-Frame Image (Guarantees immediate display on load) */}
        <img
          src="/frames/ezgif-frame-001.jpg"
          alt="Supermarket Entrance Cinematic Intro"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0"
        />

        {/* Main Full-Screen Hardware-Accelerated Canvas (Paints frame-by-frame on top) */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover z-10"
        />

        {/* Subtle Cinematic Vignette Shadow */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 pointer-events-none z-20" />

        {/* ============================================================== */}
        {/* TOP HEADER: Right Vivid Skip to Store Button                   */}
        {/* ============================================================== */}
        <header className="relative z-30 px-6 sm:px-10 py-6 flex items-center justify-end">
          <button
            type="button"
            onClick={triggerCompletion}
            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black tracking-wide flex items-center gap-2 transition-all duration-200 border border-white/30 shadow-xl shadow-blue-500/35 hover:scale-105 active:scale-95 cursor-pointer select-none group"
            title="Skip directly to 3D Supermarket"
          >
            <span>Skip to Store</span>
            <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
          </button>
        </header>

        {/* ============================================================== */}
        {/* CENTER DISPLAY: Two Floating Pure Lines (No Box) Light Blue Pass */}
        {/* ============================================================== */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center justify-center text-center pointer-events-none w-full max-w-7xl px-4">
          {/* Big Line 1: Grand Hero MARTVERSE with Light Blue to White Passing Shimmer */}
          <h1
            className="font-black tracking-tight uppercase select-none drop-shadow-[0_20px_50px_rgba(0,0,0,0.98)]"
            style={{ fontSize: 'clamp(5rem, 14vw, 12.5rem)', lineHeight: 0.9 }}
          >
            <span className="animate-light-blue-pass inline-block">
              MARTVERSE
            </span>
          </h1>

          {/* Line 2: Elegant Content Line with Light Blue to White Passing Wave */}
          <p
            className="mt-3 sm:mt-6 font-extrabold uppercase select-none drop-shadow-[0_10px_35px_rgba(0,0,0,0.98)]"
            style={{ fontSize: 'clamp(1rem, 2.5vw, 2.3rem)', letterSpacing: '0.15em' }}
          >
            <span className="animate-light-blue-subpass inline-block">
              Virtual 3D Supermarket • Scroll to Enter
            </span>
          </p>

          {/* Minimalist Floating Scroll Cue & Progress Line (Spaced, Zero Overlap) */}
          <div className="mt-8 flex flex-col items-center gap-2.5 opacity-95 drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)]">
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/35 backdrop-blur-md border border-white/10 text-xs sm:text-sm font-bold tracking-widest uppercase text-sky-200">
              <Mouse className="w-3.5 h-3.5 text-sky-300 animate-pulse" />
              <span>Scroll to Explore</span>
              <ChevronDown className="w-3.5 h-3.5 text-sky-300 animate-bounce" />
            </div>

            {/* Glowing Slender Progress Bar */}
            <div className="w-64 sm:w-80 h-1.5 rounded-full bg-white/20 overflow-hidden shadow-inner mt-1">
              <div
                ref={progressBarRef}
                className="h-full rounded-full bg-gradient-to-r from-sky-400 via-white to-sky-300 shadow-md shadow-sky-300/90 transition-all duration-75"
                style={{ width: '2%' }}
              />
            </div>

            {/* Frame Counter & Percentage (Clear Glass Pill, Never Collides) */}
            <div className="flex items-center justify-between w-64 sm:w-80 text-[11px] sm:text-xs font-mono font-bold text-sky-100/90 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/10 shadow-lg mt-0.5">
              <span ref={frameCounterRef} className="tracking-wider">FRAME 001 OF {TOTAL_FRAMES}</span>
              <span className="text-white/40 font-normal select-none">•</span>
              <span ref={percentTextRef} className="text-sky-300 font-black tracking-wider">0% EXPLORED</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
