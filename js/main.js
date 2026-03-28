// ─── KLAVIYO CONFIG ────────────────────────────────────────
const KLAVIYO_PUBLIC_KEY = 'V6AfDG';
const KLAVIYO_LIST_ID = 'U7gFtU';

// ─── TOP BAR ───────────────────────────────────────────────
function closeTopBar() {
  const bar = document.getElementById('top-bar');
  bar.style.display = 'none';
  document.querySelector('nav').style.top = '0px';
  sessionStorage.setItem('topBarClosed', '1');
}

if (sessionStorage.getItem('topBarClosed')) {
  const bar = document.getElementById('top-bar');
  if (bar) {
    bar.style.display = 'none';
    document.querySelector('nav').style.top = '0px';
  }
}

// ─── SCROLL REVEAL ─────────────────────────────────────────
const revealObserver = new IntersectionObserver(
  (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); }),
  { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
);
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ─── NAV SCROLL SPY ────────────────────────────────────────
const spySections = ['how', 'reviews', 'pricing', 'security', 'waitlist'];

function updateActiveTab() {
  const scrollY = window.scrollY + 100;
  let current = null;
  spySections.forEach(id => {
    const el = document.getElementById(id);
    if (el && el.offsetTop <= scrollY) current = id;
  });
  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
  if (current) {
    const activeLink = document.querySelector(`.nav-links a[href="#${current}"]`);
    if (activeLink) activeLink.classList.add('active');
  }
}

window.addEventListener('scroll', () => {
  updateActiveTab();
  document.querySelector('nav').style.height = window.scrollY > 40 ? '56px' : '64px';
}, { passive: true });

updateActiveTab();

// ─── EMAIL SIGNUP ──────────────────────────────────────────
const signupConfig = {
  hero:   { input: 'hero-email',   success: 'hero-success' },
  mid:    { input: 'mid-email',    success: 'mid-success' },
  bottom: { input: 'bottom-email', success: 'bottom-success' },
};

function signup(src) {
  const { input, success } = signupConfig[src];
  const inp = document.getElementById(input);
  const email = inp.value.trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    inp.style.borderColor = '#ef4444';
    inp.style.boxShadow = '0 0 0 3px rgba(239,68,68,0.12)';
    inp.focus();
    setTimeout(() => { inp.style.borderColor = ''; inp.style.boxShadow = ''; }, 1400);
    return;
  }

  // Optimistically show success
  document.getElementById(success).style.display = 'block';
  const form = inp.closest('.form-wrap, .mid-form, .cta-form');
  if (form) { form.style.opacity = '0.4'; form.style.pointerEvents = 'none'; }

  submitToKlaviyo(email, src);
}

async function submitToKlaviyo(email, source) {
  try {
    const res = await fetch(
      `https://a.klaviyo.com/client/subscriptions/?company_id=${KLAVIYO_PUBLIC_KEY}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'revision': '2023-12-15' },
        body: JSON.stringify({
          data: {
            type: 'subscription',
            attributes: {
              profile: {
                data: {
                  type: 'profile',
                  attributes: { email: email },
                },
              },
            },
            relationships: {
              list: {
                data: { type: 'list', id: KLAVIYO_LIST_ID },
              },
            },
          },
        }),
      }
    );
    if (!res.ok) console.error('Klaviyo error:', res.status, await res.text());
  } catch (err) {
    console.error('Klaviyo submit failed:', err);
  }
}

// ─── PRICING BUTTONS ───────────────────────────────────────
function scrollToWaitlist() {
  document.getElementById('waitlist').scrollIntoView({ behavior: 'smooth' });
}
