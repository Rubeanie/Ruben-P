// Full width and centred are the defaults, so they carry no attribute.
export function blockLayout(size, align) {
  const sized = size === 'medium' || size === 'small';
  const aligned = sized && (align === 'start' || align === 'end');
  return {
    'data-size': sized ? size : undefined,
    'data-align': aligned ? align : undefined
  };
}
