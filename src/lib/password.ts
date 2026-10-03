export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

type Rule = { label: string; test: (p: string, email: string) => boolean }
export const RULES: Rule[] = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'An uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'A lowercase letter', test: (p) => /[a-z]/.test(p) },
  { label: 'A number', test: (p) => /\d/.test(p) },
  { label: 'A symbol, like ! or #', test: (p) => /[^A-Za-z0-9\s]/.test(p) },
  { label: 'No spaces', test: (p) => !/\s/.test(p) },
  {
    label: 'Not part of your email name',
    test: (p, e) => {
      const n = e.split('@')[0].toLowerCase()
      return n.length < 3 || !p.toLowerCase().includes(n)
    },
  },
  { label: 'Not a common password', test: (p) => !/password|12345|qwerty|letmein|iloveyou/i.test(p) },
]

export const STRENGTH = ['too weak', 'weak', 'fair', 'good', 'strong']
/** 0..4 from the number of rules met */
export const level = (met: number) => (met === RULES.length ? 4 : met >= 6 ? 3 : met >= 4 ? 2 : met >= 1 ? 1 : 0)
