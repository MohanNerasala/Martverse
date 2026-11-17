'use client';

import React, { useRef, useState, useEffect } from 'react';
import { martRuntime, useMartStore } from '@/store/useMartStore';

export const TouchJoystick: React.FC = () => {
  const [active, setActive] = useState(false);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const touchIdRef = useRef<number | null>(null);
  const centerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const setHasMovedTrolley = useMartStore((state) => state.setHasMovedTrolley);

  const radius = 48; // Joystick radius in pixels

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    touchIdRef.current = touch.identifier;

    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    centerRef.current = { x: centerX, y: centerY };

    setActive(true);
    setHasMovedTrolley(true);
    updateMovement(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchIdRef.current) {
        updateMovement(touch.clientX, touch.clientY);
        break;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchIdRef.current) {
        touchIdRef.current = null;
        setActive(false);
        setKnobPos({ x: 0, y: 0 });
        martRuntime.virtualKeys.forward = false;
        martRuntime.virtualKeys.backward = false;
        martRuntime.virtualKeys.left = false;
        martRuntime.virtualKeys.right = false;
        break;
      }
    }
  };

  const updateMovement = (clientX: number, clientY: number) => {
    const dx = clientX - centerRef.current.x;
    const dy = clientY - centerRef.current.y;
    const dist = Math.hypot(dx, dy);
    const clampedDist = Math.min(dist, radius);
    const angle = Math.atan2(dy, dx);

    const nx = Math.cos(angle) * clampedDist;
    const ny = Math.sin(angle) * clampedDist;
    setKnobPos({ x: nx, y: ny });

    const normX = nx / radius;
    const normY = ny / radius;

    // Deadzone
    const deadzone = 0.2;
    martRuntime.virtualKeys.forward = normY < -deadzone;
    martRuntime.virtualKeys.backward = normY > deadzone;
    martRuntime.virtualKeys.left = normX < -deadzone;
    martRuntime.virtualKeys.right = normX > deadzone;
  };

  return (
    <div
      className="pointer-events-auto fixed bottom-6 left-6 z-40 touch-none md:hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {/* Outer Joystick Ring */}
      <div className="w-28 h-28 rounded-full bg-slate-900/40 backdrop-blur-md border-2 border-white/30 flex items-center justify-center relative shadow-xl">
        {/* Inner Guide Cross */}
        <div className="absolute w-12 h-0.5 bg-white/20" />
        <div className="absolute h-12 w-0.5 bg-white/20" />

        {/* Thumb Knob */}
        <div
          className={`w-12 h-12 rounded-full border-2 transition-transform duration-75 flex items-center justify-center shadow-lg ${
            active
              ? 'bg-blue-600 border-white scale-105'
              : 'bg-white/70 border-white/90'
          }`}
          style={{
            transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
          }}
        >
          <div className="w-3 h-3 rounded-full bg-slate-800/40" />
        </div>
      </div>
    </div>
  );
};

