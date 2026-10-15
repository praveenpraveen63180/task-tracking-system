import {
  ArrowRight,
  BriefcaseBusiness,
  Check,
  Command,
  ShieldCheck,
  Users,
  X,
  Zap
} from 'lucide-react';
import Field from '../components/common/Field';

export default function LoginPage({
  email,
  setEmail,
  password,
  setPassword,
  role,
  setRole,
  onSubmit,
  error,
  busy
}) {
  return (
    <div className="login-screen">
      <section className="login-left">
        <div className="login-brand">
          <div className="brand-mark">
            <Command size={22} />
          </div>
          <b>
            taskflow<span>.</span>
          </b>
        </div>
        <div className="login-promo">
          <span className="promo-pill">
            <Zap size={13} /> WORK, IN GOOD FLOW
          </span>
          <h1>
            Make every day <span>count.</span>
          </h1>
          <p>
            Bring your team, projects, and priorities into one clear workspace. Less chasing,
            more meaningful progress.
          </p>
          <div className="promo-stats">
            <div>
              <b>One view</b>
              <span>for every priority</span>
            </div>
            <div>
              <b>Clear owners</b>
              <span>for every task</span>
            </div>
          </div>
        </div>
        <div className="floating-task">
          <span className="floating-check">
            <Check size={16} />
          </span>
          <span>
            <b>Work moving forward</b>
            <small>Progress, made visible</small>
          </span>
          <span className="tiny-avatar">TF</span>
        </div>
      </section>

      <section className="login-right">
        <div className="login-card">
          <div className="mobile-login-brand">
            <div className="brand-mark">
              <Command size={20} />
            </div>
            <b>
              taskflow<span>.</span>
            </b>
          </div>

          <div className="login-heading">
            <span className="eyebrow">WELCOME BACK</span>
            <h2>Sign in to your workspace</h2>
            <p>Choose your account type to continue.</p>
          </div>

          <div className="role-switch" role="group" aria-label="Account type">
            <button
              type="button"
              className={role === 'manager' ? 'selected' : ''}
              onClick={() => {
                setRole('manager');
                setEmail('manager@taskflow.local');
                setPassword('Manager@123');
              }}
            >
              <BriefcaseBusiness size={16} />
              Manager
            </button>
            <button
              type="button"
              className={role === 'employee' ? 'selected' : ''}
              onClick={() => {
                setRole('employee');
                setEmail('arun@taskflow.local');
                setPassword('Employee@123');
              }}
            >
              <Users size={16} />
              Team member
            </button>
          </div>

          <form onSubmit={onSubmit}>
            <Field label="Email address">
              <input
                required
                type="email"
                autoComplete="username"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </Field>
            <Field label="Password">
              <input
                required
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </Field>
            {error && (
              <div className="inline-error" role="alert">
                <X size={15} />
                {error}
              </div>
            )}
            <button className="btn btn-primary login-submit" disabled={busy}>
              {busy ? 'Signing in…' : 'Sign in'} <ArrowRight size={16} />
            </button>
          </form>

          <div className="login-footnote">
            <ShieldCheck size={14} /> Role-based access keeps each workspace private.
          </div>
        </div>
      </section>
    </div>
  );
}
