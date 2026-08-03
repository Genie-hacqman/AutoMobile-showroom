import { evaluatePassword } from '../../utils/passwordStrength';

export default function PasswordStrength({ password }) {
  const strength = evaluatePassword(password);

  return (
    <div className="grid gap-2" aria-live="polite">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full rounded-full transition-all duration-300 ${strength.barClass}`}
          style={{ width: `${strength.percentage}%` }}
        />
      </div>
      <span className="text-xs font-medium text-slate-600">{strength.label}</span>
      <ul className="grid gap-1 text-xs text-slate-500">
        {strength.rules.map((rule) => (
          <li key={rule.id} className={rule.satisfied ? 'text-emerald-600' : undefined}>
            {rule.satisfied ? '•' : '◦'} {rule.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
