/**
 * BlicBloc Documentation Hub Engine
 * Accordion tree navigation (one folder open at a time, all closed by default),
 * real-time search, deep linking, next/prev pagination, TOC, and random Sparks generator.
 */

document.addEventListener('DOMContentLoaded', () => {
  if (!window.DOCS_DATA || !Array.isArray(window.DOCS_DATA)) {
    console.error('BlicBloc Docs: DOCS_DATA not loaded!');
    return;
  }

  // Flatten articles into sequential array for Next/Previous pagination
  const flatArticles = [];
  window.DOCS_DATA.forEach(section => {
    section.articles.forEach(art => {
      flatArticles.push({
        ...art,
        section_name: section.section_name,
        section_id: section.section_id
      });
    });
  });

  let currentArticleId = getArticleIdFromHash() || flatArticles[0].id;

  // DOM Elements
  const treeContainer = document.getElementById('sidebar-nav-tree');
  const searchInput = document.getElementById('docs-search-input');
  const breadcrumbEl = document.getElementById('docs-breadcrumb');
  const articleMetaEl = document.getElementById('docs-meta');
  const contentEl = document.getElementById('markdown-content');
  const tocListEl = document.getElementById('toc-list');
  const prevBtnEl = document.getElementById('pagination-prev');
  const nextBtnEl = document.getElementById('pagination-next');
  const randomSparksContainer = document.getElementById('random-sparks-grid');
  const shuffleSparksBtn = document.getElementById('shuffle-sparks-btn');
  const mobileNavToggle = document.getElementById('mobile-nav-toggle');
  const docsSidebar = document.getElementById('docs-sidebar');
  const sidebarOverlay = document.getElementById('sidebar-overlay');

  // Initialize
  renderSidebarTree();
  loadArticle(currentArticleId);
  renderRandomSparks();

  // Hash change listener for deep linking & back button support
  window.addEventListener('hashchange', () => {
    const newId = getArticleIdFromHash();
    if (newId && newId !== currentArticleId) {
      loadArticle(newId);
    }
  });

  // Real-Time Search input filtering
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      filterSidebarTree(query);
    });
  }

  // Shuffle Sparks button
  if (shuffleSparksBtn) {
    shuffleSparksBtn.addEventListener('click', () => {
      renderRandomSparks();
    });
  }

  // Mobile Drawer toggles
  if (mobileNavToggle) {
    mobileNavToggle.addEventListener('click', () => {
      docsSidebar.classList.toggle('active');
      sidebarOverlay.classList.toggle('active');
    });
  }

  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', () => {
      docsSidebar.classList.remove('active');
      sidebarOverlay.classList.remove('active');
    });
  }

  // Helper: Get Hash
  function getArticleIdFromHash() {
    const hash = window.location.hash.replace('#', '');
    return hash ? decodeURIComponent(hash) : null;
  }

  // Render Sidebar Tree Navigation (Accordion: 1 open at a time, all closed by default)
  function renderSidebarTree() {
    if (!treeContainer) return;
    treeContainer.innerHTML = '';

    window.DOCS_DATA.forEach((section) => {
      const groupEl = document.createElement('div');

      // Default: ALL sub-folders closed (collapsed)
      groupEl.className = 'sidebar-section-group collapsed';
      groupEl.dataset.sectionId = section.section_id;

      const cleanSectionName = section.section_name.replace(/^\d+\s*/, '');

      const headerBtn = document.createElement('button');
      headerBtn.className = 'section-header-btn';
      headerBtn.innerHTML = `
        <span>${cleanSectionName}</span>
        <span class="chevron-icon">▼</span>
      `;

      // Accordion Click Logic: Opening ONE folder closes ALL OTHER folders!
      headerBtn.addEventListener('click', () => {
        const isCurrentlyCollapsed = groupEl.classList.contains('collapsed');

        // Close all section folders
        const allGroups = treeContainer.querySelectorAll('.sidebar-section-group');
        allGroups.forEach(g => g.classList.add('collapsed'));

        // Toggle clicked folder
        if (isCurrentlyCollapsed) {
          groupEl.classList.remove('collapsed');
        }
      });

      const listEl = document.createElement('ul');
      listEl.className = 'article-list';

      section.articles.forEach(art => {
        const itemEl = document.createElement('li');
        const linkEl = document.createElement('a');
        linkEl.className = 'article-item-link';
        linkEl.dataset.articleId = art.id;
        linkEl.href = `#${art.id}`;
        linkEl.textContent = art.title;

        if (art.id === currentArticleId) {
          linkEl.classList.add('active');
        }

        linkEl.addEventListener('click', () => {
          // On mobile, close drawer after selection
          if (docsSidebar) docsSidebar.classList.remove('active');
          if (sidebarOverlay) sidebarOverlay.classList.remove('active');
        });

        itemEl.appendChild(linkEl);
        listEl.appendChild(itemEl);
      });

      groupEl.appendChild(headerBtn);
      groupEl.appendChild(listEl);
      treeContainer.appendChild(groupEl);
    });
  }

  // Filter Sidebar Tree with Real-time Search
  function filterSidebarTree(query) {
    const groups = treeContainer.querySelectorAll('.sidebar-section-group');

    groups.forEach(group => {
      let hasMatch = false;
      const links = group.querySelectorAll('.article-item-link');

      links.forEach(link => {
        const title = link.textContent.toLowerCase();
        if (!query || title.includes(query)) {
          link.style.display = 'block';
          hasMatch = true;
        } else {
          link.style.display = 'none';
        }
      });

      if (hasMatch) {
        group.style.display = 'block';
        if (query) {
          group.classList.remove('collapsed');
        }
      } else {
        group.style.display = 'none';
      }
    });

    // If query cleared, keep accordion behavior (all closed except active article section)
    if (!query) {
      const activeLink = treeContainer.querySelector('.article-item-link.active');
      const activeGroup = activeLink ? activeLink.closest('.sidebar-section-group') : null;
      groups.forEach(g => {
        if (g === activeGroup) {
          g.classList.remove('collapsed');
        } else {
          g.classList.add('collapsed');
        }
      });
    }
  }

  // Load and Render Article Content
  function loadArticle(articleId) {
    const artIndex = flatArticles.findIndex(a => a.id === articleId);
    const article = artIndex !== -1 ? flatArticles[artIndex] : flatArticles[0];

    currentArticleId = article.id;

    // Highlight active link & expand ONLY its parent group (collapse all others)
    const allGroups = treeContainer.querySelectorAll('.sidebar-section-group');
    const allLinks = document.querySelectorAll('.article-item-link');

    let activeGroup = null;

    allLinks.forEach(l => {
      if (l.dataset.articleId === article.id) {
        l.classList.add('active');
        activeGroup = l.closest('.sidebar-section-group');
      } else {
        l.classList.remove('active');
      }
    });

    allGroups.forEach(g => {
      if (g === activeGroup) {
        g.classList.remove('collapsed');
      } else {
        g.classList.add('collapsed');
      }
    });

    // Update Breadcrumb
    const cleanSecName = article.section_name.replace(/^\d+\s*/, '');
    if (breadcrumbEl) {
      breadcrumbEl.innerHTML = `
        <a href="index.html">Home</a> &rsaquo;
        <a href="docs.html">Docs</a> &rsaquo;
        <span>${cleanSecName}</span> &rsaquo;
        <span style="color:var(--text-primary); font-weight:700">${article.title}</span>
      `;
    }

    // Update Meta Info (Reading Time)
    if (articleMetaEl) {
      const readTime = window.BlicBlocMarkdown ? window.BlicBlocMarkdown.estimateReadTime(article.content) : '';
      articleMetaEl.innerHTML = `
        <div class="read-time">
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          ${readTime}
        </div>
        <span class="badge badge-primary">${article.filename}</span>
      `;
    }

    // Render Markdown
    if (contentEl && window.BlicBlocMarkdown) {
      contentEl.innerHTML = window.BlicBlocMarkdown.render(article.content);
    }

    // Scroll to top of content
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Generate Table of Contents
    generateTOC();

    // Update Pagination (Prev / Next)
    updatePagination(artIndex);
  }

  // Table of Contents Generator
  function generateTOC() {
    if (!tocListEl || !contentEl) return;
    tocListEl.innerHTML = '';

    const headings = contentEl.querySelectorAll('h2, h3');
    if (headings.length === 0) {
      tocListEl.innerHTML = '<li class="toc-item-link" style="color:var(--text-muted)">No subheadings</li>';
      return;
    }

    headings.forEach(h => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.className = 'toc-item-link';
      a.href = `#${h.id}`;
      a.textContent = h.textContent.replace('#', '').trim();
      if (h.tagName.toLowerCase() === 'h3') {
        a.style.paddingLeft = '0.75rem';
        a.style.fontSize = '0.8rem';
      }
      li.appendChild(a);
      tocListEl.appendChild(li);
    });
  }

  // Update Next/Previous Pagination Buttons
  function updatePagination(currentIndex) {
    // Previous Article
    if (currentIndex > 0) {
      const prevArt = flatArticles[currentIndex - 1];
      const cleanPrevSec = prevArt.section_name.replace(/^\d+\s*/, '');
      prevBtnEl.style.visibility = 'visible';
      prevBtnEl.href = `#${prevArt.id}`;
      prevBtnEl.querySelector('.pagination-label').innerHTML = `← Previous (${cleanPrevSec})`;
      prevBtnEl.querySelector('.pagination-title').textContent = prevArt.title;
      prevBtnEl.onclick = (e) => {
        e.preventDefault();
        window.location.hash = prevArt.id;
      };
    } else {
      prevBtnEl.style.visibility = 'hidden';
    }

    // Next Article
    if (currentIndex < flatArticles.length - 1) {
      const nextArt = flatArticles[currentIndex + 1];
      const cleanNextSec = nextArt.section_name.replace(/^\d+\s*/, '');
      nextBtnEl.style.visibility = 'visible';
      nextBtnEl.href = `#${nextArt.id}`;
      nextBtnEl.querySelector('.pagination-label').innerHTML = `Next (${cleanNextSec}) →`;
      nextBtnEl.querySelector('.pagination-title').textContent = nextArt.title;
      nextBtnEl.onclick = (e) => {
        e.preventDefault();
        window.location.hash = nextArt.id;
      };
    } else {
      nextBtnEl.style.visibility = 'hidden';
    }
  }

  // Render "Sparks from Documentation" Random Discovery Topics
  function renderRandomSparks() {
    if (!randomSparksContainer) return;
    randomSparksContainer.innerHTML = '';

    const shuffled = [...flatArticles].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);

    selected.forEach(art => {
      const card = document.createElement('div');
      card.className = 'spark-card';

      const cleanSec = art.section_name.replace(/^\d+\s*/, '');
      const plainText = art.content.replace(/[#*`_>\[\]]/g, '').slice(0, 140) + '...';

      card.innerHTML = `
        <div>
          <div style="margin-bottom: 0.5rem;">
            <span class="badge badge-spark">⚡ Spark Topic</span>
            <span class="badge badge-primary" style="margin-left:4px;">${cleanSec}</span>
          </div>
          <div class="spark-card-title">${art.title}</div>
          <div class="spark-card-excerpt">${plainText}</div>
        </div>
        <div class="spark-card-footer">
          <span>Read Document</span>
          <a href="#${art.id}" class="btn btn-spark" style="padding: 0.35rem 0.85rem; font-size:0.8rem;" onclick="window.location.hash='${art.id}'">Explore →</a>
        </div>
      `;

      randomSparksContainer.appendChild(card);
    });
  }
});
