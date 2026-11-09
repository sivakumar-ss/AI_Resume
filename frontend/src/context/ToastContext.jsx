import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'

import { cx } from '../utils/cx'

const ToastContext = createContext(null)

const VARIANT_STYLES = {
  success: {
    icon: CheckCircle2,
    iconClass: 'text-emerald-600 bg-emerald-50',
    border: 'border-emerald-200',
  },
  error: {
    icon: AlertCircle,
    iconClass: 'text-rose-600 bg-rose-50',
    border: 'border-rose-200',
  },
  info: {
    icon: Info,
    iconClass: 'text-brand-700 bg-brand-50',
    border: 'border-brand-200',
  },
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const nextId = useRef(0)

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const addToast = useCallback(
    ({ type = 'success', title, message, duration = 4500 }) => {
      nextId.current += 1
      const id = nextId.current
      setToasts((current) => [...current.slice(-3), { id, type, title, message }])

      if (duration > 0) {
        window.setTimeout(() => removeToast(id), duration)
      }
      return id
    },
    [removeToast],
  )

  const value = useMemo(() => ({ addToast, removeToast }), [addToast, removeToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[100] flex flex-col items-end gap-3 sm:left-auto sm:right-6 sm:w-full sm:max-w-sm"
        aria-live="polite"
      >
        {toasts.map((toast) => {
          const style = VARIANT_STYLES[toast.type] || VARIANT_STYLES.info
          const Icon = style.icon
          return (
            <div
              key={toast.id}
              role={toast.type === 'error' ? 'alert' : 'status'}
              className={cx(
                'pointer-events-auto flex w-full items-start gap-3 rounded-2xl border bg-white p-4 shadow-lifted',
                style.border,
              )}
            >
              <span className={cx('rounded-xl p-2', style.iconClass)}>
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                {toast.title ? (
                  <p className="text-sm font-semibold text-navy-900">{toast.title}</p>
                ) : null}
                {toast.message ? (
                  <p className="mt-0.5 text-sm leading-6 text-slate-600">{toast.message}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                aria-label="Dismiss notification"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used inside a ToastProvider')
  }
  return context
}
