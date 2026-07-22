/**
 * BlicBloc Landing Page Interactive Scripts
 * Handles mobile drawer toggle with backdrop overlay, tab switches, feature demos, and random documentation sparks preview
 */

document.addEventListener('DOMContentLoaded', () => {
  // Mobile Nav Drawer Toggle for Landing Page
  const mobileNavToggle = document.getElementById('landing-mobile-toggle');
  const mobileMenu = document.getElementById('landing-mobile-menu');

  if (mobileNavToggle && mobileMenu) {
    mobileNavToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      mobileMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking outside or clicking any nav link
    document.addEventListener('click', (e) => {
      if (!mobileMenu.contains(e.target) && !mobileNavToggle.contains(e.target)) {
        mobileMenu.classList.remove('active');
      }
    });

    const mobileLinks = mobileMenu.querySelectorAll('.nav-link, .btn');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
      });
    });
  }

  // Showcase Tab Switching Logic
  const tabBtns = document.querySelectorAll('.showcase-tabs .tab-btn');
  const tabPanels = document.querySelectorAll('.tab-content-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.dataset.tab;

      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const activePanel = document.getElementById(`tab-${targetTab}`);
      if (activePanel) {
        activePanel.classList.add('active');
      }
    });
  });

  // Blic Type Interactive Preview Switcher
  const blicTypeBtns = document.querySelectorAll('.blic-type-btn');
  const blicDisplayTitle = document.getElementById('blic-display-title');
  const blicDisplayDesc = document.getElementById('blic-display-desc');
  const blicDisplayTag = document.getElementById('blic-display-tag');

  const blicTypesInfo = {
    article: {
      tag: 'Article Blic',
      title: 'Deep-Dive Educational Guide: Modern Web Architecture',
      desc: 'Structured long-form publishing with rich markdown, inline diagrams, asset downloads, and reader engagement metrics.'
    },
    video: {
      tag: 'Video Blic',
      title: 'Full Video Masterclass: Building Microservices',
      desc: 'High-definition video host with chapters, transcript sync, attached code resources, and creator commentary.'
    },
    project: {
      tag: 'Project Blic',
      title: 'Open Source Showcase: NextGen AI Engine',
      desc: 'Interactive portfolio project display featuring live demos, GitHub repositories, release notes, and contributor lists.'
    },
    resource: {
      tag: 'Resource Blic',
      title: 'Design System & UI Component Library Kit',
      desc: 'Curated downloadable assets, templates, code snippets, and cheat sheets organized for audience utility.'
    }
  };

  blicTypeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.type;
      const info = blicTypesInfo[type];

      blicTypeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      if (info && blicDisplayTitle && blicDisplayDesc && blicDisplayTag) {
        blicDisplayTag.textContent = info.tag;
        blicDisplayTitle.textContent = info.title;
        blicDisplayDesc.textContent = info.desc;
      }
    });
  });

  // Landing Page Random Sparks Loader
  if (window.DOCS_DATA && Array.isArray(window.DOCS_DATA)) {
    const flatArticles = [];
    window.DOCS_DATA.forEach(sec => {
      sec.articles.forEach(art => {
        flatArticles.push({
          ...art,
          section_name: sec.section_name
        });
      });
    });

    const landingSparksContainer = document.getElementById('landing-sparks-grid');
    const landingShuffleBtn = document.getElementById('landing-shuffle-btn');

    function renderLandingSparks() {
      if (!landingSparksContainer) return;
      landingSparksContainer.innerHTML = '';

      const shuffled = [...flatArticles].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 3);

      selected.forEach(art => {
        const cleanSec = art.section_name.replace(/^\d+\s*/, '');
        const excerpt = art.content.replace(/[#*`_>\[\]]/g, '').slice(0, 130) + '...';

        const card = document.createElement('div');
        card.className = 'spark-card';
        card.innerHTML = `
          <div>
            <div style="margin-bottom: 0.5rem;">
              <span class="badge badge-spark">⚡ Documentation Spark</span>
              <span class="badge badge-primary" style="margin-left:4px;">${cleanSec}</span>
            </div>
            <div class="spark-card-title">${art.title}</div>
            <div class="spark-card-excerpt">${excerpt}</div>
          </div>
          <div class="spark-card-footer">
            <span>Documentation Topic</span>
            <a href="docs.html#${art.id}" class="btn btn-spark" style="padding: 0.35rem 0.85rem; font-size:0.8rem;">Read Topic →</a>
          </div>
        `;
        landingSparksContainer.appendChild(card);
      });
    }

    renderLandingSparks();

    if (landingShuffleBtn) {
      landingShuffleBtn.addEventListener('click', () => {
        renderLandingSparks();
      });
    }
  }
});
