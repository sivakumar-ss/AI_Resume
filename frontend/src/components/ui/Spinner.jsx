import { cx } from '../../utils/cx'

const sizes = {
  xs: 'size-3',
  sm: 'size-4',
  md: 'size-5',
  lg: 'size-8',
}

export default function Spinner({ size = 'md', className = '', label }) {
  return (
    <span
      role={label ? 'status' : undefined}
      aria-label={label}
      className={cx(
        'inline-block animate-spin rounded-full border-2 border-current border-r-transparent',
        sizes[size] || sizes.md,
        className,
      )}
    />
  )
}
