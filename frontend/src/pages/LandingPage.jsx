import { BriefcaseBusiness, Users } from 'lucide-react';
import { copyDemo } from '../utils/helpers';
import { useNavigate } from '../router';

export default function LandingPage({ onDemoLogin }) {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="landing-logo">
          <span>in</span>
          <b>gage</b>
        </div>

        <nav className="landing-nav">
          <button onClick={() => navigate('/login')}>Login</button>
          <button className="register-btn" onClick={() => navigate('/login')}>
            Register
          </button>
        </nav>
      </header>

      <section className="landing-hero">
        <h1>
          Welcome to <span>Ingage</span>
        </h1>

        <h2>Project Management Software</h2>
        <h2>built for</h2>
        <div className="hero-highlight">productive teams</div>

        <div className="hero-buttons">
          <button className="hero-primary" onClick={() => navigate('/login')}>
            Get Started
          </button>
          <button
            className="hero-secondary"
            onClick={() => {
              document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Learn More
          </button>
        </div>
      </section>

      <section className="landing-features" id="features">
        <h2>Everything you need to manage your team</h2>
        <p>Simple tools for task tracking, teamwork, and productivity.</p>

        <div className="feature-grid">
          <article>
            <div className="feature-icon">◷</div>
            <h3>Smart Task Tracking</h3>
            <p>Track task status, deadlines, and work progress in one place.</p>
          </article>

          <article>
            <div className="feature-icon">♧</div>
            <h3>Team Management</h3>
            <p>Assign tasks and manage employee responsibilities.</p>
          </article>

          <article>
            <div className="feature-icon">▤</div>
            <h3>Project Management</h3>
            <p>Organize projects and monitor team performance.</p>
          </article>
        </div>
      </section>

      <section className="try-taskflow" aria-labelledby="try-taskflow-title">
        <div className="try-taskflow-heading">
          <span className="eyebrow">TRY TASKFLOW</span>
          <h2 id="try-taskflow-title">Explore the workspace</h2>
          <p>Use the demo accounts to explore manager and employee views.</p>
        </div>
        <div className="demo-account-grid">
          <article className="demo-account-card">
            <div className="demo-role-icon">
              <Users size={20} />
            </div>
            <h3>Manager demo</h3>
            <p>Assign tasks, manage projects, and review team progress.</p>
            <div className="demo-credential">
              <span>Email</span>
              <code>manager@taskflow.local</code>
              <button type="button" onClick={() => copyDemo('manager@taskflow.local')}>
                Copy
              </button>
            </div>
            <div className="demo-credential">
              <span>Password</span>
              <code>Manager@123</code>
              <button type="button" onClick={() => copyDemo('Manager@123')}>
                Copy
              </button>
            </div>
            <button
              className="demo-use-button"
              onClick={() => onDemoLogin('manager')}
            >
              Use manager login
            </button>
          </article>
          <article className="demo-account-card">
            <div className="demo-role-icon">
              <BriefcaseBusiness size={20} />
            </div>
            <h3>Employee demo</h3>
            <p>View assigned tasks and update your work progress.</p>
            <div className="demo-credential">
              <span>Email</span>
              <code>arun@taskflow.local</code>
              <button type="button" onClick={() => copyDemo('arun@taskflow.local')}>
                Copy
              </button>
            </div>
            <div className="demo-credential">
              <span>Password</span>
              <code>Employee@123</code>
              <button type="button" onClick={() => copyDemo('Employee@123')}>
                Copy
              </button>
            </div>
            <button
              className="demo-use-button"
              onClick={() => onDemoLogin('employee')}
            >
              Use employee login
            </button>
          </article>
        </div>
        <p className="demo-note">
          Demo credentials work only if these accounts exist in your backend database.
        </p>
      </section>
      <footer className="landing-footer">TaskFlow · Make teamwork flow.</footer>
    </div>
  );
}
