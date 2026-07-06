import React from 'react';

const Skeleton = ({
  className = '',
  width = '100%',
  height = '1rem',
  circle = false,
  rounded = true,
  style = {},
  ...props
}) => {
  const baseClasses = `
    animate-shimmer
    ${circle ? 'rounded-full' : rounded ? 'rounded-[10px]' : ''}
  `;

  return (
    <div
      className={`${baseClasses} ${className}`}
      style={{
        width,
        height,
        ...style,
      }}
      {...props}
    />
  );
};

export default Skeleton;
