'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { Store, ChevronDown, Mouse, ArrowRight } from 'lucide-react';
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

  // Imperative UI DOM refs to avoid React re-renders during high-speed 60fps scrubbing
  const frameCounterRef = useRef<HTMLSpanElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const percentTextRef = useRef<HTMLSpanElement>(null);
  const loadedCountRef = useRef<HTMLSpanElement>(null);

  // In-memory decoded image cache to prevent frame flickering or GC pauses
  const imageCacheRef = useRef<(HTMLImageElement | null)[]>(new Array(TOTAL_FRAMES).fill(null));
  const currentFrameRef = useRef<number>(0);
  const targetFrameRef = useRef<number>(0);
  const frameObjRef = useRef<{ frame: number }>({ frame: 0 });
  const isTransitioningRef = useRef<boolean>(false);
  const isComponentMounted = useRef<boolean>(true);

  // --- High-Performance Aspect-Ratio Canvas Drawing ---
  const renderFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Retrieve target frame or find nearest available loaded frame (guarantees zero blank frames)
    let img = imageCacheRef.current[frameIndex];
    if (!img || !img.complete || img.naturalWidth === 0) {
      for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
        if (frameIndex - offset >= 0) {
          const prev = imageCacheRef.current[frameIndex - offset];
          if (prev && prev.complete && prev.naturalWidth > 0) {
            img = prev;
            break;
          }
        }
        if (frameIndex + offset < TOTAL_FRAMES) {
          const next = imageCacheRef.current[frameIndex + offset];
          if (next && next.complete && next.naturalWidth > 0) {
            img = next;
            break;
          }
        }
      }
    }

    if (!img || !img.complete || img.naturalWidth === 0) return;

    const cw = canvas.width;
    const ch = canvas.height;
    if (cw === 0 || ch === 0) return;

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
        duration: 0.8,
        ease: 'power2.inOut',
        onComplete: () => {
          onComplete();
        },
      });
    } else {
      onComplete();
    }
  }, [onComplete]);

  // --- Update Frame & Imperative UI ---
  const applyFrame = useCallback(
    (frameIndex: number) => {
      const clamped = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.round(frameIndex)));
      currentFrameRef.current = clamped;
      renderFrame(clamped);

      // Update HUD imperatively (Zero React re-render overhead!)
      if (frameCounterRef.current) {
        frameCounterRef.current.textContent = `FRAME ${String(clamped + 1).padStart(3, '0')} / ${TOTAL_FRAMES}`;
      }
      const progress = clamped / (TOTAL_FRAMES - 1);
      if (progressBarRef.current) {
        progressBarRef.current.style.width = `${Math.max(2, progress * 100)}%`;
      }
      if (percentTextRef.current) {
        percentTextRef.current.textContent = `${Math.round(progress * 100)}%`;
      }

      // When final frame is reached, trigger completion transition
      if (clamped >= TOTAL_FRAMES - 1 && !isTransitioningRef.current) {
        setTimeout(() => {
          triggerCompletion();
        }, 120);
      }
    },
    [renderFrame, triggerCompletion]
  );

  // --- Smooth Inertial Scrub Controller via GSAP ---
  const advanceFrames = useCallback(
    (delta: number) => {
      if (isTransitioningRef.current) return;

      targetFrameRef.current = Math.max(
        0,
        Math.min(TOTAL_FRAMES - 1, targetFrameRef.current + delta)
      );

      gsap.to(frameObjRef.current, {
        frame: targetFrameRef.current,
        duration: 0.35,
        ease: 'power2.out',
        overwrite: 'auto',
        onUpdate: () => {
          applyFrame(frameObjRef.current.frame);
        },
      });
    },
    [applyFrame]
  );

  // --- Preloader & Parallel Image Streaming ---
  useEffect(() => {
    isComponentMounted.current = true;
    handleResize();

    let count = 0;

    // Preload all 280 frames concurrently
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = getFrameUrl(i);
      img.decoding = 'async';
      img.onload = () => {
        if (!isComponentMounted.current) return;
        imageCacheRef.current[i] = img;
        count++;
        if (loadedCountRef.current) {
          loadedCountRef.current.textContent = `Loaded ${count} / ${TOTAL_FRAMES} frames`;
        }
        if (i === 0) {
          renderFrame(0);
        }
        if (i === currentFrameRef.current) {
          renderFrame(i);
        }
      };
    }

    window.addEventListener('resize', handleResize);
    return () => {
      isComponentMounted.current = false;
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize, renderFrame]);

  // --- Global Mouse Wheel & Gesture Input Capture ---
  useEffect(() => {
    // Wheel listener: active on entire screen
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (typeof (e as any).stopImmediatePropagation === 'function') {
        (e as any).stopImmediatePropagation();
      }
      // Sensitivity factor: ~4.5 frames per notch
      const delta = (e.deltaY / 100) * 4.5;
      advanceFrames(delta);
    };

    window.addEventListener('wheel', handleWheel, { passive: false });

    // Touch gesture support for trackpads & mobile
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
        advanceFrames(diff * 0.4);
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
        advanceFrames(14);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      gsap.killTweensOf(frameObjRef.current);
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
        {/* TOP HEADER BAR: Center Luxury Branding + Right Vivid Skip Btn */}
        {/* ============================================================== */}
        <header className="relative z-30 px-6 sm:px-10 py-6 flex items-center justify-between">
          {/* Left: Spacer (Clean, uncluttered) */}
          <div className="w-24 sm:w-36 hidden sm:block" />

          {/* Middle: Minimalist Floating Luxury Glass Badge */}
          <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-black/65 backdrop-blur-2xl border border-white/20 shadow-2xl text-white">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-blue-500/30">
              <Store className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-black tracking-widest uppercase">
              MART<span className="text-blue-400">VERSE</span>
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
            <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider hidden xs:inline">
              CINEMATIC ENTRANCE
            </span>
          </div>

          {/* Right: High-Visibility Premium Skip to Store Button */}
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
        {/* BOTTOM INTERACTIVE HUD: High-Contrast Floating Glass Island   */}
        {/* ============================================================== */}
        <footer className="relative z-30 px-4 sm:px-10 py-6 flex flex-col items-center">
          <div className="w-full max-w-lg px-6 py-4 rounded-3xl bg-black/75 backdrop-blur-2xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.6)] space-y-2.5">
            {/* Animated Mouse Wheel Scroll Prompt */}
            <div className="flex items-center justify-center gap-2 text-xs font-black tracking-wider uppercase text-white drop-shadow">
              <Mouse className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>Scroll Mouse Wheel to Enter</span>
              <ChevronDown className="w-4 h-4 text-cyan-400 animate-bounce" />
            </div>

            {/* Sequence Progress Info */}
            <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-200">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                CAMERA MOTION
              </span>
              <span ref={frameCounterRef} className="text-cyan-400 font-black tracking-wide">
                FRAME 001 / {TOTAL_FRAMES}
              </span>
              <span ref={percentTextRef} className="text-white font-mono">0%</span>
            </div>

            {/* Progress Track */}
            <div className="w-full h-2 rounded-full bg-white/15 overflow-hidden p-0.5 border border-white/15 shadow-inner">
              <div
                ref={progressBarRef}
                className="h-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-500 shadow-md shadow-cyan-400/60 transition-all duration-75"
                style={{ width: '2%' }}
              />
            </div>

            {/* Footer Subtext */}
            <div className="flex items-center justify-between text-[10px] text-slate-300 font-semibold pt-0.5">
              <span>Scroll Down = Enter · Scroll Up = Reverse</span>
              <span ref={loadedCountRef} className="text-slate-400">Loading frames...</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
