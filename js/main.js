document.addEventListener('DOMContentLoaded', function() {
  // Theme Switcher Logic
  const toggleBtn = document.getElementById('theme-toggle');
  const themeIconContainer = document.getElementById('theme-icon-container');
  const themeLabel = document.getElementById('theme-label');

  const sunSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`;
  const moonSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`;

  function updateThemeUI(theme) {
    if (!toggleBtn) return;
    if (theme === 'dark') {
      if (themeIconContainer) themeIconContainer.innerHTML = sunSVG;
      if (themeLabel) themeLabel.textContent = 'Light';
    } else {
      if (themeIconContainer) themeIconContainer.innerHTML = moonSVG;
      if (themeLabel) themeLabel.textContent = 'Dark';
    }
  }

  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  updateThemeUI(currentTheme);

  if (toggleBtn) {
    toggleBtn.addEventListener('click', function() {
      const activeTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = activeTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('42devops-theme', newTheme);
      updateThemeUI(newTheme);
    });
  }

  // Code Block Enhancement: Wrap with Header & Copy Button
  const highlightBlocks = document.querySelectorAll('.highlight, pre:not(.highlight pre)');
  highlightBlocks.forEach(function(block) {
    // Avoid double wrapping
    if (block.closest('.code-wrapper')) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'code-wrapper';

    const header = document.createElement('div');
    header.className = 'code-header';

    const dots = document.createElement('div');
    dots.className = 'code-dots';
    dots.innerHTML = '<span class="code-dot code-dot-red"></span><span class="code-dot code-dot-yellow"></span><span class="code-dot code-dot-green"></span>';

    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn';
    copyBtn.textContent = 'Copy';

    copyBtn.addEventListener('click', function() {
      const codeText = block.querySelector('code') ? block.querySelector('code').innerText : block.innerText;
      navigator.clipboard.writeText(codeText).then(function() {
        copyBtn.textContent = 'Copied!';
        setTimeout(function() { copyBtn.textContent = 'Copy'; }, 2000);
      });
    });

    header.appendChild(dots);
    header.appendChild(copyBtn);

    block.parentNode.insertBefore(wrapper, block);
    wrapper.appendChild(header);
    wrapper.appendChild(block);
  });

  // Homepage Filters
  const filterPills = document.querySelectorAll('.filter-pill');
  const postCards = document.querySelectorAll('.post-card');

  if (filterPills.length > 0 && postCards.length > 0) {
    filterPills.forEach(pill => {
      pill.addEventListener('click', function() {
        filterPills.forEach(p => p.classList.remove('active'));
        this.classList.add('active');

        const filter = this.getAttribute('data-filter');

        postCards.forEach(card => {
          const categories = (card.getAttribute('data-categories') || '').split(/\s+/);
          if (filter === 'all' || categories.includes(filter)) {
            card.style.display = 'block';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }
});