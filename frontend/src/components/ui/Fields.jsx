import { useId } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

import { cx } from '../../utils/cx'

const fieldBase =
  'w-full rounded-xl border bg-white text-sm text-navy-900 shadow-sm transition placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500'

export function Input({
  label,
  error,
  hint,
  icon: Icon,
  rightElement,
  className = '',
  containerClassName = '',
  required = false,
  id: providedId,
  ...props
}) {
  const generatedId = useId()
  const id = providedId || generatedId
  const describedBy = [error ? `${id}-error` : '', hint ? `${id}-hint` : '']
    .filter(Boolean)
    .join(' ')

  return (
    <div className={cx('space-y-1.5', containerClassName)}>
      {label ? (
        <label htmlFor={id} className="block text-sm font-medium text-navy-800">
          {label}
          {required ? <span className="ml-0.5 text-rose-500">*</span> : null}
        </label>
      ) : null}
      <div className="relative">
        {Icon ? (
          <Icon
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
        ) : null}
        <input
          id={id}
          required={required}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy || undefined}
          className={cx(
            fieldBase,
            'h-11 px-3.5',
            Icon && 'pl-10',
            rightElement && 'pr-11',
            error
              ? 'border-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-100'
              : 'border-slate-300 focus:border-brand-400 focus:ring-2 focus:ring-brand-100',
            className,
          )}
          {...props}
        />
        {rightElement ? (
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2">{rightElement}</div>
        ) : null}
      </div>
      {error ? (
        <p id={`${id}-error`} className="text-xs font-medium text-rose-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs leading-5 text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

export function PasswordInput(props) {
  const [visible, setVisible] = useState(false)

  return (
    <Input
      {...props}
      type={visible ? 'text' : 'password'}
      rightElement={
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? (
            <EyeOff className="size-4" aria-hidden="true" />
          ) : (
            <Eye className="size-4" aria-hidden="true" />
          )}
        </button>
      }
    />
  )
}

export function Select({
  label,
  error,
  hint,
  className = '',
  containerClassName = '',
  required = false,
  id: providedId,
  children,
  ...props
}) {
  const generatedId = useId()
  const id = providedId || generatedId
  const describedBy = [error ? `${id}-error` : '', hint ? `${id}-hint` : '']
    .filter(Boolean)
    .join(' ')

  return (
    <div className={cx('space-y-1.5', containerClassName)}>
      {label ? (
        <label htmlFor={id} className="block text-sm font-medium text-navy-800">
          {label}
          {required ? <span className="ml-0.5 text-rose-500">*</span> : null}
        </label>
      ) : null}
      <div className="relative">
        <select
          id={id}
          required={required}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy || undefined}
          className={cx(
            fieldBase,
            'h-11 appearance-none px-3.5 pr-10',
            error
              ? 'border-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-100'
              : 'border-slate-300 focus:border-brand-400 focus:ring-2 focus:ring-brand-100',
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <svg
          className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="m5 7.5 5 5 5-5"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      {error ? (
        <p id={`${id}-error`} className="text-xs font-medium text-rose-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs leading-5 text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

export function Textarea({
  label,
  error,
  hint,
  className = '',
  containerClassName = '',
  required = false,
  id: providedId,
  rows = 4,
  ...props
}) {
  const generatedId = useId()
  const id = providedId || generatedId
  const describedBy = [error ? `${id}-error` : '', hint ? `${id}-hint` : '']
    .filter(Boolean)
    .join(' ')

  return (
    <div className={cx('space-y-1.5', containerClassName)}>
      {label ? (
        <label htmlFor={id} className="block text-sm font-medium text-navy-800">
          {label}
          {required ? <span className="ml-0.5 text-rose-500">*</span> : null}
        </label>
      ) : null}
      <textarea
        id={id}
        rows={rows}
        required={required}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy || undefined}
        className={cx(
          fieldBase,
          'resize-y px-3.5 py-2.5 leading-6',
          error
            ? 'border-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-100'
            : 'border-slate-300 focus:border-brand-400 focus:ring-2 focus:ring-brand-100',
          className,
        )}
        {...props}
      />
      <div className="flex items-start justify-between gap-3">
        {error ? (
          <p id={`${id}-error`} className="text-xs font-medium text-rose-600">
            {error}
          </p>
        ) : hint ? (
          <p id={`${id}-hint`} className="text-xs leading-5 text-slate-500">
            {hint}
          </p>
        ) : (
          <span />
        )}
        {props.maxLength ? (
          <span className="shrink-0 text-[11px] text-slate-400">
            {String(props.value || '').length}/{props.maxLength}
          </span>
        ) : null}
      </div>
    </div>
  )
}
