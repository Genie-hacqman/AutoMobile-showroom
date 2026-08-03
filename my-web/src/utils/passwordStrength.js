export const PASSWORD_RULES = [
  { id: 'length', label: 'At least 8 characters', test: (value) => value.length >= 8 },
  { id: 'lower', label: 'A lowercase letter', test: (value) => /[a-z]/.test(value) },
  { id: 'upper', label: 'An uppercase letter', test: (value) => /[A-Z]/.test(value) },
  { id: 'number', label: 'A number', test: (value) => /\d/.test(value) },
  { id: 'special', label: 'A special character', test: (value) => /[^A-Za-z0-9]/.test(value) },
];

const LABELS = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'];
const COLORS = ['bg-rose-500', 'bg-orange-500', 'bg-amber-500', 'bg-lime-500', 'bg-emerald-600'];

export function evaluatePassword(password = '') {
  const passed = PASSWORD_RULES.filter((rule) => rule.test(password));
  const score = password ? passed.length : 0;
  const index = Math.max(0, Math.min(LABELS.length - 1, score - 1));

  return {
    score,
    total: PASSWORD_RULES.length,
    percentage: Math.round((score / PASSWORD_RULES.length) * 100),
    label: password ? LABELS[index] : 'Enter a password',
    barClass: password ? COLORS[index] : 'bg-slate-200',
    isValid: score === PASSWORD_RULES.length,
    rules: PASSWORD_RULES.map((rule) => ({ ...rule, satisfied: rule.test(password) })),
  };
}

export default evaluatePassword;
