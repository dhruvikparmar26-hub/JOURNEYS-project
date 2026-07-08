import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * useIntersectionObserver — Trigger animations when elements scroll into view.
 * @param {Object} options - IntersectionObserver options
 * @returns {[ref, isIntersecting]}
 */
export const useIntersectionObserver = (options = {}) => {
  const ref = useRef(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.unobserve(el); // Only trigger once
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px', ...options }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, isIntersecting];
};

/**
 * useCountUp — Animated count-up from 0 to target value.
 * @param {number} target - The target number
 * @param {number} duration - Animation duration in ms
 * @param {boolean} trigger - Whether to start the animation
 * @returns {number} current value
 */
export const useCountUp = (target, duration = 1500, trigger = true) => {
  const [value, setValue] = useState(0);
  const startTimeRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!trigger || target === 0) {
      setValue(trigger ? 0 : target);
      return;
    }

    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    startTimeRef.current = null;
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, trigger]);

  return value;
};

/**
 * useRipple — Material-style ripple effect on click.
 * Attach ref to the container element.
 * @returns {ref}
 */
export const useRipple = () => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleClick = (e) => {
      const rect = el.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      const ripple = document.createElement('span');
      ripple.className = 'ripple-effect';
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;

      el.classList.add('ripple-container');
      el.appendChild(ripple);

      ripple.addEventListener('animationend', () => {
        ripple.remove();
      });
    };

    el.addEventListener('click', handleClick);
    return () => el.removeEventListener('click', handleClick);
  }, []);

  return ref;
};

/**
 * useTilt — 3D card tilt on mouse hover.
 * @param {Object} options - { maxTilt, scale, speed }
 * @returns {ref}
 */
export const useTilt = (options = {}) => {
  const { maxTilt = 8, scale = 1.02, speed = 300 } = options;
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Disable on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const handleMouseMove = (e) => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const mouseX = e.clientX - centerX;
      const mouseY = e.clientY - centerY;

      const rotateX = (-mouseY / (rect.height / 2)) * maxTilt;
      const rotateY = (mouseX / (rect.width / 2)) * maxTilt;

      el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`;
      el.style.transition = `transform ${speed / 4}ms ease`;
    };

    const handleMouseLeave = () => {
      el.style.transform = '';
      el.style.transition = `transform ${speed}ms ease`;
    };

    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [maxTilt, scale, speed]);

  return ref;
};

/**
 * useTypewriter — Typewriter text reveal effect.
 * @param {string} text - The text to type
 * @param {number} speed - Typing speed in ms per char
 * @param {boolean} trigger - Whether to start typing
 * @returns {string} displayed text
 */
export const useTypewriter = (text, speed = 40, trigger = true) => {
  const [displayed, setDisplayed] = useState('');
  const indexRef = useRef(0);

  useEffect(() => {
    if (!trigger) {
      setDisplayed('');
      indexRef.current = 0;
      return;
    }

    setDisplayed('');
    indexRef.current = 0;

    const interval = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayed(text.slice(0, indexRef.current + 1));
        indexRef.current += 1;
      } else {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, trigger]);

  return displayed;
};

/**
 * useParallax — Parallax scroll effect for background elements.
 * @param {number} speed - Parallax speed factor (0.1 = subtle, 0.5 = strong)
 * @returns {ref, style}
 */
export const useParallax = (speed = 0.3) => {
  const ref = useRef(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const el = ref.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      if (rect.top < windowHeight && rect.bottom > 0) {
        const scrollProgress = (windowHeight - rect.top) / (windowHeight + rect.height);
        setOffset((scrollProgress - 0.5) * speed * 100);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial calculation
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  const style = {
    transform: `translateY(${offset}px)`,
    willChange: 'transform',
  };

  return { ref, style };
};

/**
 * useStaggerChildren — Returns delay values for staggered child animations.
 * @param {number} count - Number of children
 * @param {number} delayMs - Delay between each child in ms
 * @param {boolean} trigger - Whether to animate
 * @returns {Array<{ style, className }>}
 */
export const useStaggerChildren = (count, delayMs = 60, trigger = true) => {
  return Array.from({ length: count }).map((_, i) => ({
    style: {
      animationDelay: `${i * delayMs}ms`,
      opacity: trigger ? undefined : 0,
    },
    className: trigger ? 'stagger-item' : '',
  }));
};

/**
 * useImageLoaded — Track image loading state for blur-up effect.
 * @returns {[ref, isLoaded]}
 */
export const useImageLoaded = () => {
  const ref = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const img = ref.current;
    if (!img) return;

    if (img.complete) {
      setIsLoaded(true);
    } else {
      img.addEventListener('load', () => setIsLoaded(true));
    }
  }, []);

  return [ref, isLoaded];
};

/**
 * useScrollDirection — Detect scroll direction for header auto-hide.
 * @returns {'up' | 'down'}
 */
export const useScrollDirection = () => {
  const [direction, setDirection] = useState('up');
  const prevScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY > prevScrollY.current + 5) {
        setDirection('down');
      } else if (currentY < prevScrollY.current - 5) {
        setDirection('up');
      }
      prevScrollY.current = currentY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return direction;
};
