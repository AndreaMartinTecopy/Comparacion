// Interactive logic for isEazy Author Showcase & Benchmark

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initNavigation();
  initBenchmarkFilter();
  initGlobalSearch();
  initIdeationBoard();
  initInteractiveCounters();
});

// Theme switcher
function initThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle-btn');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const savedTheme = localStorage.getItem('iseazy-theme') || (prefersDark ? 'dark' : 'dark');

  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('iseazy-theme', next);
      updateThemeIcon(next);
    });
  }
}

function updateThemeIcon(theme) {
  const icon = document.getElementById('theme-icon');
  if (!icon) return;
  if (theme === 'dark') {
    // Sun icon for dark mode to switch to light
    icon.innerHTML = `<path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
  } else {
    // Moon icon for light mode
    icon.innerHTML = `<path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
}

// Active navigation highlight on scroll and click
function initNavigation() {
  const navLinks = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('.section-block');
  const mobileBtn = document.getElementById('mobile-menu-btn');
  const sidebar = document.querySelector('.sidebar');

  if (mobileBtn && sidebar) {
    mobileBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }

  // Smooth scroll
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        e.preventDefault();
        const el = document.querySelector(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          if (window.innerWidth <= 1024 && sidebar) {
            sidebar.classList.remove('open');
          }
        }
      }
    });
  });

  // Intersection observer for active state
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, { threshold: 0.25, rootMargin: "-80px 0px -50% 0px" });

  sections.forEach(s => observer.observe(s));
}

// Benchmark filtering
function initBenchmarkFilter() {
  const tabs = document.querySelectorAll('.cat-tab');
  const rows = document.querySelectorAll('.benchmark-table tbody tr');
  const diffOnlyCheckbox = document.getElementById('only-differentiators');

  function filterTable() {
    const activeTab = document.querySelector('.cat-tab.active')?.dataset.category || 'all';
    const showDiffOnly = diffOnlyCheckbox ? diffOnlyCheckbox.checked : false;

    rows.forEach(row => {
      const isHeader = row.classList.contains('table-cat-header');
      const rowCat = row.dataset.category;
      const hasExclusive = row.dataset.exclusive === 'true';

      let visible = true;

      // Category filter
      if (activeTab !== 'all' && rowCat !== activeTab) {
        visible = false;
      }

      // Exclusive / differentiator filter
      if (showDiffOnly && !hasExclusive && !isHeader) {
        visible = false;
      }

      // If category header, hide if not in category or if no children visible
      if (isHeader) {
        if (activeTab !== 'all' && rowCat !== activeTab) {
          visible = false;
        }
      }

      row.style.display = visible ? '' : 'none';
    });
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      filterTable();
    });
  });

  if (diffOnlyCheckbox) {
    diffOnlyCheckbox.addEventListener('change', filterTable);
  }
}

// Global quick search
function initGlobalSearch() {
  const searchInput = document.getElementById('global-search');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase().trim();
    const cards = document.querySelectorAll('.feature-card, .metric-card, .vs-card');
    const tableRows = document.querySelectorAll('.benchmark-table tbody tr:not(.table-cat-header)');

    if (!term) {
      cards.forEach(c => c.style.display = '');
      tableRows.forEach(r => r.style.display = '');
      return;
    }

    cards.forEach(card => {
      const text = card.textContent.toLowerCase();
      card.style.display = text.includes(term) ? '' : 'none';
    });

    tableRows.forEach(row => {
      const text = row.textContent.toLowerCase();
      row.style.display = text.includes(term) ? '' : 'none';
    });
  });
}

// Ideation Board (Casos de uso propios con LocalStorage)
const defaultIdeation = [
  { feature: "Curso Express", usecase: "Píldoras de 5 min sobre nuevas herramientas", priority: "Alta / Fácil", notes: "Muy rápido de maquetar sin menús" },
  { feature: "Imagen con Hotspots", usecase: "Onboarding (explicar partes del software)", priority: "Alta / Fácil", notes: "Experiencia visual interactiva atractiva" },
  { feature: "Generación de Juegos con IA", usecase: "Repaso de normativa interna (Rosco / Trivia)", priority: "Alta / Muy fácil", notes: "Ahorra semanas de programación frente a Storyline" },
  { feature: "Traducción automática IA", usecase: "Adaptar cursos a delegaciones internacionales", priority: "Media / Muy fácil", notes: "Mantiene toda la maquetación intacta" }
];

function initIdeationBoard() {
  const form = document.getElementById('add-idea-form');
  const tbody = document.getElementById('ideation-tbody');
  if (!tbody) return;

  let ideas = JSON.parse(localStorage.getItem('iseazy-ideation-list')) || defaultIdeation;

  function renderIdeas() {
    tbody.innerHTML = '';
    ideas.forEach((item, index) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${escapeHtml(item.feature)}</strong></td>
        <td>${escapeHtml(item.usecase)}</td>
        <td><span class="pill-tag">${escapeHtml(item.priority)}</span></td>
        <td>${escapeHtml(item.notes)}</td>
        <td style="text-align: right;">
          <button class="delete-btn" data-index="${index}" title="Eliminar idea">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Attach delete handlers
    tbody.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index, 10);
        ideas.splice(idx, 1);
        localStorage.setItem('iseazy-ideation-list', JSON.stringify(ideas));
        renderIdeas();
      });
    });
  }

  renderIdeas();

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const featInput = document.getElementById('idea-feature');
      const useInput = document.getElementById('idea-usecase');
      const prioSelect = document.getElementById('idea-priority');
      const notesInput = document.getElementById('idea-notes');

      if (!featInput.value.trim() || !useInput.value.trim()) return;

      ideas.push({
        feature: featInput.value.trim(),
        usecase: useInput.value.trim(),
        priority: prioSelect.value,
        notes: notesInput.value.trim() || '—'
      });

      localStorage.setItem('iseazy-ideation-list', JSON.stringify(ideas));
      renderIdeas();

      featInput.value = '';
      useInput.value = '';
      notesInput.value = '';
    });
  }
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
}

// Quick animated counters
function initInteractiveCounters() {
  const counters = document.querySelectorAll('.counter-val');
  counters.forEach(c => {
    const target = parseFloat(c.getAttribute('data-target'));
    const isDecimal = c.getAttribute('data-target').includes('.');
    let count = 0;
    const speed = 25;
    const inc = target / 30;

    const timer = setInterval(() => {
      count += inc;
      if (count >= target) {
        c.innerText = isDecimal ? target.toFixed(1) : target;
        clearInterval(timer);
      } else {
        c.innerText = isDecimal ? count.toFixed(1) : Math.ceil(count);
      }
    }, speed);
  });
}
