/**
 * Carsonak Portfolio - Interactive Behaviors
 * Includes: Theme toggler, project filtering, modal architecture viewer,
 * 3D card tilt, active navigation scroll-spy, and clipboard interactions.
 */

(function () {
  'use strict';

  // --- Project Data for Interactive Deep-Dive Modal ---
  const PROJECTS_DATA = {
    memviz: {
      number: '01',
      title: 'MemViz',
      subtitle: 'Time-Traveling 3D Memory Visualizer for Go',
      category: 'Systems & 3D WebGL',
      status: 'Live & Open Source',
      demoUrl: 'https://mem-viz-zeta.vercel.app',
      repoUrl: 'https://github.com/carsonak/MemViz',
      tags: ['Go 1.22+', 'Delve RPC', 'React', 'React Three Fiber', 'Three.js', 'WebGL', 'WebSockets', 'TypeScript', 'Zustand'],
      summary:
        'A real-time 3D memory visualization tool that steps through Go program execution and renders memory state changes dynamically in an interactive 3D WebGL space.',
      architecture: [
        {
          layer: 'Backend (Go)',
          desc: 'Orchestrates the Delve debugger via JSON-RPC. Captures stack frames, heap allocations, and pointer references at each step and broadcasts state diffs over WebSockets.'
        },
        {
          layer: 'Frontend (React & Three.js)',
          desc: 'Built with React Three Fiber and Zustand. Uses InstancedMesh rendering to draw thousands of memory blocks at a smooth 60–120 FPS.'
        },
        {
          layer: 'Deployment',
          desc: 'Static Vite frontend deployed on Cloudflare Pages / Vercel with dedicated backend WebSocket service.'
        }
      ],
      features: [
        {
          title: 'Time-Travel Debugging',
          text: 'Step forward and backward through Go code execution; older memory states smoothly fade into the Z-axis while current state stays at Z=0.'
        },
        {
          title: 'Dynamic Memory Folding',
          text: 'Vast address gaps between stack and heap addresses are mathematically folded and collapsed, keeping the scene navigable and compact.'
        },
        {
          title: 'Semantic Zoom (LOD)',
          text: 'Variable labels, memory values, and types dynamically adjust level of detail, hiding clutter as the camera pulls back.'
        },
        {
          title: 'Interactive Pointer Tracing',
          text: 'Hovering over any memory block renders 3D Bezier splines illustrating reference pointers and slice backing arrays.'
        }
      ],
      colorCoding: [
        { label: 'Stack Memory', color: '#3b82f6' },
        { label: 'Heap Memory', color: '#ef4444' },
        { label: 'Strings', color: '#10b981' },
        { label: 'Slices', color: '#f59e0b' }
      ]
    },
    guidely: {
      number: '02',
      title: 'Guidely',
      subtitle: 'AI-Powered Local Knowledge Assistant & RAG Engine',
      category: 'AI & Vector Search',
      status: 'Active Project',
      repoUrl: 'https://github.com/carsonak/guidely',
      tags: ['Python', 'FastAPI', 'React', 'Vite', 'Qdrant Vector DB', 'Gemini Embeddings', 'SQLite', 'Pytest', 'RAG'],
      summary:
        'A local document intelligence assistant and semantic search engine that ingests corporate documents, indexes them into Qdrant vector storage, and synthesizes grounded answers with verified citation cards.',
      architecture: [
        {
          layer: 'Document Ingestion & Chunking',
          desc: 'Multi-format parsers for PDF, Markdown, and TXT files feeding into a 750/1,000-token semantic sliding chunker.'
        },
        {
          layer: 'Embedding & Vector Storage',
          desc: 'Generates 768-dimensional Gemini embeddings stored and queried against a local persistent Qdrant vector database.'
        },
        {
          layer: 'Grounded Generation & Failover',
          desc: 'Top-k semantic retrieval pipeline feeding primary Gemini LLM with Groq failover backup. Strict citation matching ensures every claim links to validated source cards.'
        },
        {
          layer: 'Admin & Document Lifecycle',
          desc: 'FastAPI backend with SQLite database, 8-hour session token authentication, in-process index mutex lock, and metrics monitoring.'
        }
      ],
      features: [
        {
          title: '100% Verified Retrieval@3',
          text: 'Rigorous automated evaluation suite testing passage ranking, score thresholds (0.632+), and displayed-source precision.'
        },
        {
          title: 'Strict Grounded Citation Cards',
          text: 'Every LLM output is backed by clickable source cards linking directly to the filename, page/section, and exact snippet.'
        },
        {
          title: 'Smart Re-indexing Lifecycle',
          text: 'Checks content hashes to update metadata without wastefully regenerating unchanged document embeddings.'
        },
        {
          title: 'Full Privacy & Local Control',
          text: 'Session-only search history in browser memory; configuration-safe health metrics that never leak vectors or prompts.'
        }
      ]
    },
    'arena-alloc': {
      number: '03',
      title: 'Arena Allocator',
      subtitle: 'Deterministic Linear Memory Management in C',
      category: 'Low-Level Systems',
      status: 'Open Source',
      repoUrl: 'https://github.com/carsonak/arena-alloc',
      tags: ['C', 'Memory Management', 'Systems Programming', 'Data Structures', 'Performance'],
      summary:
        'A lightweight, high-performance arena (region-based) memory allocator in C designed to eliminate heap fragmentation and provide O(1) allocation speed.',
      architecture: [
        {
          layer: 'Linear Buffer Allocation',
          desc: 'Pre-allocates contiguous memory blocks; allocations simply advance an offset pointer with strict alignment guarantees.'
        },
        {
          layer: 'Bulk Deallocation',
          desc: 'Entire arenas or sub-regions are freed instantaneously by resetting the offset marker to zero, preventing memory leaks and fragment overhead.'
        }
      ],
      features: [
        {
          title: 'Zero Fragmentation',
          text: 'No dynamic free-list searching or split/coalesce overhead typical of traditional malloc/free.'
        },
        {
          title: 'Sub-nanosecond Allocations',
          text: 'Pointer bump operation executes in minimal CPU cycles with optimal cache locality.'
        },
        {
          title: 'Safe Scoped Lifetimes',
          text: 'Allows temporary scratch memory regions that are discarded en-masse after frame or request completion.'
        }
      ]
    }
  };

  // --- 1. Theme Toggle (Dark / Light) with Persistence ---
  function initTheme() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const storedTheme = localStorage.getItem('portfolio-theme');
    const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = storedTheme || (systemPrefersDark ? 'dark' : 'light');

    applyTheme(initialTheme);

    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
        localStorage.setItem('portfolio-theme', newTheme);
      });
    }

    // Listen for OS changes if no preference was manually saved
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('portfolio-theme')) {
          applyTheme(e.matches ? 'dark' : 'light');
        }
      });
    }
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
      const isDark = theme === 'dark';
      themeToggleBtn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
      themeToggleBtn.setAttribute('title', isDark ? 'Switch to light mode' : 'Switch to dark mode');
      const sunIcon = themeToggleBtn.querySelector('.theme-icon-sun');
      const moonIcon = themeToggleBtn.querySelector('.theme-icon-moon');
      if (sunIcon && moonIcon) {
        sunIcon.style.display = isDark ? 'block' : 'none';
        moonIcon.style.display = isDark ? 'none' : 'block';
      }
    }
  }

  // --- 2. Sticky Navbar with Blur & Scroll Shadow ---
  function initNavbar() {
    const navHeader = document.querySelector('.header-container');
    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('section[id]');
    const mobileMenuBtn = document.getElementById('mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-links');

    // Scroll shadow & elevation
    const onScroll = () => {
      const scrollY = window.scrollY;
      if (navHeader) {
        if (scrollY > 20) {
          navHeader.classList.add('scrolled');
        } else {
          navHeader.classList.remove('scrolled');
        }
      }

      // Scroll Spy
      let currentSection = '';
      sections.forEach((sec) => {
        const sectionTop = sec.offsetTop - 120;
        const sectionHeight = sec.offsetHeight;
        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
          currentSection = sec.getAttribute('id');
        }
      });

      navLinks.forEach((link) => {
        link.classList.remove('active');
        if (currentSection && link.getAttribute('href') === `#${currentSection}`) {
          link.classList.add('active');
        }
      });

      // Back to top visibility
      const backToTopBtn = document.getElementById('back-to-top');
      if (backToTopBtn) {
        if (scrollY > 500) {
          backToTopBtn.classList.add('visible');
        } else {
          backToTopBtn.classList.remove('visible');
        }
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Mobile Hamburger Toggle
    if (mobileMenuBtn && navMenu) {
      mobileMenuBtn.addEventListener('click', () => {
        const expanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
        mobileMenuBtn.setAttribute('aria-expanded', !expanded);
        navMenu.classList.toggle('open');
      });

      // Close menu on link click
      navLinks.forEach((link) => {
        link.addEventListener('click', () => {
          mobileMenuBtn.setAttribute('aria-expanded', 'false');
          navMenu.classList.remove('open');
        });
      });
    }

    // Back to top button click
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
      backToTopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  // --- 3. Project Filter Tabs ---
  function initProjectFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card[data-category]');

    if (!filterButtons.length) return;

    filterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const filter = btn.getAttribute('data-filter');

        filterButtons.forEach((b) => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        projectCards.forEach((card) => {
          const cardCategories = (card.getAttribute('data-category') || '').split(' ');
          const isMatch = filter === 'all' || cardCategories.includes(filter);

          if (isMatch) {
            card.style.display = 'flex';
            requestAnimationFrame(() => {
              card.style.opacity = '1';
              card.style.transform = 'translateY(0) scale(1)';
            });
          } else {
            card.style.opacity = '0';
            card.style.transform = 'translateY(12px) scale(0.98)';
            setTimeout(() => {
              if (card.style.opacity === '0') {
                card.style.display = 'none';
              }
            }, 250);
          }
        });
      });
    });
  }

  // --- 4. Interactive 3D Card Hover / Tilt Effect ---
  function initCardTilt() {
    // Only apply tilt for fine pointer devices (desktops)
    if (window.matchMedia('(pointer: coarse)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const cards = document.querySelectorAll('.project-card:not(.muted)');

    cards.forEach((card) => {
      let isHovered = false;

      card.addEventListener('mouseenter', () => {
        isHovered = true;
        card.style.transition = 'transform 0.1s ease-out, border-color 0.2s ease, box-shadow 0.2s ease';
      });

      card.addEventListener('mousemove', (e) => {
        if (!isHovered) return;
        const rect = card.getBoundingClientRect();
        const cardX = e.clientX - rect.left;
        const cardY = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const deltaX = (cardX - centerX) / centerX; // -1 to 1
        const deltaY = (cardY - centerY) / centerY; // -1 to 1

        const rotateX = deltaY * -4; // max 4 deg
        const rotateY = deltaX * 4;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
      });

      card.addEventListener('mouseleave', () => {
        isHovered = false;
        card.style.transition = 'transform 0.3s ease, border-color 0.2s ease, box-shadow 0.2s ease';
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
      });
    });
  }

  // --- 5. Interactive Project Details Modal ---
  function initProjectModal() {
    const modal = document.getElementById('project-modal');
    if (!modal) return;

    const modalBackdrop = modal.querySelector('.modal-backdrop');
    const closeBtn = modal.querySelector('.modal-close');
    const modalBody = modal.querySelector('.modal-body');
    const modalTriggerBtns = document.querySelectorAll('[data-open-modal]');
    let previousActiveElement = null;

    function openModal(projectId) {
      const data = PROJECTS_DATA[projectId];
      if (!data) return;

      previousActiveElement = document.activeElement;

      // Render content
      let html = `
        <div class="modal-project-header">
          <div class="modal-eyebrow-row">
            <span class="modal-num">${data.number}</span>
            <span class="modal-pill">${data.category}</span>
            <span class="modal-status">${data.status}</span>
          </div>
          <h2 class="modal-title">${data.title}</h2>
          <p class="modal-subtitle">${data.subtitle}</p>
        </div>

        <div class="modal-actions-bar">
          ${data.demoUrl ? `<a href="${data.demoUrl}" target="_blank" rel="noopener noreferrer" class="button primary">Live Demo ↗</a>` : ''}
          ${data.repoUrl ? `<a href="${data.repoUrl}" target="_blank" rel="noopener noreferrer" class="button secondary">GitHub Repository ↗</a>` : ''}
        </div>

        <div class="modal-section">
          <h3>Overview</h3>
          <p class="modal-desc">${data.summary}</p>
        </div>

        <div class="modal-section">
          <h3>Technologies & Stack</h3>
          <div class="project-tags modal-tags">
            ${data.tags.map((t) => `<span class="tag">${t}</span>`).join('')}
          </div>
        </div>

        ${
          data.architecture
            ? `
          <div class="modal-section">
            <h3>Architecture & Pipeline</h3>
            <div class="architecture-flow">
              ${data.architecture
                .map(
                  (step) => `
                <div class="arch-step">
                  <div class="arch-layer-name">${step.layer}</div>
                  <div class="arch-layer-desc">${step.desc}</div>
                </div>
              `
                )
                .join('')}
            </div>
          </div>
        `
            : ''
        }

        ${
          data.features
            ? `
          <div class="modal-section">
            <h3>Key Capabilities</h3>
            <div class="features-grid">
              ${data.features
                .map(
                  (f) => `
                <div class="feature-item">
                  <h4>${f.title}</h4>
                  <p>${f.text}</p>
                </div>
              `
                )
                .join('')}
            </div>
          </div>
        `
            : ''
        }

        ${
          data.colorCoding
            ? `
          <div class="modal-section">
            <h3>Memory Visualization Layout</h3>
            <div class="memory-legend">
              ${data.colorCoding
                .map(
                  (c) => `
                <div class="legend-item">
                  <span class="legend-swatch" style="background-color: ${c.color};"></span>
                  <span>${c.label}</span>
                </div>
              `
                )
                .join('')}
            </div>
          </div>
        `
            : ''
        }
      `;

      modalBody.innerHTML = html;
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';

      // Focus close button
      if (closeBtn) {
        closeBtn.focus();
      }
    }

    function closeModal() {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (previousActiveElement) {
        previousActiveElement.focus();
      }
    }

    modalTriggerBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const projectId = btn.getAttribute('data-open-modal');
        openModal(projectId);
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
      }
    });
  }

  // --- 6. Interactive Tech Stack Tabs in About Section ---
  function initSkillsExplorer() {
    const tabs = document.querySelectorAll('.skill-tab');
    const skillGroups = document.querySelectorAll('.skill-group');

    if (!tabs.length) return;

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const targetCategory = tab.getAttribute('data-skill-category');

        tabs.forEach((t) => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');

        skillGroups.forEach((group) => {
          const category = group.getAttribute('data-category');
          if (targetCategory === 'all' || category === targetCategory) {
            group.style.display = 'block';
          } else {
            group.style.display = 'none';
          }
        });
      });
    });
  }

  // --- 7. Click-to-Copy Email with Toast Feedback ---
  function initCopyContact() {
    const copyBtn = document.getElementById('copy-email-btn');
    const toast = document.getElementById('copy-toast');
    if (!copyBtn) return;

    const emailToCopy = copyBtn.getAttribute('data-copy') || 'kihara.carson@gmail.com';

    copyBtn.addEventListener('click', async () => {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(emailToCopy);
        } else {
          // Fallback
          const tempInput = document.createElement('input');
          tempInput.value = emailToCopy;
          document.body.appendChild(tempInput);
          tempInput.select();
          document.execCommand('copy');
          document.body.removeChild(tempInput);
        }

        // Show toast
        if (toast) {
          toast.textContent = `Copied ${emailToCopy} to clipboard!`;
          toast.classList.add('show');
          setTimeout(() => {
            toast.classList.remove('show');
          }, 3200);
        }

        const originalText = copyBtn.querySelector('.btn-text');
        if (originalText) {
          const prev = originalText.textContent;
          originalText.textContent = 'Copied!';
          setTimeout(() => {
            originalText.textContent = prev;
          }, 2000);
        }
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    });
  }

  // --- 8. Live Clock / Timezone in Contact Section ---
  function initLiveClock() {
    const clockEl = document.getElementById('local-clock');
    if (!clockEl) return;

    function updateTime() {
      // Kenya is East Africa Time (UTC+3)
      const options = {
        timeZone: 'Africa/Nairobi',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      };
      const formatter = new Intl.DateTimeFormat([], options);
      clockEl.textContent = `${formatter.format(new Date())} EAT (UTC+3)`;
    }

    updateTime();
    setInterval(updateTime, 1000);
  }

  // --- 9. Scroll Reveal Animations ---
  function initScrollReveal() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    if (!revealElements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    revealElements.forEach((el) => observer.observe(el));
  }

  // --- Initialization on DOM Ready ---
  document.addEventListener('DOMContentLoaded', () => {
    // Current year
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    initTheme();
    initNavbar();
    initProjectFilters();
    initCardTilt();
    initProjectModal();
    initSkillsExplorer();
    initCopyContact();
    initLiveClock();
    initScrollReveal();
  });
})();
