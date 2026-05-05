// pages/index.jsx
import { useEffect, useRef, useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from './_app';
import styles from '../styles/Home.module.css';

// smooth scroll to a section by id using the scroll-behavior css property
function scrollTo(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// password strength score based on length and character variety
function getStrength(pw) {
  if (!pw) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pw.length >= 8)           score++;
  if (pw.length >= 12)          score++;
  if (/[A-Z]/.test(pw))        score++;
  if (/[a-z]/.test(pw))        score++;
  if (/[0-9]/.test(pw))        score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 2) return { score, label: 'Weak',   color: '#c0392b' };
  if (score <= 4) return { score, label: 'Fair',   color: '#e67e22' };
  if (score <= 5) return { score, label: 'Good',   color: '#2980b9' };
  return            { score, label: 'Strong', color: '#2d6a4f' };
}

// client-side validation mirrors the server-side rules in lib/validate.js
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validateForm(tab, form) {
  const errs = {};
  if (tab === 'register') {
    const u = form.username.trim();
    if (u.length < 3)
      errs.username = 'Username must be at least 3 characters.';
    else if (u.length > 30)
      errs.username = 'Username must be 30 characters or fewer.';
    else if (!/^[a-zA-Z0-9_-]+$/.test(u))
      errs.username = 'Only letters, numbers, _ and - are allowed.';
  }
  if (!EMAIL_RE.test(form.email.trim()))
    errs.email = 'Please enter a valid email address.';
  if (!form.password)
    errs.password = 'Password is required.';
  else if (tab === 'register') {
    if (form.password.length < 8)
      errs.password = 'Password must be at least 8 characters.';
    else if (!/[A-Z]/.test(form.password))
      errs.password = 'Add at least one uppercase letter.';
    else if (!/[a-z]/.test(form.password))
      errs.password = 'Add at least one lowercase letter.';
    else if (!/[0-9]/.test(form.password))
      errs.password = 'Add at least one number.';
    else if (!/[^A-Za-z0-9]/.test(form.password))
      errs.password = 'Add at least one special character.';
  }
  return errs;
}

// navbar becomes frosted-glass white after scrolling 40px
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();
  const router   = useRouter();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const nav = (e, id) => { e.preventDefault(); scrollTo(id); };

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.navScrolled : ''}`}>
      <div className={styles.navInner}>
        <div className={styles.navLogo}>
          <span className={styles.navLogoMark}>F</span>
          <span className={styles.navLogoText}>FinTrack</span>
        </div>
        <div className={styles.navLinks}>
          <a href="#features"     onClick={e => nav(e, 'features')}     className={styles.navLink}>Features</a>
          <a href="#how-it-works" onClick={e => nav(e, 'how-it-works')} className={styles.navLink}>How it works</a>
          <a href="#signin"       onClick={e => nav(e, 'signin')}       className={styles.navLink}>Sign in</a>
        </div>
        <div className={styles.navActions}>
          {user ? (
            <button className={styles.navCta} onClick={() => router.push('/dashboard')}>
              Go to Dashboard
            </button>
          ) : (
            <>
              <a href="#signin" onClick={e => nav(e, 'signin')} className={styles.navSignIn}>Sign in</a>
              <a href="#signin" onClick={e => nav(e, 'signin')} className={styles.navCta}>Get started</a>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

// hero background moves at 38% of scroll speed creating the parallax effect
function Hero() {
  const bgRef = useRef(null);

  useEffect(() => {
    let ticking = false;
    const fn = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (bgRef.current)
            bgRef.current.style.transform = `translateY(${window.scrollY * 0.38}px)`;
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const nav = (e, id) => { e.preventDefault(); scrollTo(id); };

  return (
    <section className={styles.hero}>
      <div className={styles.heroBg} ref={bgRef}>
        <div className={styles.heroBgOrb1} />
        <div className={styles.heroBgOrb2} />
        <div className={styles.heroBgGrid} />
      </div>

      <div className={styles.heroContent}>
        <div className={styles.heroPill}>Personal Finance, Simplified</div>
        <h1 className={styles.heroTitle}>
          Your money,<br />
          <em>finally clear.</em>
        </h1>
        <p className={styles.heroSub}>
          Track every penny, understand every pattern, and make every decision
          with confidence. FinTrack gives you the clarity your finances deserve.
        </p>
        <div className={styles.heroActions}>
          <a href="#signin"   onClick={e => nav(e, 'signin')}   className={styles.heroCtaPrimary}>Start tracking free</a>
          <a href="#features" onClick={e => nav(e, 'features')} className={styles.heroCtaSecondary}>See how it works</a>
        </div>

        {/* decorative stat cards that float with css animation */}
        <div className={styles.heroCards}>
          <div className={`${styles.floatCard} ${styles.floatCard1}`}>
            <span className={styles.floatCardLabel}>This month</span>
            <span className={styles.floatCardValue} style={{ color: 'var(--green)' }}>+£2,840</span>
            <span className={styles.floatCardSub}>Income</span>
          </div>
          <div className={`${styles.floatCard} ${styles.floatCard2}`}>
            <span className={styles.floatCardLabel}>Savings rate</span>
            <span className={styles.floatCardValue}>34%</span>
            <span className={styles.floatCardSub}>Up 4% vs last month</span>
          </div>
          <div className={`${styles.floatCard} ${styles.floatCard3}`}>
            <span className={styles.floatCardLabel}>Top category</span>
            <span className={styles.floatCardValue} style={{ fontSize: 18 }}>Food</span>
            <span className={styles.floatCardSub}>£340 spent</span>
          </div>
        </div>
      </div>

      <div className={styles.heroScroll}>
        <span>Scroll to explore</span>
        <div className={styles.scrollLine} />
      </div>
    </section>
  );
}

const FEATURES = [
  { icon: 'D', title: 'Real-time dashboard',  desc: 'See your income, expenses, and balance at a glance. No spreadsheets, no confusion.' },
  { icon: 'T', title: 'Transaction tracking',  desc: 'Add, edit, and delete transactions in seconds. Every pound accounted for.' },
  { icon: 'A', title: 'Spending analytics',    desc: 'Visual charts break down exactly where your money goes, category by category.' },
  { icon: 'S', title: 'Secure by default',     desc: 'Passwords are hashed with bcrypt. Sessions are protected. Your data stays yours.' },
];

function Features() {
  return (
    <section className={styles.features} id="features">
      <div className={styles.sectionInner}>
        <div className={styles.sectionLabel}>What you get</div>
        <h2 className={styles.sectionTitle}>Everything you need,<br />nothing you don&apos;t.</h2>
        <div className={styles.featureGrid}>
          {FEATURES.map((f, i) => (
            <div className={styles.featureCard} key={i}>
              <div className={styles.featureIconBox}>{f.icon}</div>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  { num: '01', title: 'Create your account',    desc: 'Sign up with a username and email in under a minute.' },
  { num: '02', title: 'Log your transactions',  desc: 'Add income and expenses with a category and date.' },
  { num: '03', title: 'Watch insights appear',  desc: 'Charts and summaries update instantly as you add data.' },
];

function HowItWorks() {
  return (
    <section className={styles.howItWorks} id="how-it-works">
      <div className={styles.sectionInner}>
        <div className={styles.sectionLabel}>Getting started</div>
        <h2 className={styles.sectionTitle}>Up and running<br />in 3 steps.</h2>
        <div className={styles.steps}>
          {STEPS.map((s, i) => (
            <div className={styles.step} key={i}>
              <div className={styles.stepNum}>{s.num}</div>
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>{s.title}</h3>
                <p className={styles.stepDesc}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// auth section contains both sign-in and register in the same card,
// switching between them without resizing the card
function AuthSection() {
  const [tab, setTab]         = useState('login');
  const [form, setForm]       = useState({ username: '', email: '', password: '' });
  const [fieldErrs, setFieldErrs] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);
  const { login }             = useAuth();
  const router                = useRouter();

  const strength = useMemo(() => getStrength(form.password), [form.password]);

  function setField(key, val) {
    setForm(f => ({ ...f, [key]: val }));
    // clear the per-field error as soon as the user starts correcting it
    setFieldErrs(e => ({ ...e, [key]: '' }));
    setServerError('');
  }

  function switchTab(t) {
    setTab(t);
    setFieldErrs({});
    setServerError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError('');

    const errs = validateForm(tab, form);
    if (Object.keys(errs).length > 0) {
      setFieldErrs(errs);
      return;
    }

    setLoading(true);

    const endpoint = tab === 'login' ? '/api/auth/login' : '/api/auth/register';
    const body     = tab === 'login'
      ? { email: form.email, password: form.password }
      : { username: form.username, email: form.email, password: form.password };

    try {
      const res  = await fetch(endpoint, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        setServerError(data.error || 'Something went wrong.');
        setLoading(false);
        return;
      }

      login(data.user);
      router.push('/dashboard');
    } catch {
      // a catch here means the network request itself failed (server not running)
      setServerError('Could not reach the server. Please try again.');
      setLoading(false);
    }
  }

  const BULLETS = [
    'Track income and expenses in one place',
    'See spending breakdowns by category',
    'Visual monthly charts and trends',
    'Your data is private and secure',
  ];

  return (
    <section className={styles.authSection} id="signin">
      <div className={styles.authInner}>

        <div className={styles.authLeft}>
          <div className={styles.sectionLabel}>Join FinTrack</div>
          <h2 className={styles.authTitle}>Take control of<br />your finances today.</h2>
          <p className={styles.authSub}>Free to use. Start in under a minute.</p>
          <ul className={styles.authBullets}>
            {BULLETS.map(b => (
              <li key={b} className={styles.authBullet}>
                <span className={styles.bulletCheck}>+</span> {b}
              </li>
            ))}
          </ul>
        </div>

        {/* fixed-height card so the layout never shifts when switching tabs */}
        <div className={styles.authCard}>
          <div className={styles.authTabs}>
            <button
              type="button"
              className={`${styles.authTab} ${tab === 'login' ? styles.authTabActive : ''}`}
              onClick={() => switchTab('login')}
            >Sign in</button>
            <button
              type="button"
              className={`${styles.authTab} ${tab === 'register' ? styles.authTabActive : ''}`}
              onClick={() => switchTab('register')}
            >Create account</button>
          </div>

          {serverError && <div className={styles.authError}>{serverError}</div>}

          <form onSubmit={handleSubmit} className={styles.authForm} noValidate>

            {/* username field collapses via css when on the login tab */}
            <div className={`${styles.authField} ${tab !== 'register' ? styles.fieldHidden : ''}`}>
              <label>Username</label>
              <input
                type="text"
                placeholder="min. 3 characters"
                value={form.username}
                onChange={e => setField('username', e.target.value)}
                required={tab === 'register'}
                tabIndex={tab !== 'register' ? -1 : 0}
                autoComplete="username"
              />
              {fieldErrs.username && <span className={styles.fieldErr}>{fieldErrs.username}</span>}
            </div>

            <div className={styles.authField}>
              <label>Email</label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setField('email', e.target.value)}
                autoComplete="email"
              />
              {fieldErrs.email && <span className={styles.fieldErr}>{fieldErrs.email}</span>}
            </div>

            <div className={styles.authField}>
              <label>Password</label>
              {/* wrapper positions the show/hide toggle button inside the input */}
              <div className={styles.pwWrap}>
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  placeholder="min. 8 characters"
                  value={form.password}
                  onChange={e => setField('password', e.target.value)}
                  autoComplete={tab === 'register' ? 'new-password' : 'current-password'}
                />
                <button
                  type="button"
                  className={styles.pwToggle}
                  onClick={() => setShowPw(v => !v)}
                  tabIndex={-1}
                >
                  {showPw ? 'hide' : 'show'}
                </button>
              </div>
              {fieldErrs.password && <span className={styles.fieldErr}>{fieldErrs.password}</span>}

              {/* strength meter only shows when creating an account */}
              {tab === 'register' && form.password && (
                <div className={styles.strengthWrap}>
                  <div className={styles.strengthBar}>
                    {[1, 2, 3, 4].map(i => (
                      <div
                        key={i}
                        className={styles.strengthSeg}
                        style={{
                          background: i <= Math.ceil(strength.score / 1.5)
                            ? strength.color
                            : 'var(--border)',
                        }}
                      />
                    ))}
                  </div>
                  <span className={styles.strengthLabel} style={{ color: strength.color }}>
                    {strength.label}
                  </span>
                </div>
              )}
            </div>

            <button type="submit" className={styles.authSubmit} disabled={loading}>
              {loading
                ? 'Please wait...'
                : tab === 'login'
                  ? 'Sign in to FinTrack'
                  : 'Create my account'}
            </button>

          </form>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerLogo}>
          <span className={styles.navLogoMark}>F</span>
          <span className={styles.navLogoText}>FinTrack</span>
        </div>
        <p className={styles.footerText}>DG1IAD Portfolio 3 — ONCAMPUS Aston</p>
      </div>
    </footer>
  );
}

export default function Home() {
  const { user } = useAuth();
  const router   = useRouter();

  // redirect to dashboard if already logged in
  useEffect(() => { if (user) router.push('/dashboard'); }, [user]);
  if (user) return null;

  return (
    <div className={styles.page}>
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <AuthSection />
      <Footer />
    </div>
  );
}
