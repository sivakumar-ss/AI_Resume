import { cx } from '../../utils/cx'
import Spinner from './Spinner'

const variants = {
  primary:
    'bg-brand-600 text-white shadow-sm shadow-brand-600/20 hover:bg-brand-700 active:bg-brand-800',
  secondary: 'bg-navy-900 text-white shadow-sm hover:bg-navy-800 active:bg-navy-950',
  light:
    'bg-white text-navy-900 shadow-sm shadow-navy-950/10 hover:bg-brand-50 active:bg-brand-100',
  onDark:
    'border border-white/25 bg-white/5 text-white hover:border-white/40 hover:bg-white/10',
  outline:
    'border border-slate-300 bg-white text-navy-800 hover:border-brand-300 hover:bg-brand-50/60',
  soft: 'border border-brand-100 bg-brand-50 text-brand-700 hover:bg-brand-100/80',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-navy-900',
  danger: 'bg-rose-600 text-white shadow-sm hover:bg-rose-700 active:bg-rose-800',
}

const sizes = {
  sm: 'h-9 gap-1.5 rounded-lg px-3 text-sm',
  md: 'h-11 gap-2 rounded-xl px-5 text-sm',
  lg: 'h-12 gap-2.5 rounded-xl px-6 text-base',
}

export function buttonClasses({ variant = 'primary', size = 'md', className = '' } = {}) {
  return cx(
    'inline-flex select-none items-center justify-center font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-60',
    variants[variant] || variants.primary,
    sizes[size] || sizes.md,
    className,
  )
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  loadingText,
  icon: Icon,
  iconRight: IconRight,
  disabled = false,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClasses({ variant, size, className })}
      {...props}
    >
      {loading ? (
        <Spinner size={size === 'lg' ? 'md' : 'sm'} />
      ) : Icon ? (
        <Icon className={size === 'sm' ? 'size-4' : 'size-[18px]'} aria-hidden="true" />
      ) : null}
      {loading && loadingText ? loadingText : children}
      {!loading && IconRight ? (
        <IconRight
          className={size === 'sm' ? 'size-4' : 'size-[18px]'}
          aria-hidden="true"
        />
      ) : null}
    </button>
  )
}
