/* ===== COOKIE PREFERENCES MODAL =====
   OneTrust-style cookie consent modal triggered by footer link.
   Wireframe version with toggle switches per category.
*/
(function () {
  // Inject modal CSS
  var style = document.createElement('style');
  style.textContent = [
    '.cookie-modal-backdrop {',
    '  display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%;',
    '  background: rgba(0,0,0,0.5); z-index: 10001;',
    '  align-items: center; justify-content: center;',
    '}',
    '.cookie-modal-backdrop.is-open { display: flex; }',
    '.cookie-modal {',
    '  background: #fff; width: 100%; max-width: 620px; max-height: 85vh;',
    '  border-radius: 4px; overflow: hidden; display: flex; flex-direction: column;',
    '  box-shadow: 0 8px 32px rgba(0,0,0,0.2); margin: 16px;',
    '}',
    '.cookie-modal__header {',
    '  display: flex; justify-content: space-between; align-items: center;',
    '  padding: 20px 24px; border-bottom: 1px solid #eee;',
    '}',
    '.cookie-modal__title {',
    '  font-family: "BuckeyeSerif", Georgia, serif;',
    '  font-size: 20px; font-weight: 700; color: #333; margin: 0;',
    '}',
    '.cookie-modal__close {',
    '  width: 32px; height: 32px; border: none; background: none;',
    '  cursor: pointer; font-size: 22px; color: #666; display: flex;',
    '  align-items: center; justify-content: center; border-radius: 50%;',
    '  transition: background 0.15s; flex-shrink: 0;',
    '}',
    '.cookie-modal__close:hover { background: #f0f0f0; color: #333; }',
    '.cookie-modal__body {',
    '  padding: 24px; overflow-y: auto; flex: 1;',
    '}',
    '.cookie-modal__desc {',
    '  font-size: 13px; color: #555; line-height: 1.6; margin-bottom: 24px;',
    '  font-family: "BuckeyeSans", Arial, sans-serif;',
    '}',
    '.cookie-modal__category {',
    '  border: 1px solid #eee; border-radius: 4px; margin-bottom: 12px;',
    '}',
    '.cookie-modal__category-header {',
    '  display: flex; justify-content: space-between; align-items: center;',
    '  padding: 14px 16px; cursor: pointer; user-select: none;',
    '}',
    '.cookie-modal__category-header:hover { background: #fafafa; }',
    '.cookie-modal__category-name {',
    '  font-family: "BuckeyeSans", Arial, sans-serif;',
    '  font-size: 14px; font-weight: 600; color: #333;',
    '  display: flex; align-items: center; gap: 8px;',
    '}',
    '.cookie-modal__category-arrow {',
    '  font-size: 10px; color: #999; transition: transform 0.2s;',
    '}',
    '.cookie-modal__category-arrow--open { transform: rotate(90deg); }',
    '.cookie-modal__category-detail {',
    '  display: none; padding: 0 16px 14px; font-size: 12px; color: #666;',
    '  line-height: 1.6; font-family: "BuckeyeSans", Arial, sans-serif;',
    '}',
    '.cookie-modal__category-detail.is-open { display: block; }',
    '',
    '/* Toggle switch */',
    '.cookie-toggle {',
    '  position: relative; width: 40px; height: 22px; flex-shrink: 0;',
    '}',
    '.cookie-toggle input {',
    '  opacity: 0; width: 0; height: 0; position: absolute;',
    '}',
    '.cookie-toggle__track {',
    '  position: absolute; top: 0; left: 0; right: 0; bottom: 0;',
    '  background: #ccc; border-radius: 11px; cursor: pointer;',
    '  transition: background 0.2s;',
    '}',
    '.cookie-toggle__track::after {',
    '  content: ""; position: absolute; top: 2px; left: 2px;',
    '  width: 18px; height: 18px; background: #fff; border-radius: 50%;',
    '  transition: transform 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.15);',
    '}',
    '.cookie-toggle input:checked + .cookie-toggle__track {',
    '  background: #333;',
    '}',
    '.cookie-toggle input:checked + .cookie-toggle__track::after {',
    '  transform: translateX(18px);',
    '}',
    '.cookie-toggle input:disabled + .cookie-toggle__track {',
    '  background: #999; cursor: not-allowed;',
    '}',
    '.cookie-modal__always-on {',
    '  font-size: 11px; color: #999; font-weight: 600;',
    '  font-family: "BuckeyeSans", Arial, sans-serif;',
    '  text-transform: uppercase; letter-spacing: 0.5px;',
    '}',
    '',
    '/* Footer buttons */',
    '.cookie-modal__footer {',
    '  padding: 16px 24px; border-top: 1px solid #eee;',
    '  display: flex; justify-content: flex-end; gap: 12px;',
    '}',
    '.cookie-modal__btn {',
    '  padding: 10px 24px; font-family: "BuckeyeSans", Arial, sans-serif;',
    '  font-size: 13px; font-weight: 600; cursor: pointer; border: 2px solid #333;',
    '}',
    '.cookie-modal__btn--outline {',
    '  background: #fff; color: #333;',
    '}',
    '.cookie-modal__btn--outline:hover { background: #f5f5f5; }',
    '.cookie-modal__btn--filled {',
    '  background: #333; color: #fff;',
    '}',
    '.cookie-modal__btn--filled:hover { background: #555; }',
  ].join('\n');
  document.head.appendChild(style);

  // Cookie categories data
  var categories = [
    {
      name: 'Strictly Necessary Cookies',
      desc: 'These cookies are necessary for the website to function and cannot be switched off. They are usually set in response to actions made by you such as setting your privacy preferences, logging in, or filling in forms.',
      alwaysOn: true
    },
    {
      name: 'Analytics Cookies',
      desc: 'These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us know which pages are the most and least popular and see how visitors move around the site.',
      alwaysOn: false,
      checked: true
    },
    {
      name: 'Functional Cookies',
      desc: 'These cookies enable the website to provide enhanced functionality and personalization. They may be set by us or by third-party providers whose services we have added to our pages.',
      alwaysOn: false,
      checked: true
    },
    {
      name: 'Targeting Cookies',
      desc: 'These cookies may be set through our site by our advertising partners. They may be used to build a profile of your interests and show you relevant content or ads on other sites.',
      alwaysOn: false,
      checked: false
    }
  ];

  // Build modal HTML
  var backdrop = document.createElement('div');
  backdrop.className = 'cookie-modal-backdrop';

  var categoriesHTML = categories.map(function (cat, i) {
    var toggleHTML = cat.alwaysOn
      ? '<span class="cookie-modal__always-on">Always Active</span>'
      : '<label class="cookie-toggle">' +
        '<input type="checkbox"' + (cat.checked ? ' checked' : '') + ' data-cookie-cat="' + i + '">' +
        '<span class="cookie-toggle__track"></span>' +
        '</label>';

    return [
      '<div class="cookie-modal__category">',
      '  <div class="cookie-modal__category-header" data-cat-toggle="' + i + '">',
      '    <span class="cookie-modal__category-name">',
      '      <span class="cookie-modal__category-arrow" data-cat-arrow="' + i + '">&#9654;</span>',
      '      ' + cat.name,
      '    </span>',
      '    ' + toggleHTML,
      '  </div>',
      '  <div class="cookie-modal__category-detail" data-cat-detail="' + i + '">',
      '    ' + cat.desc,
      '  </div>',
      '</div>'
    ].join('\n');
  }).join('\n');

  backdrop.innerHTML = [
    '<div class="cookie-modal">',
    '  <div class="cookie-modal__header">',
    '    <h2 class="cookie-modal__title">Manage Cookie Preferences</h2>',
    '    <button class="cookie-modal__close" aria-label="Close cookie preferences">&times;</button>',
    '  </div>',
    '  <div class="cookie-modal__body">',
    '    <p class="cookie-modal__desc">When you visit our website, we store cookies on your browser to collect information. The information collected might relate to you, your preferences, or your device, and is mostly used to make the site work as you expect it to and to provide a more personalized web experience.</p>',
    categoriesHTML,
    '  </div>',
    '  <div class="cookie-modal__footer">',
    '    <button class="cookie-modal__btn cookie-modal__btn--outline" data-cookie-action="reject">Reject All</button>',
    '    <button class="cookie-modal__btn cookie-modal__btn--filled" data-cookie-action="save">Confirm My Choices</button>',
    '  </div>',
    '</div>'
  ].join('\n');
  document.body.appendChild(backdrop);

  // Category accordion toggle
  backdrop.addEventListener('click', function (e) {
    var toggle = e.target.closest('[data-cat-toggle]');
    // Don't toggle if clicking the switch itself
    if (e.target.closest('.cookie-toggle')) return;
    if (toggle) {
      var idx = toggle.getAttribute('data-cat-toggle');
      var detail = backdrop.querySelector('[data-cat-detail="' + idx + '"]');
      var arrow = backdrop.querySelector('[data-cat-arrow="' + idx + '"]');
      detail.classList.toggle('is-open');
      arrow.classList.toggle('cookie-modal__category-arrow--open');
    }
  });

  // Open modal
  function openModal() {
    backdrop.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  // Close modal
  function closeModal() {
    backdrop.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  // Close button
  backdrop.querySelector('.cookie-modal__close').addEventListener('click', closeModal);

  // Backdrop click
  backdrop.addEventListener('click', function (e) {
    if (e.target === backdrop) closeModal();
  });

  // Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && backdrop.classList.contains('is-open')) closeModal();
  });

  // Footer action buttons
  backdrop.querySelectorAll('[data-cookie-action]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var action = btn.getAttribute('data-cookie-action');
      if (action === 'reject') {
        backdrop.querySelectorAll('input[data-cookie-cat]').forEach(function (cb) {
          cb.checked = false;
        });
      }
      closeModal();
    });
  });

  // Bind to footer "Manage Cookie Settings" links
  document.querySelectorAll('a[href="cookies.html"]').forEach(function (link) {
    // Only convert footer links (inside .site-footer__bottom-links)
    if (link.closest('.site-footer__bottom-links')) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        openModal();
      });
    }
  });
})();
