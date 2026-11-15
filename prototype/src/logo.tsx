/** The spike mark: the L of tape a stage manager lays on the floor to mark a position. Two strips, the lower one a little deeper
 *  so the overlap reads; colours follow the theme (--mark-hi, --mark-lo in index.css). Decorative: the name beside it is the label. */
export function Mark({ size = '1em', className = '' }: { size?: number | string; className?: string }) {
  const s = typeof size === 'number' ? `${size}px` : size;
  return (
    <svg className={`mark ${className}`} viewBox="0 0 100 100" style={{ width: s, height: s }} aria-hidden="true" focusable="false">
      <polygon className="mark-v" points="0,7 27,0 27,68 0,68" />
      <polygon className="mark-h" points="0,72 100,72 94,100 0,100" />
    </svg>
  );
}
