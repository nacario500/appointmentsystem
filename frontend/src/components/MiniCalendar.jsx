import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { fmtDate } from '../lib/api'

const pad = (n) => String(n).padStart(2, '0')
const keyFor = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`

export default function MiniCalendar({ marked = [], counts = {} }) {
  const [cur, setCur] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1) })
  const [selected, setSelected] = useState(null)
  const [dir, setDir] = useState(1)

  const y = cur.getFullYear(), m = cur.getMonth()
  const first = new Date(y, m, 1).getDay()
  const days = new Date(y, m + 1, 0).getDate()
  const markedSet = useMemo(() => new Set(marked.map((d) => String(d).slice(0, 10))), [marked])
  const todayStr = keyFor(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())
  const cells = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)]
  const selectedCount = selected ? Number(counts[selected] ?? (markedSet.has(selected) ? 1 : 0)) : 0

  const shift = (delta) => {
    setDir(delta)
    setCur(new Date(y, m + delta, 1))
    setSelected(null)
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button aria-label="Previous month" onClick={() => shift(-1)} className="rounded-lg p-1.5 text-night/50 transition-colors hover:bg-cream hover:text-night active:scale-90">
          <ChevronLeft size={18} />
        </button>
        <AnimatePresence mode="wait" initial={false}>
          <motion.p key={`${y}-${m}`} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }} className="text-sm font-semibold">
            {cur.toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })}
          </motion.p>
        </AnimatePresence>
        <button aria-label="Next month" onClick={() => shift(1)} className="rounded-lg p-1.5 text-night/50 transition-colors hover:bg-cream hover:text-night active:scale-90">
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-wide text-night/35">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => <div key={d} className="py-1">{d}</div>)}
      </div>

      <AnimatePresence mode="wait" initial={false} custom={dir}>
        <motion.div
          key={`${y}-${m}`}
          custom={dir}
          initial={{ opacity: 0, x: dir * 18 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: dir * -18 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="grid grid-cols-7 gap-1"
        >
          {cells.map((d, i) => {
            if (d === null) return <div key={`empty-${i}`} />
            const k = keyFor(y, m, d)
            const isToday = k === todayStr
            const isSelected = k === selected
            const has = markedSet.has(k)
            const future = k >= todayStr
            return (
              <motion.button
                type="button"
                key={k}
                onClick={() => setSelected(isSelected ? null : k)}
                whileTap={{ scale: 0.9 }}
                className={`relative rounded-lg py-2 text-sm transition-colors duration-150 ${
                  isSelected ? 'bg-night font-semibold text-white shadow-sm'
                  : isToday ? 'bg-accent/15 font-bold text-accent-dark hover:bg-accent/25'
                  : future ? 'text-night/75 hover:bg-cream hover:text-night'
                  : 'text-night/35 hover:bg-cream'
                }`}
                aria-label={`${fmtDate(k)}${has ? ', has appointments' : ''}`}
                aria-pressed={isSelected}
              >
                {d}
                {has && <span className={`absolute bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full ${isSelected ? 'bg-accent' : isToday ? 'bg-accent-dark' : 'bg-accent'}`} />}
              </motion.button>
            )
          })}
        </motion.div>
      </AnimatePresence>

      <div className="mt-3">
        <AnimatePresence mode="wait" initial={false}>
          {selected ? (
            <motion.div
              key={selected}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="flex items-center justify-between gap-3 rounded-xl border border-night/10 bg-cream/70 px-3 py-2.5"
            >
              <div>
                <p className="text-xs font-semibold">{fmtDate(selected)}</p>
                <p className="text-[11px] text-night/50">{selectedCount ? `${selectedCount} appointment${selectedCount === 1 ? '' : 's'}` : 'No appointments'}</p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${selectedCount ? 'bg-accent/15 text-accent-dark' : 'bg-white text-night/45'}`}>
                {selectedCount ? 'Booked' : 'Open'}
              </span>
            </motion.div>
          ) : (
            <motion.p key="legend" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2 text-[11px] text-night/45">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Select a date to see activity
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
