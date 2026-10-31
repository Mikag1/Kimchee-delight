// Shared helpers — used across all pages
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt = (n, d = 2) => n == null ? '—' : Number(n).toLocaleString('en-PH', {minimumFractionDigits: d, maximumFractionDigits: d});
const peso = n => n == null ? '—' : '₱' + fmt(n);

const store = {
  get: (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
};

// Simple bar chart for dashboard trend
function barChart(el, rows) {   // rows: [{label, value, sample}]
  if (!rows.length) { el.innerHTML = '<div class="empty">No records yet.</div>'; return; }
  const max = Math.max(...rows.map(r => r.value || 0), 0.001);
  el.innerHTML = rows.map(r => `
    <div class="bar">
      <span>${r.value == null ? '—' : fmt(r.value * 1000, 0) + ' g'}</span>
      <i class="${r.sample ? 's' : ''}" style="height:${(r.value || 0) / max * 75}%"></i>
      <span>${esc(r.label)}</span>
    </div>`).join('');
}
function trendRows(list) {
  return list.map(r => ({label: r.business_date.slice(5), value: r.avg_meat_kg, sample: +r.is_sample === 1}));
}

// Toast notification
function toast(message, type = 'info') {
  const container = document.getElementById('toast-container') || (() => {
    const c = document.createElement('div');
    c.id = 'toast-container';
    c.className = 'toast';
    document.body.appendChild(c);
    return c;
  })();
  const el = document.createElement('div');
  el.className = `toast-inner ${type}`;
  el.textContent = message;
  container.appendChild(el);
  setTimeout(() => { el.style.animation = 'toast-in 0.2s reverse'; setTimeout(() => el.remove(), 200); }, 3000);
}

// Loading state for buttons
function setButtonLoading(btn, loading) {
  if (loading) {
    btn.dataset.originalHtml = btn.innerHTML;
    btn.innerHTML = `<?= $icons['loader'] ?? '<svg class="spin" width="16" height="16" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="30 30" stroke-linecap="round"></circle></svg>' ?>`;
    btn.disabled = true;
    btn.style.animation = 'spin 1s linear infinite';
  } else {
    btn.innerHTML = btn.dataset.originalHtml || '';
    btn.disabled = false;
    btn.style.animation = '';
  }
}

// Add spin animation
const style = document.createElement('style');
style.textContent = '@keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }';
document.head.appendChild(style);

(() => {
  const rail = document.getElementById('rail');
  const railToggle = document.getElementById('rail-toggle');
  const themeToggle = document.getElementById('theme-toggle');

  function readPreference(key) {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn(`Unable to read the ${key} preference.`, error);
      return null;
    }
  }

  function savePreference(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn(`Unable to save the ${key} preference.`, error);
      toast('Your browser blocked local storage; this preference will not be remembered.', 'error');
    }
  }

  if (rail && railToggle) {
    const isOpen = readPreference('rail-open') === 'true';
    if (isOpen) {
      document.body.classList.add('rail-open');
      railToggle.setAttribute('aria-expanded', 'true');
    }
    railToggle.addEventListener('click', () => {
      const open = document.body.classList.toggle('rail-open');
      railToggle.setAttribute('aria-expanded', String(open));
      savePreference('rail-open', String(open));
    });
  }

  if (themeToggle) {
    const applyTheme = theme => {
      const isLight = theme === 'light';
      document.documentElement.setAttribute('data-theme', isLight ? 'light' : 'dark');
      themeToggle.setAttribute('aria-pressed', String(!isLight));
      themeToggle.setAttribute('aria-label', `Switch to ${isLight ? 'dark' : 'light'} theme`);
    };

    applyTheme(readPreference('theme') === 'light' ? 'light' : 'dark');
    themeToggle.addEventListener('click', () => {
      const nextTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      applyTheme(nextTheme);
      savePreference('theme', nextTheme);
    });
  }

  const timeEl = document.getElementById('topbar-time');
  if (timeEl) {
    const updateTime = () => {
      timeEl.textContent = new Date().toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', hour12: false });
    };
    updateTime();
    setInterval(updateTime, 30000);
  }
})();