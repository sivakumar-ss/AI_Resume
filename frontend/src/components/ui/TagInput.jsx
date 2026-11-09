import { useId, useState } from 'react'
import { Plus, X } from 'lucide-react'

import { cx } from '../../utils/cx'

export default function TagInput({
  label,
  value = [],
  onChange,
  placeholder = 'Type and press Enter',
  maxItems = 20,
  maxLength = 50,
  error,
  hint,
  id: providedId,
}) {
  const generatedId = useId()
  const id = providedId || generatedId
  const [draft, setDraft] = useState('')
  const [internalError, setInternalError] = useState('')

  function addTag(rawValue = draft) {
    const next = rawValue.trim().replace(/\s+/g, ' ')
    if (!next) return
    if (value.length >= maxItems) {
      setInternalError(`You can add up to ${maxItems} items.`)
      return
    }
    if (next.length > maxLength) {
      setInternalError(`Each item must be ${maxLength} characters or fewer.`)
      return
    }
    if (value.some((item) => item.toLowerCase() === next.toLowerCase())) {
      setDraft('')
      setInternalError('')
      return
    }
    onChange([...value, next])
    setDraft('')
    setInternalError('')
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      addTag()
    } else if (event.key === 'Backspace' && !draft && value.length) {
      onChange(value.slice(0, -1))
    }
  }

  function removeTag(index) {
    onChange(value.filter((_, itemIndex) => itemIndex !== index))
    setInternalError('')
  }

  const shownError = error || internalError

  return (
    <div className="space-y-1.5">
      {label ? (
        <label htmlFor={id} className="block text-sm font-medium text-navy-800">
          {label}
        </label>
      ) : null}
      <div
        className={cx(
          'flex min-h-11 flex-wrap items-center gap-1.5 rounded-xl border bg-white px-2 py-1.5 shadow-sm transition focus-within:ring-2',
          shownError
            ? 'border-rose-300 focus-within:border-rose-400 focus-within:ring-rose-100'
            : 'border-slate-300 focus-within:border-brand-400 focus-within:ring-brand-100',
        )}
      >
        {value.map((tag, index) => (
          <span
            key={`${tag}-${index}`}
            className="inline-flex max-w-full items-center gap-1 rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700"
          >
            <span className="truncate">{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="rounded p-0.5 text-brand-500 transition hover:bg-brand-100 hover:text-brand-800"
              aria-label={`Remove ${tag}`}
            >
              <X className="size-3" aria-hidden="true" />
            </button>
          </span>
        ))}
        <input
          id={id}
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value)
            if (internalError) setInternalError('')
          }}
          onKeyDown={handleKeyDown}
          onBlur={() => addTag()}
          maxLength={maxLength}
          placeholder={value.length ? 'Add another…' : placeholder}
          aria-invalid={shownError ? 'true' : undefined}
          aria-describedby={shownError ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className="min-w-28 flex-1 bg-transparent px-1 py-0.5 text-sm text-navy-900 outline-none placeholder:text-slate-400"
        />
        <button
          type="button"
          onClick={() => addTag()}
          disabled={!draft.trim()}
          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-brand-600 disabled:opacity-40"
          aria-label="Add item"
        >
          <Plus className="size-4" aria-hidden="true" />
        </button>
      </div>
      <div className="flex items-start justify-between gap-3">
        {shownError ? (
          <p id={`${id}-error`} className="text-xs font-medium text-rose-600">
            {shownError}
          </p>
        ) : hint ? (
          <p id={`${id}-hint`} className="text-xs leading-5 text-slate-500">
            {hint}
          </p>
        ) : (
          <span />
        )}
        <span className="shrink-0 text-[11px] text-slate-400">
          {value.length}/{maxItems}
        </span>
      </div>
    </div>
  )
}
