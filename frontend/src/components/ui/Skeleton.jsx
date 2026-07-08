import React from 'react';

/**
 * Skeleton — Shimmer loading placeholder with multiple variants.
 * Uses the travel-themed gradient from index.css for the shimmer effect.
 */

// ─── Base Skeleton ─────────────────────────────────────
const Skeleton = ({ width, height, className = '', variant = 'text', style = {} }) => {
  const baseClass = 'skeleton';

  const variantStyles = {
    text: { height: height || '16px', width: width || '100%', borderRadius: '6px' },
    heading: { height: height || '28px', width: width || '60%', borderRadius: '8px' },
    circle: { height: height || '48px', width: width || '48px', borderRadius: '50%' },
    image: { height: height || '200px', width: width || '100%', borderRadius: '12px' },
    button: { height: height || '44px', width: width || '120px', borderRadius: '9999px' },
    badge: { height: height || '24px', width: width || '64px', borderRadius: '9999px' },
  };

  return (
    <div
      className={`${baseClass} ${className}`}
      style={{
        ...variantStyles[variant],
        ...style,
        display: 'block',
        flexShrink: 0,
      }}
      aria-hidden="true"
      role="presentation"
    />
  );
};

// ─── Compound Skeletons ─────────────────────────────────

/** Card skeleton — image on top + text lines */
export const SkeletonCard = ({ className = '' }) => (
  <div className={`bg-white rounded-xl border border-outline-variant/20 overflow-hidden ${className}`}>
    <Skeleton variant="image" height="180px" style={{ borderRadius: 0 }} />
    <div className="p-5 space-y-3">
      <Skeleton variant="heading" width="70%" />
      <Skeleton variant="text" width="100%" />
      <Skeleton variant="text" width="85%" />
      <div className="flex items-center gap-3 pt-2">
        <Skeleton variant="badge" />
        <Skeleton variant="badge" width="80px" />
      </div>
    </div>
  </div>
);

/** List item skeleton — avatar + text */
export const SkeletonListItem = ({ className = '' }) => (
  <div className={`flex items-center gap-4 p-4 ${className}`}>
    <Skeleton variant="circle" width="44px" height="44px" />
    <div className="flex-1 space-y-2">
      <Skeleton variant="text" width="50%" height="14px" />
      <Skeleton variant="text" width="80%" height="12px" />
    </div>
    <Skeleton variant="badge" width="48px" height="20px" />
  </div>
);

/** Table row skeleton */
export const SkeletonTableRow = ({ cols = 4, className = '' }) => (
  <div className={`flex items-center gap-4 py-4 px-6 border-b border-outline-variant/10 ${className}`}>
    {Array.from({ length: cols }).map((_, i) => (
      <Skeleton key={i} variant="text" width={`${Math.random() * 30 + 50}%`} height="14px" style={{ flex: 1 }} />
    ))}
  </div>
);

/** Profile skeleton — avatar + name + bio */
export const SkeletonProfile = ({ className = '' }) => (
  <div className={`flex flex-col items-center gap-4 p-8 ${className}`}>
    <Skeleton variant="circle" width="96px" height="96px" />
    <Skeleton variant="heading" width="160px" height="24px" />
    <Skeleton variant="text" width="220px" height="14px" />
    <div className="flex gap-6 mt-4">
      <div className="text-center space-y-2">
        <Skeleton variant="text" width="40px" height="20px" style={{ margin: '0 auto' }} />
        <Skeleton variant="text" width="60px" height="12px" />
      </div>
      <div className="text-center space-y-2">
        <Skeleton variant="text" width="40px" height="20px" style={{ margin: '0 auto' }} />
        <Skeleton variant="text" width="60px" height="12px" />
      </div>
      <div className="text-center space-y-2">
        <Skeleton variant="text" width="40px" height="20px" style={{ margin: '0 auto' }} />
        <Skeleton variant="text" width="60px" height="12px" />
      </div>
    </div>
  </div>
);

/** Destination detail skeleton */
export const SkeletonDestinationDetail = ({ className = '' }) => (
  <div className={`space-y-6 ${className}`}>
    <Skeleton variant="image" height="400px" />
    <div className="max-w-[1280px] mx-auto px-6 space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton variant="heading" width="300px" height="36px" />
        <Skeleton variant="badge" width="80px" height="28px" />
      </div>
      <div className="flex gap-4">
        <Skeleton variant="badge" width="100px" height="32px" />
        <Skeleton variant="badge" width="120px" height="32px" />
        <Skeleton variant="badge" width="90px" height="32px" />
        <Skeleton variant="badge" width="110px" height="32px" />
      </div>
      <div className="space-y-3">
        <Skeleton variant="text" width="100%" />
        <Skeleton variant="text" width="95%" />
        <Skeleton variant="text" width="88%" />
        <Skeleton variant="text" width="92%" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  </div>
);

/** Chat skeleton */
export const SkeletonChat = ({ className = '' }) => (
  <div className={`space-y-4 p-4 ${className}`}>
    {/* User message */}
    <div className="flex justify-end">
      <Skeleton variant="text" width="200px" height="40px" style={{ borderRadius: '16px' }} />
    </div>
    {/* AI response */}
    <div className="flex gap-3">
      <Skeleton variant="circle" width="32px" height="32px" />
      <div className="space-y-2 flex-1 max-w-[70%]">
        <Skeleton variant="text" width="100%" height="16px" />
        <Skeleton variant="text" width="85%" height="16px" />
        <Skeleton variant="text" width="60%" height="16px" />
      </div>
    </div>
    {/* User message */}
    <div className="flex justify-end">
      <Skeleton variant="text" width="160px" height="40px" style={{ borderRadius: '16px' }} />
    </div>
    {/* AI response */}
    <div className="flex gap-3">
      <Skeleton variant="circle" width="32px" height="32px" />
      <div className="space-y-2 flex-1 max-w-[70%]">
        <Skeleton variant="text" width="90%" height="16px" />
        <Skeleton variant="text" width="75%" height="16px" />
      </div>
    </div>
  </div>
);

/** Grid of skeleton cards */
export const SkeletonGrid = ({ count = 6, cols = 3, className = '' }) => (
  <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${cols} gap-6 ${className}`}>
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export default Skeleton;
