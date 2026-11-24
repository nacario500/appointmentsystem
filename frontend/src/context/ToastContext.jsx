import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, X, XCircle } from 'lucide-react'

const Ctx = createContext(null)
export const useToast = () => useContext(Ctx)

const TOAST_MS = 4200
const TONES = {
  success: {
    icon: CheckCircle2,
    badge: 'bg-accent/10 text-accent-dark',
    border: 'border-accent/25',
    bar: 'bg-accent',
  },
  error: {
    icon: XCircle,
    badge: 'bg-red-50 text-danger',
    border: 'border-red-200/70',
    bar: 'bg-danger',
  },
}

export function ToastProvider({ children }) {
  const [items, setItems] = useState([])

  const remove = useCallback((id) => setItems((s) => s.filter((i) => i.id !== id)), [])

  const push = useCallback((type, message) => {
    const id = Date.now() + Math.random()
    setItems((s) => [...s, { id, type, message }])
    setTimeout(() => remove(id), TOAST_MS)
  }, [remove])

  const toast = useMemo(() => ({ success: (m) => push('success', m), error: (m) => push('error', m) }), [push])

  return (
    <Ctx.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed inset-x-4 top-4 z-[100] flex flex-col gap-2 sm:left-auto sm:right-4 sm:w-[380px] no-print" role="status" aria-live="polite">
        <AnimatePresence initial={false}>
          {items.map((i) => {
            const tone = TONES[i.type] || TONES.success
            const Icon = tone.icon
            return (
              <motion.div
                key={i.id}
                layout
                initial={{ opacity: 0, y: -18, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 36, scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                className={`pointer-events-auto relative overflow-hidden rounded-xl border ${tone.border} bg-white/95 p-3.5 pr-10 shadow-[0_18px_40px_-18px_rgba(17,17,17,0.35)] backdrop-blur`}
              >
                <div className="flex items-start gap-3">
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${tone.badge}`}>
                    <Icon size={17} />
                  </span>
                  <p className="pt-1 text-sm font-medium leading-snug text-night">{i.message}</p>
                </div>
                <button
                  type="button"
                  onClick={() => remove(i.id)}
                  aria-label="Dismiss notification"
                  className="absolute right-2 top-2 rounded-md p-1 text-night/35 transition-colors hover:bg-cream hover:text-night"
                >
                  <X size={14} />
                </button>
                <motion.span
                  initial={{ scaleX: 1 }}
                  animate={{ scaleX: 0 }}
                  transition={{ duration: TOAST_MS / 1000, ease: 'linear' }}
                  className={`absolute bottom-0 left-0 h-0.5 w-full origin-left ${tone.bar}`}
                />
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  )
}
