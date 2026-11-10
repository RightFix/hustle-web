import type { Gig } from '../types'

export const collarStyles: Record<Gig['collar'], string> = {
  pink: 'bg-pink-500/15 text-pink-300 border-pink-500/30',
  gray: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
  blue: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  green: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
}

export const collarLabels: Record<Gig['collar'], string> = {
  pink: 'Pink collar',
  gray: 'Gray collar',
  blue: 'Blue collar',
  green: 'Green collar',
}
