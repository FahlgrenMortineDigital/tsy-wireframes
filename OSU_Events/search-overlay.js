/* ===== SEARCH OVERLAY =====
   Full-screen search overlay triggered by clicking the search icon.
   Inspired by greenbrierwv.com search pattern.
*/
(function () {
  // Inject overlay CSS
  var style = document.createElement('style');
  style.textContent = [
    '.search-overlay {',
    '  display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%;',
    '  background: rgba(255,255,255,0.97); z-index: 10000;',
    '  flex-direction: column; align-items: center; justify-content: flex-start;',
    '  padding-top: 120px;',
    '}',
    '.search-overlay.is-open { display: flex; }',
    '.search-overlay__close {',
    '  position: absolute; top: 24px; right: 32px;',
    '  width: 40px; height: 40px; border: none; background: none;',
    '  cursor: pointer; font-size: 28px; color: #666; display: flex;',
    '  align-items: center; justify-content: center; border-radius: 50%;',
    '  transition: background 0.15s;',
    '}',
    '.search-overlay__close:hover { background: #f0f0f0; color: #333; }',
    '.search-overlay__inner { width: 100%; max-width: 680px; padding: 0 24px; text-align: center; }',
    '.search-overlay__heading {',
    '  font-family: "BuckeyeSerif", Georgia, serif;',
    '  font-size: 28px; font-weight: 700; color: #333; margin-bottom: 32px;',
    '}',
    '.search-overlay__form {',
    '  display: flex; border-bottom: 2px solid #333; padding-bottom: 8px;',
    '}',
    '.search-overlay__input {',
    '  flex: 1; border: none; outline: none; font-size: 20px;',
    '  font-family: "BuckeyeSans", Arial, sans-serif; color: #333;',
    '  background: transparent; padding: 8px 0;',
    '}',
    '.search-overlay__input::placeholder { color: #aaa; }',
    '.search-overlay__submit {',
    '  border: none; background: none; cursor: pointer;',
    '  font-family: "BuckeyeSans", Arial, sans-serif;',
    '  font-size: 14px; font-weight: 700; color: #333; padding: 8px 16px;',
    '  text-transform: uppercase; letter-spacing: 1px;',
    '  transition: color 0.15s;',
    '}',
    '.search-overlay__submit:hover { color: #000; }',
    '.search-overlay__suggestions {',
    '  margin-top: 36px; text-align: left;',
    '}',
    '.search-overlay__suggestions-title {',
    '  font-size: 10px; text-transform: uppercase; letter-spacing: 2px;',
    '  color: #999; font-weight: 600; margin-bottom: 16px;',
    '}',
    '.search-overlay__tags { display: flex; flex-wrap: wrap; gap: 10px; }',
    '.search-overlay__tag {',
    '  display: inline-block; padding: 8px 18px; border: 1px solid #ccc;',
    '  border-radius: 20px; font-size: 13px; color: #555;',
    '  text-decoration: none; transition: all 0.15s; cursor: pointer;',
    '  font-family: "BuckeyeSans", Arial, sans-serif;',
    '}',
    '.search-overlay__tag:hover { background: #333; color: #fff; border-color: #333; }',
    '',
    '/* Make search icon clickable */',
    '.site-header__search { cursor: pointer; }',
    '.site-header__search:hover { border-color: #666; }',
    '.site-header__search:hover::after { background: #666; }',
  ].join('\n');
  document.head.appendChild(style);

  // Build overlay HTML
  var overlay = document.createElement('div');
  overlay.className = 'search-overlay';
  overlay.innerHTML = [
    '<button class="search-overlay__close" aria-label="Close search">&times;</button>',
    '<div class="search-overlay__inner">',
    '  <h2 class="search-overlay__heading">Search Ohio State Events</h2>',
    '  <form class="search-overlay__form" action="search-results.html" method="get">',
    '    <input class="search-overlay__input" type="text" name="q" placeholder="What are you looking for?" autocomplete="off">',
    '    <button class="search-overlay__submit" type="submit">Search</button>',
    '  </form>',
    '  <div class="search-overlay__suggestions">',
    '    <div class="search-overlay__suggestions-title">Popular Searches</div>',
    '    <div class="search-overlay__tags">',
    '      <a class="search-overlay__tag" href="search-results.html?q=venues">Venues</a>',
    '      <a class="search-overlay__tag" href="search-results.html?q=catering">Catering</a>',
    '      <a class="search-overlay__tag" href="search-results.html?q=ohio+stadium">Ohio Stadium</a>',
    '      <a class="search-overlay__tag" href="search-results.html?q=blackwell+inn">Blackwell Inn</a>',
    '      <a class="search-overlay__tag" href="search-results.html?q=parking">Parking</a>',
    '      <a class="search-overlay__tag" href="search-results.html?q=columbus+hotels">Columbus Hotels</a>',
    '    </div>',
    '  </div>',
    '</div>',
  ].join('\n');
  document.body.appendChild(overlay);

  // Open overlay on search icon click
  var searchIcons = document.querySelectorAll('.site-header__search');
  searchIcons.forEach(function (icon) {
    icon.addEventListener('click', function (e) {
      e.preventDefault();
      overlay.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      setTimeout(function () {
        overlay.querySelector('.search-overlay__input').focus();
      }, 100);
    });
  });

  // Also open from mobile search
  var mobileSearchBtns = document.querySelectorAll('.mobile-menu__search-btn');
  var mobileSearchInputs = document.querySelectorAll('.mobile-menu__search-input');
  mobileSearchBtns.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var mobileInput = btn.parentElement.querySelector('.mobile-menu__search-input');
      overlay.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      var overlayInput = overlay.querySelector('.search-overlay__input');
      if (mobileInput && mobileInput.value) {
        overlayInput.value = mobileInput.value;
      }
      setTimeout(function () { overlayInput.focus(); }, 100);
    });
  });

  // Close overlay
  overlay.querySelector('.search-overlay__close').addEventListener('click', function () {
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
  });

  // Close on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) {
      overlay.classList.remove('is-open');
      document.body.style.overflow = '';
    }
  });

  // Close on clicking backdrop (outside inner content)
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) {
      overlay.classList.remove('is-open');
      document.body.style.overflow = '';
    }
  });
})();
