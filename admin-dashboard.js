/* ===================================================
   dashboard.js — Stackly Zero Waste Dashboard
   Handles: sidebar toggle, user dropdown, charts,
            KPI counter animations, date, toast, logout
   =================================================== */

(function () {
  'use strict';

  /* ── Element references ─────────────────────────── */
  const sidebar        = document.getElementById('sidebar');
  const overlay        = document.getElementById('sidebar-overlay');
  const menuToggle     = document.getElementById('menu-toggle');
  const sidebarClose   = document.getElementById('sidebar-close');
  const userMenuBtn    = document.getElementById('user-menu-btn');
  const userDropdown   = document.getElementById('user-dropdown');
  const topbarAvatar   = document.getElementById('topbar-avatar');
  const sidebarLogout  = document.getElementById('sidebar-logout-btn');

  /* ── Sidebar open / close ───────────────────────── */
  function openSidebar() {
    if (!sidebar) return;
    sidebar.classList.add('mobile-open');
    if (overlay) overlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // prevent background scroll
  }

  function closeSidebar() {
    if (!sidebar) return;
    sidebar.classList.remove('mobile-open');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      if (sidebar && sidebar.classList.contains('mobile-open')) {
        closeSidebar();
      } else {
        openSidebar();
      }
    });
  }

  if (sidebarClose) {
    sidebarClose.addEventListener('click', closeSidebar);
  }

  if (overlay) {
    overlay.addEventListener('click', closeSidebar);
  }

  // Close sidebar on ESC key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeSidebar();
      closeDropdown();
    }
  });

  /* ── User dropdown ──────────────────────────────── */
  function openDropdown() {
    if (userDropdown) userDropdown.hidden = false;
  }

  function closeDropdown() {
    if (userDropdown) userDropdown.hidden = true;
  }

  function toggleDropdown() {
    if (!userDropdown) return;
    userDropdown.hidden ? openDropdown() : closeDropdown();
  }

  if (userMenuBtn) {
    userMenuBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleDropdown();
    });
  }

  if (topbarAvatar) {
    topbarAvatar.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleDropdown();
    });
  }

  // Close dropdown when clicking outside
  document.addEventListener('click', function () {
    closeDropdown();
  });

  if (userDropdown) {
    userDropdown.addEventListener('click', function (e) {
      e.stopPropagation(); // keep open when clicking inside
    });
  }

  /* ── Logout (all logout buttons) ───────────────── */
  function doLogout(e) {
    if (e) e.preventDefault();
    localStorage.removeItem('stackly_current_user');
    window.location.href = 'login.html';
  }

  // Dropdown logout button
  const dropdownLogout = document.getElementById('logout-btn');
  if (dropdownLogout) {
    dropdownLogout.addEventListener('click', doLogout);
  }

  // Sidebar footer logout button
  if (sidebarLogout) {
    sidebarLogout.addEventListener('click', doLogout);
  }

  /* ── Date in topbar ─────────────────────────────── */
  const topbarDate = document.getElementById('topbar-date');
  if (topbarDate) {
    const now = new Date();
    topbarDate.textContent = now.toLocaleDateString('en-GB', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  }

  /* ── Dynamic greeting ───────────────────────────── */
  const greetingEl = document.getElementById('welcome-greeting');
  if (greetingEl) {
    const hour = new Date().getHours();
    const greeting =
      hour < 12 ? 'Good Morning ☀️' :
      hour < 17 ? 'Good Afternoon 🌤️' :
                  'Good Evening 🌙';
    greetingEl.textContent = greeting;
  }

  /* ── Goals month label ──────────────────────────── */
  const goalsMonth = document.getElementById('goals-month');
  if (goalsMonth) {
    goalsMonth.textContent = new Date().toLocaleDateString('en-GB', {
      month: 'short', year: 'numeric'
    });
  }

  /* ── KPI counter animation ──────────────────────── */
  function animateCounters() {
    const els = document.querySelectorAll('.kpi-value[data-count]');
    els.forEach(function (el) {
      const target  = parseInt(el.dataset.count, 10);
      const suffix  = el.dataset.suffix || '';
      const duration = 1200; // ms
      const startTime = performance.now();

      function step(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  /* ── Bar chart ──────────────────────────────────── */
  const barData = [
    { label: 'Mon', compost: 72, biogas: 40, landfill: 8  },
    { label: 'Tue', compost: 85, biogas: 55, landfill: 10 },
    { label: 'Wed', compost: 60, biogas: 38, landfill: 6  },
    { label: 'Thu', compost: 90, biogas: 62, landfill: 12 },
    { label: 'Fri', compost: 78, biogas: 48, landfill: 9  },
    { label: 'Sat', compost: 55, biogas: 30, landfill: 4  },
    { label: 'Sun', compost: 68, biogas: 44, landfill: 7  },
  ];

  function buildBarChart() {
    const chart  = document.getElementById('bar-chart');
    const labels = document.getElementById('chart-x-labels');
    if (!chart || !labels) return;

    const maxVal = Math.max(...barData.map(d => d.compost + d.biogas + d.landfill));

    barData.forEach(function (d) {
      const total = d.compost + d.biogas + d.landfill;
      const pct   = (total / maxVal) * 100;

      const group = document.createElement('div');
      group.className = 'bar-group';

      const stack = document.createElement('div');
      stack.className = 'bar-stack';

      const compH  = Math.round((d.compost  / total) * pct) + '%';
      const biogasH = Math.round((d.biogas  / total) * pct) + '%';
      const landH  = Math.round((d.landfill / total) * pct) + '%';

      [
        { cls: 'green', h: compH  },
        { cls: 'teal',  h: biogasH },
        { cls: 'gray',  h: landH  },
      ].forEach(function (seg) {
        const bar = document.createElement('div');
        bar.className = 'bar-seg ' + seg.cls;
        bar.style.height = '0';
        stack.appendChild(bar);
        // Animate in
        setTimeout(function () { bar.style.height = seg.h; }, 100);
      });

      group.appendChild(stack);
      chart.appendChild(group);

      // X label
      const lbl = document.createElement('div');
      lbl.className = 'x-label';
      lbl.textContent = d.label;
      labels.appendChild(lbl);
    });
  }

  /* ── Nav link active state ──────────────────────── */
  const navLinks = document.querySelectorAll('.sidebar-link');
  navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      navLinks.forEach(function (l) { l.classList.remove('active'); });
      link.classList.add('active');
      // Update page title
      const titleEl = document.getElementById('page-title');
      if (titleEl) {
        const span = link.querySelector('span:not(.nav-icon):not(.nav-badge):not(.nav-dot)');
        if (span) titleEl.textContent = span.textContent;
      }
      // Close sidebar on mobile after nav
      if (window.innerWidth < 900) closeSidebar();
    });
  });

  /* ── Quick Action toast ─────────────────────────── */
  const toast = document.getElementById('toast');

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(function () { toast.classList.remove('show'); }, 3000);
  }

  const qaActions = {
    'qa-report'     : '📋 Generating your ESG report…',
    'qa-schedule'   : '📅 Opening pickup scheduler…',
    'qa-team'       : '👥 Opening team management…',
    'qa-compliance' : '✅ Running compliance check…',
    'qa-export'     : '📤 Exporting data…',
    'qa-support'    : '💬 Opening support chat…',
  };

  Object.keys(qaActions).forEach(function (id) {
    const btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener('click', function () {
        showToast(qaActions[id]);
      });
    }
  });

  /* ── Notification button ────────────────────────── */
  const notifBtn = document.getElementById('notif-btn');
  if (notifBtn) {
    notifBtn.addEventListener('click', function () {
      showToast('🔔 You have 3 unread notifications.');
    });
  }

  /* ── Init ───────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    animateCounters();
    buildBarChart();
  });

  // Also run if DOM already loaded (script at bottom of body)
  if (document.readyState !== 'loading') {
    animateCounters();
    buildBarChart();
  }

})();
