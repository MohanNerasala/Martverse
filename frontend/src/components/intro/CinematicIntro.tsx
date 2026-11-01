'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Store, ChevronDown, Mouse, ArrowRight } from 'lucide-react';
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

  // Imperative UI DOM refs to avoid React re-renders during high-speed 60fps scrubbing
  const frameCounterRef = useRef<HTMLSpanElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const percentTextRef = useRef<HTMLSpanElement>(null);
  const loadedCountRef = useRef<HTMLSpanElement>(null);

  // In-memory decoded image cache to prevent frame flickering or GC pauses
  const imageCacheRef = useRef<(HTMLImageElement | null)[]>(new Array(TOTAL_FRAMES).fill(null));
  const currentFrameRef = useRef<number>(0);
  const isTransitioningRef = useRef<boolean>(false);
  const isComponentMounted = useRef<boolean>(true);
  const rafIdRef = useRef<number | null>(null);

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

  // 60fps RequestAnimationFrame Throttled Renderer
  const scheduleRender = useCallback((frameIndex: number) => {
    currentFrameRef.current = frameIndex;
    if (rafIdRef.current !== null) return;
    rafIdRef.current = requestAnimationFrame(() => {
      renderFrame(currentFrameRef.current);
      rafIdRef.current = null;
    });
  }, [renderFrame]);

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
          ScrollTrigger.getAll().forEach((t) => t.kill());
          onComplete();
        },
      });
    } else {
      onComplete();
    }
  }, [onComplete]);

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

  // --- GSAP ScrollTrigger Frame Engine ---
  useEffect(() => {
    const scrollWrapper = scrollWrapperRef.current;
    const container = containerRef.current;
    if (!scrollWrapper || !container) return;

    // Canonical GSAP frame interpolation tween
    const frameObj = { frame: 0 };

    const tween = gsap.to(frameObj, {
      frame: TOTAL_FRAMES - 1,
      ease: 'none',
      scrollTrigger: {
        trigger: scrollWrapper,
        scroller: container,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.4, // Responsive and buttery smooth scroll synchronization
        onUpdate: (self) => {
          const rawProgress = self.progress;
          const currentFrame = Math.min(
            TOTAL_FRAMES - 1,
            Math.max(0, Math.round(frameObj.frame))
          );

          // Update Canvas
          scheduleRender(currentFrame);

          // Update UI text and progress bar imperatively (Zero React re-render overhead!)
          if (frameCounterRef.current) {
            frameCounterRef.current.textContent = `FRAME ${String(currentFrame + 1).padStart(3, '0')} / ${TOTAL_FRAMES}`;
          }
          if (progressBarRef.current) {
            progressBarRef.current.style.width = `${Math.max(2, rawProgress * 100)}%`;
          }
          if (percentTextRef.current) {
            percentTextRef.current.textContent = `${Math.round(rawProgress * 100)}%`;
          }

          // When reaching the last frame: finish complete animation and transition smoothly
          if (rawProgress >= 0.99 && !isTransitioningRef.current) {
            currentFrameRef.current = TOTAL_FRAMES - 1;
            renderFrame(TOTAL_FRAMES - 1);
            setTimeout(() => {
              triggerCompletion();
            }, 120);
          }
        },
      },
    });

    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);

    // Mouse Wheel listener: forwards all wheel events directly to the scroll track
    const handleWheel = (e: WheelEvent) => {
      container.scrollTop += e.deltaY;
    };
    window.addEventListener('wheel', handleWheel, { passive: true });

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
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
      tween.kill();
      ScrollTrigger.getAll().forEach((t) => t.kill());
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [renderFrame, scheduleRender, triggerCompletion]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-[#080B11] text-white overflow-y-auto overflow-x-hidden select-none"
      style={{ scrollbarWidth: 'none' }}
    >
      {/* Scrollable Track that controls the GSAP ScrollTrigger timeline */}
      <div
        ref={scrollWrapperRef}
        className="w-full h-[600vh] relative pointer-events-auto"
      >
        {/* Pinned Cinematic Full-Screen Viewport */}
        <div
          ref={overlayRef}
          className="fixed inset-0 w-screen h-screen flex flex-col justify-between pointer-events-none"
        >
          {/* Instant 0ms First-Frame Image (Behind Canvas, guarantees 0ms display on initial paint) */}
          <img
            src="/frames/ezgif-frame-001.jpg"
            alt="Supermarket Entrance Cinematic Intro"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0"
          />

          {/* Main Full-Screen Hardware-Accelerated Canvas (Paints on top of fallback at 60fps) */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full object-cover z-10"
          />

          {/* Cinematic Letterbox Vignette Shadows */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/75 pointer-events-none z-20" />
          <div className="absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.85)] pointer-events-none z-20" />

          {/* --- TOP HEADER BAR --- */}
          <header className="relative z-30 px-6 sm:px-10 py-6 flex items-center justify-between">
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
          <footer className="relative z-30 px-6 sm:px-10 py-7 flex flex-col items-center gap-4">
            {/* Animated Mouse Wheel Scroll Prompt */}
            <div className="flex flex-col items-center gap-2 animate-bounce opacity-90 transition-opacity">
              <div className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-white/90 drop-shadow">
                <Mouse className="w-4 h-4 text-blue-400 animate-pulse" />
                <span>Scroll Down to Enter Supermarket</span>
              </div>
              <ChevronDown className="w-4 h-4 text-blue-400" />
            </div>

            {/* High-Tech Cinematic Scrub Progress Bar */}
            <div className="w-full max-w-xl space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 font-bold">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
                  CAMERA SEQUENCE
                </span>
                <span ref={frameCounterRef} className="text-blue-400">
                  FRAME 001 / {TOTAL_FRAMES}
                </span>
                <span ref={percentTextRef}>0%</span>
              </div>

              {/* Progress Track */}
              <div className="w-full h-1.5 rounded-full bg-white/10 backdrop-blur-sm overflow-hidden p-0.5 border border-white/10">
                <div
                  ref={progressBarRef}
                  className="h-full rounded-full bg-gradient-to-r from-blue-600 via-cyan-400 to-indigo-500 shadow-md shadow-cyan-400/50 transition-all duration-75"
                  style={{ width: '2%' }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                <span>Roll Mouse Wheel Down / Swipe Up</span>
                <span ref={loadedCountRef}>Loading frames...</span>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};
