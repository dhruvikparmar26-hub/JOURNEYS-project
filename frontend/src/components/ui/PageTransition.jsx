import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * PageTransition — Wraps page content with smooth route-change animations.
 * - Fade + slide-up on mount
 * - Scroll to top on route change
 * - Optional loading bar at top
 */
const PageTransition = ({ children }) => {
  const location = useLocation();
  const [isAnimating, setIsAnimating] = useState(true);
  const [displayChildren, setDisplayChildren] = useState(children);
  const prevPathRef = useRef(location.pathname);

  useEffect(() => {
    // Route changed
    if (prevPathRef.current !== location.pathname) {
      prevPathRef.current = location.pathname;
      setIsAnimating(true);

      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'instant' });

      // Small delay to let exit animation play, then swap children
      const t = setTimeout(() => {
        setDisplayChildren(children);
        setIsAnimating(true);
      }, 50);

      return () => clearTimeout(t);
    } else {
      setDisplayChildren(children);
    }
  }, [location.pathname, children]);

  useEffect(() => {
    if (isAnimating) {
      const t = setTimeout(() => setIsAnimating(false), 400);
      return () => clearTimeout(t);
    }
  }, [isAnimating]);

  return (
    <div
      style={{
        opacity: isAnimating ? 0 : 1,
        transform: isAnimating ? 'translateY(12px)' : 'translateY(0)',
        transition: 'opacity 0.35s ease-out, transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        willChange: 'opacity, transform',
        minHeight: '100vh',
      }}
    >
      {displayChildren}
    </div>
  );
};

/**
 * ScrollProgress — Fixed top bar that shows scroll progress.
 */
export const ScrollProgress = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        setProgress((scrollTop / docHeight) * 100);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (progress <= 0) return null;

  return (
    <div
      className="scroll-progress"
      style={{ width: `${progress}%` }}
      aria-hidden="true"
    />
  );
};

/**
 * RouteLoadingBar — NProgress-style loading indicator.
 */
export const RouteLoadingBar = ({ isLoading }) => {
  const [width, setWidth] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setVisible(true);
      setWidth(0);
      const t1 = setTimeout(() => setWidth(30), 50);
      const t2 = setTimeout(() => setWidth(60), 300);
      const t3 = setTimeout(() => setWidth(80), 800);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    } else if (visible) {
      setWidth(100);
      const t = setTimeout(() => {
        setVisible(false);
        setWidth(0);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [isLoading, visible]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '3px',
        width: `${width}%`,
        background: 'linear-gradient(90deg, #ffa630, #fe4c8c, #3ecadf)',
        zIndex: 99999,
        transition: width === 100 ? 'width 0.2s ease, opacity 0.3s ease' : 'width 0.4s ease',
        opacity: width === 100 ? 0 : 1,
        boxShadow: '0 0 8px rgba(255, 166, 48, 0.4)',
      }}
    />
  );
};

export default PageTransition;
