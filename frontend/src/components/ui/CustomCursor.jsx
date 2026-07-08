import React, { useEffect, useRef, useState, useCallback } from 'react';

/**
 * CustomCursor — Travel-themed cursor that follows the mouse.
 * Shows a compass by default, transforms to an airplane on interactive elements.
 * Automatically disabled on touch devices.
 */
const CustomCursor = () => {
  const cursorRef = useRef(null);
  const trailRef = useRef(null);
  const [isInteractive, setIsInteractive] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const posRef = useRef({ x: -100, y: -100 });
  const trailPosRef = useRef({ x: -100, y: -100 });
  const rafRef = useRef(null);

  useEffect(() => {
    // Detect touch device
    const isTouch = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
    setIsTouchDevice(isTouch);
    if (isTouch) return;

    // Hide default cursor
    document.documentElement.style.cursor = 'none';
    document.body.style.cursor = 'none';

    return () => {
      document.documentElement.style.cursor = '';
      document.body.style.cursor = '';
    };
  }, []);

  const animate = useCallback(() => {
    if (cursorRef.current) {
      cursorRef.current.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px)`;
    }
    if (trailRef.current) {
      // Smooth trailing
      trailPosRef.current.x += (posRef.current.x - trailPosRef.current.x) * 0.15;
      trailPosRef.current.y += (posRef.current.y - trailPosRef.current.y) * 0.15;
      trailRef.current.style.transform = `translate(${trailPosRef.current.x}px, ${trailPosRef.current.y}px)`;
    }
    rafRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    if (isTouchDevice) return;

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isTouchDevice, animate]);

  useEffect(() => {
    if (isTouchDevice) return;

    const handleMouseMove = (e) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);

      // Check if hovering over interactive element
      const target = e.target;
      const interactive = target.closest('a, button, [role="button"], input, textarea, select, label[for], .cursor-pointer, [onclick]');
      setIsInteractive(!!interactive);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isTouchDevice, isVisible]);

  // Don't render on touch devices
  if (isTouchDevice) return null;

  return (
    <>
      {/* Trail circle */}
      <div
        ref={trailRef}
        style={{
          position: 'fixed',
          top: -16,
          left: -16,
          width: 32,
          height: 32,
          borderRadius: '50%',
          border: `2px solid ${isInteractive ? '#ffa630' : 'rgba(11, 18, 38, 0.2)'}`,
          pointerEvents: 'none',
          zIndex: 99998,
          transition: 'width 0.3s, height 0.3s, border-color 0.3s, opacity 0.2s',
          opacity: isVisible ? 0.6 : 0,
          ...(isInteractive ? { width: 48, height: 48, top: -24, left: -24 } : {}),
          ...(isClicking ? { width: 24, height: 24, top: -12, left: -12 } : {}),
        }}
      />

      {/* Main cursor icon */}
      <div
        ref={cursorRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          zIndex: 99999,
          transition: 'opacity 0.2s',
          opacity: isVisible ? 1 : 0,
          willChange: 'transform',
        }}
      >
        {isInteractive ? (
          /* Airplane icon for interactive elements */
          <svg
            width="20" height="20" viewBox="0 0 24 24"
            style={{
              transform: `translate(-10px, -10px) scale(${isClicking ? 0.85 : 1}) rotate(-45deg)`,
              transition: 'transform 0.15s ease',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
            }}
          >
            <path
              d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"
              fill="#ffa630"
              stroke="#0B1226"
              strokeWidth="1"
            />
          </svg>
        ) : (
          /* Compass icon for default cursor */
          <svg
            width="18" height="18" viewBox="0 0 24 24"
            style={{
              transform: `translate(-9px, -9px) scale(${isClicking ? 0.85 : 1})`,
              transition: 'transform 0.15s ease',
              filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.25))',
            }}
          >
            <circle cx="12" cy="12" r="10" fill="#FFF7EC" stroke="#0B1226" strokeWidth="1.5" />
            <polygon points="12,2 13.5,10 12,8 10.5,10" fill="#ba1a1a" stroke="none" />
            <polygon points="12,22 10.5,14 12,16 13.5,14" fill="#0B1226" stroke="none" />
            <circle cx="12" cy="12" r="1.5" fill="#0B1226" />
            <line x1="12" y1="5" x2="12" y2="7" stroke="#0B1226" strokeWidth="1" />
            <line x1="12" y1="17" x2="12" y2="19" stroke="#0B1226" strokeWidth="1" />
            <line x1="5" y1="12" x2="7" y2="12" stroke="#0B1226" strokeWidth="1" />
            <line x1="17" y1="12" x2="19" y2="12" stroke="#0B1226" strokeWidth="1" />
          </svg>
        )}
      </div>

      {/* Global style to hide native cursor */}
      <style>{`
        *, *::before, *::after {
          cursor: none !important;
        }
      `}</style>
    </>
  );
};

export default CustomCursor;
