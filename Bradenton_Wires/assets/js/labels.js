/* Bradenton wireframes — runtime helpers.
   Loaded at the END of <body>, so the DOM is parsed when each
   block runs — no DOMContentLoaded wrapper needed. Same pattern
   as the FK reference. */


/* ============================================================
   Shared NAV_TREE — used by the desktop dropdowns AND the mobile
   drawer. Single source of truth per site (leisure / meetings).
   ============================================================ */
var LEISURE_NAV = {
  'Discover': {
    parentHref: 'discover.html',
    items: [
      { label: 'About the Area',          href: 'discover.html#about' },
      { label: 'FAQ',                     href: 'discover.html#faq' },
      { type: 'header', label: 'Communities' },
      { label: 'Bradenton',               href: '#' },
      { label: 'Anna Maria Island',       href: 'community-anna-maria-island.html' },
      { label: 'Bradenton Beach',         href: '#' },
      { label: 'Holmes Beach',            href: '#' },
      { label: 'Cortez',                  href: 'community-cortez.html' },
      { label: 'Longboat Key',            href: '#' },
      { label: 'Palmetto',                href: '#' },
      { label: 'Lakewood Ranch',          href: '#' },
      { label: 'Parrish',                 href: '#' }
    ]
  },
  'Beaches': {
    parentHref: 'beaches.html',
    items: [
      { label: 'Beach Cams',              href: 'beaches.html#cams' },
      { label: 'Beach Conditions',        href: 'beaches.html#cams' },
      { label: 'Beach Finder Quiz',       href: 'beaches.html#quiz' }
    ]
  },
  'See & Do': {
    parentHref: 'see-do.html',
    items: [
      { label: 'Arts & Culture',          href: '#' },
      { label: 'Outdoor Adventures',      href: 'see-do-outdoor-adventures.html' },
      { label: 'Boutiques & Markets',     href: '#' },
      { label: 'Spas & Wellness',         href: '#' },
      { label: 'Activities & Learning',   href: '#' },
      { label: 'Golf',                    href: '#' }
    ]
  },
  'Eat & Drink': {
    parentHref: 'eat-drink.html',
    items: [
      { label: 'Floribbean Cuisine',      href: 'eat-drink-floribbean.html' },
      { label: 'Toes in the Sand',        href: '#' },
      { label: 'Breakfast & Brunch',      href: '#' },
      { label: 'International Flavors',   href: '#' },
      { label: 'Local Breweries & Distilleries', href: '#' },
      { label: 'Sweets & Treats',         href: '#' },
      { label: 'Date Night',              href: '#' },
      { label: 'Family Friendly',         href: '#' }
    ]
  },
  'Stay': {
    parentHref: 'stay.html',
    items: [
      { label: 'Hotels & Resorts',        href: 'stay-hotels-resorts.html' },
      { label: 'Vacation Rentals',        href: '#' },
      { label: 'Camping & RV',            href: '#' }
    ]
  },
  'Plan': {
    parentHref: 'plan.html',
    items: [
      { label: 'AI Trip Planner',         href: 'plan.html' },
      { label: 'Itineraries',             href: 'plan.html#itineraries' },
      { label: 'Visitor Guides',          href: 'plan.html#guide' },
      { label: 'Getting Here & Around',   href: 'plan.html#getting-here' },
      { label: 'Nonstop Flights',         href: 'plan.html#flights' },
      { label: 'Ferry Guide',             href: 'plan-ferry-guide.html' }
    ]
  },
  'Events': {
    parentHref: 'events.html',
    items: [
      { label: 'Events Calendar',         href: 'events.html' },
      { label: 'Seasonal Events',         href: 'events.html#seasons' }
    ]
  }
};

var MEETINGS_NAV = {
  'Why the Bradenton Area': {
    parentHref: 'why-bradenton.html',
    items: [
      { label: 'Dining',                  href: 'why-bradenton.html#dining' },
      { label: 'Things To Do',            href: 'why-bradenton.html#things-to-do' },
      { label: 'Meet the Team',           href: 'why-bradenton.html#team' }
    ]
  },
  'Convention Center Services': {
    parentHref: 'convention-center.html',
    items: [
      { label: 'Venue Details',           href: 'convention-center.html#venue' },
      { label: 'Floor Plans',             href: 'convention-center-floor-plans.html' },
      { label: 'Food & Beverage',         href: 'convention-center.html#fb' },
      { label: 'Meeting Planner Guide',   href: 'convention-center.html#guide' },
      { label: 'Planner Resources',       href: 'convention-center.html#resources' }
    ]
  },
  'Event Hosting & Lodging': {
    parentHref: 'event-hosting.html',
    items: [
      { label: 'Headquarters Hotel',      href: 'event-hosting-headquarters-hotel.html' },
      { label: 'Nearby Hotels',           href: 'event-hosting.html#nearby' },
      { label: 'Powel Crosley Estate',    href: 'event-hosting-powel-crosley.html' }
    ]
  },
  'Articles': {
    parentHref: 'articles.html',
    items: [
      { label: 'For Planners',            href: 'article-5-reasons.html' },
      { label: 'For Attendees',           href: 'article-8-ways-extra-day.html' },
      { label: 'Dine-Around Guide',       href: 'article-best-dine-arounds.html' },
      { label: 'Team-Building Ideas',     href: 'article-team-building.html' }
    ]
  },
  'Events': {
    parentHref: 'events.html',
    items: [
      { label: 'Upcoming Events',         href: 'events.html#upcoming' },
      { label: 'Trade Shows',             href: 'events.html#trade-shows' },
      { label: 'Consumer Expos',          href: 'events.html#consumer' },
      { label: 'Corporate & Convention',  href: 'events.html#corporate' },
      { label: 'Featured Event',          href: 'event-detail-fl-restaurant-show.html' }
    ]
  }
};

var IS_MEETINGS = document.body.classList.contains('meetings');
var NAV_TREE = IS_MEETINGS ? MEETINGS_NAV : LEISURE_NAV;
var SITE_LABEL = IS_MEETINGS ? 'BACC Meetings' : 'BGI Leisure';


/* ============================================================
   1) HEADER AUTO-HIDE on scroll-down, reveal on scroll-up.
   ============================================================ */
(function () {
  var header = document.querySelector('.site-header');
  if (!header) return;
  var lastY = window.scrollY;
  var DELTA = 8;
  var MIN_Y = 100;
  var ticking = false;
  function update() {
    var y = window.scrollY;
    var dy = y - lastY;
    if (Math.abs(dy) >= DELTA) {
      if (dy > 0 && y > MIN_Y) {
        header.classList.add('header--hidden');
      } else if (dy < 0) {
        header.classList.remove('header--hidden');
      }
      lastY = y;
    }
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
})();


/* ============================================================
   2) COMPONENT PILL LABELS — visible by default. Toggle hides.
   ============================================================ */
(function () {
  var STORAGE_KEY = 'bgi-lib-labels-visible';
  var body = document.body;

  /* Components we deliberately don't pill — sub-chrome of SITE_HEADER. */
  var SKIP_INJECT = { PRIMARY_NAV: 1, UTILITY_NAV: 1 };

  document.querySelectorAll('[data-component]').forEach(function (el) {
    if (el.querySelector(':scope > .lib-label.lib-label--injected')) return;
    var name = el.getAttribute('data-component');
    if (SKIP_INJECT[name]) return;
    var a = document.createElement('a');
    a.className = 'lib-label lib-label--injected';
    a.href = 'project-components.html#' + name;
    a.textContent = name.replace(/_/g, ' ');
    a.title = 'Open ' + name + ' in component library';
    el.insertBefore(a, el.firstChild);
  });

  var visible = true;
  try { visible = localStorage.getItem(STORAGE_KEY) !== 'false'; } catch (e) {}

  function apply(v) {
    body.classList.toggle('hide-labels', !v);
    var sw = document.querySelector('.label-toggle__switch');
    if (sw) sw.classList.toggle('is-on', v);
  }
  apply(visible);

  var sw = document.querySelector('.label-toggle__switch');
  if (sw) {
    sw.addEventListener('click', function (e) {
      e.stopPropagation();
      visible = !visible;
      try { localStorage.setItem(STORAGE_KEY, String(visible)); } catch (err) {}
      apply(visible);
    });
  }
})();


/* ============================================================
   3) DESKTOP DROPDOWN NAV — wraps each existing primary-nav <a>
   in a .primary-nav__item and appends a .primary-nav__panel for
   sections that have children in NAV_TREE.
   ============================================================ */
(function () {
  var nav = document.querySelector('.site-header .primary-nav');
  if (!nav) return;

  Array.prototype.slice.call(nav.children).forEach(function (link) {
    if (link.tagName !== 'A') return;
    if (link.classList.contains('lib-label')) return;
    var label = link.textContent.trim();
    var entry = NAV_TREE[label];
    var items = entry && entry.items;

    var wrapper = document.createElement('div');
    wrapper.className = 'primary-nav__item';
    nav.insertBefore(wrapper, link);
    wrapper.appendChild(link);

    if (!items || !items.length) return;
    wrapper.classList.add('has-children');

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'primary-nav__expand';
    btn.setAttribute('aria-label', 'Show ' + label + ' submenu');
    wrapper.appendChild(btn);

    var panel = document.createElement('div');
    panel.className = 'primary-nav__panel';
    items.forEach(function (item) {
      if (item.type === 'header') {
        var h = document.createElement('div');
        h.className = 'primary-nav__panel-head';
        h.textContent = item.label;
        panel.appendChild(h);
      } else {
        var a = document.createElement('a');
        a.href = item.href;
        a.textContent = item.label;
        panel.appendChild(a);
      }
    });
    wrapper.appendChild(panel);

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      nav.querySelectorAll('.primary-nav__item.is-expanded').forEach(function (other) {
        if (other !== wrapper) other.classList.remove('is-expanded');
      });
      wrapper.classList.toggle('is-expanded');
    });
  });
})();


/* ============================================================
   4) HAMBURGER ICON — normalize the .menu-btn inner markup so
   the CSS can render the three-line icon.
   ============================================================ */
(function () {
  var btn = document.querySelector('.menu-btn');
  if (!btn) return;
  if (btn.querySelector('.menu-btn__lines')) return;
  btn.innerHTML = '<span class="menu-btn__lines" aria-hidden="true"><span></span><span></span><span></span></span><span class="sr-only">Menu</span>';
  btn.setAttribute('aria-label', 'Open menu');
})();


/* ============================================================
   5) MOBILE MENU DRAWER (FK pattern)
   Inject .mobile-menu as a body-level sibling so its z-index
   escapes the .site-header stacking context. Build sections from
   NAV_TREE — accordion-expand, with a Browse-all link at top.
   ============================================================ */
(function () {
  var btn = document.querySelector('.menu-btn');
  if (!btn) return;
  if (document.querySelector('.mobile-menu')) return;

  var menu = document.createElement('div');
  menu.className = 'mobile-menu';
  menu.id = 'mobile-menu';
  menu.setAttribute('aria-hidden', 'true');

  /* Top bar with mini brand + close button */
  var top = document.createElement('div');
  top.className = 'mobile-menu__top';
  top.innerHTML =
    '<a class="mobile-menu__brand" href="' + (IS_MEETINGS ? 'index.html' : 'index.html') + '">' +
      '<span class="brandmark__sun" aria-hidden="true"></span>' +
      '<span class="brandmark__words">' +
        (IS_MEETINGS ? 'Bradenton Area Convention Center' : 'Bradenton Gulf Islands') +
        '<small>' + (IS_MEETINGS ? "Meet on Florida's West Coast" : "Florida's West Coast") + '</small>' +
      '</span>' +
    '</a>' +
    '<button type="button" class="mobile-menu__close" aria-label="Close menu">×</button>';
  menu.appendChild(top);

  /* Sections */
  var sections = document.createElement('div');
  sections.className = 'mobile-menu__sections';

  Object.keys(NAV_TREE).forEach(function (label) {
    var entry = NAV_TREE[label];
    var section = document.createElement('div');
    section.className = 'mobile-menu__section';
    if (!entry.items || !entry.items.length) section.classList.add('is-flat');

    var head = document.createElement('button');
    head.type = 'button';
    head.className = 'mobile-menu__section-head';
    head.innerHTML = label + '<span class="chev" aria-hidden="true"></span>';

    /* Flat section: clicking the head navigates to the parent page */
    if (!entry.items || !entry.items.length) {
      head.addEventListener('click', function () {
        if (entry.parentHref) window.location.href = entry.parentHref;
      });
    } else {
      head.addEventListener('click', function () {
        var open = section.classList.toggle('is-expanded');
        var body = section.querySelector('.mobile-menu__section-body');
        body.style.maxHeight = open ? body.scrollHeight + 'px' : 0;
      });
    }
    section.appendChild(head);

    if (entry.items && entry.items.length) {
      var body = document.createElement('div');
      body.className = 'mobile-menu__section-body';
      var inner = document.createElement('div');
      inner.className = 'mobile-menu__section-body-inner';

      if (entry.parentHref) {
        var viewAll = document.createElement('a');
        viewAll.className = 'mobile-menu__view-all';
        viewAll.href = entry.parentHref;
        viewAll.textContent = 'Browse all ' + label + ' →';
        inner.appendChild(viewAll);
      }

      entry.items.forEach(function (item) {
        if (item.type === 'header') {
          var h = document.createElement('span');
          h.className = 'mobile-menu__section-head-label';
          h.textContent = item.label;
          inner.appendChild(h);
        } else {
          var a = document.createElement('a');
          a.className = 'mobile-menu__section-link';
          a.href = item.href;
          a.textContent = item.label;
          inner.appendChild(a);
        }
      });

      body.appendChild(inner);
      section.appendChild(body);
    }

    sections.appendChild(section);
  });

  menu.appendChild(sections);

  /* Footer — utility links cloned from the page utility-bar (skip the
     wireframe back-link since it's already shown above the header). */
  var utilityBar = document.querySelector('.utility-bar');
  if (utilityBar) {
    var foot = document.createElement('div');
    foot.className = 'mobile-menu__foot';
    var label = document.createElement('div');
    label.className = 'mobile-menu__foot-label';
    label.textContent = 'More';
    foot.appendChild(label);
    var utilLinks = utilityBar.querySelectorAll('a:not(.utility-bar__back)');
    utilLinks.forEach(function (link) { foot.appendChild(link.cloneNode(true)); });
    if (utilLinks.length) menu.appendChild(foot);
  }

  document.body.appendChild(menu);

  function setOpen(open) {
    menu.classList.toggle('is-open', open);
    btn.classList.toggle('is-active', open);
    document.body.classList.toggle('nav-locked', open);
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
  }

  btn.addEventListener('click', function () { setOpen(!menu.classList.contains('is-open')); });
  menu.querySelector('.mobile-menu__close').addEventListener('click', function () { setOpen(false); });
  menu.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') setOpen(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) setOpen(false);
  });
})();


/* ============================================================
   6) SEARCH MODAL — inject as body sibling, wire .search-stub.
   Submits to search-results.html (per site). Esc + close button.
   ============================================================ */
(function () {
  var trigger = document.querySelector('.search-stub');
  if (!trigger) return;
  if (document.querySelector('.search-modal')) return;

  var SUGGESTIONS = IS_MEETINGS ? [
    'Floor plans', 'RFP', 'Headquarters hotel', 'Powel Crosley',
    'Floribbean catering', 'Team building', 'Dine-around', 'Spring training'
  ] : [
    'Anna Maria Island', 'Floribbean', 'Stone crab', 'Coquina Beach',
    'Robinson Preserve', 'Gulf Islands Ferry', 'Sunset', 'Family beach'
  ];

  var TITLE = IS_MEETINGS ? 'What can we help you plan?' : 'What are you looking for?';

  var modal = document.createElement('div');
  modal.className = 'search-modal';
  modal.id = 'search-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', 'Search');
  modal.setAttribute('aria-hidden', 'true');

  var suggestionsHTML = SUGGESTIONS.map(function (s) {
    return '<a href="search-results.html?q=' + encodeURIComponent(s) + '">' + s + '</a>';
  }).join('');

  modal.innerHTML =
    '<button class="search-modal__close" type="button" aria-label="Close search">×</button>' +
    '<div class="search-modal__inner">' +
      '<h2 class="search-modal__title">' + TITLE + '</h2>' +
      '<form class="search-modal__form" action="search-results.html" method="get" role="search">' +
        '<input type="search" name="q" class="search-modal__input" ' +
               'placeholder="' + (IS_MEETINGS ? 'Search planning resources, venues, articles…' : 'Search beaches, dining, communities, stories…') + '" ' +
               'aria-label="Search" autocomplete="off">' +
        '<button type="submit" class="search-modal__submit" aria-label="Search">' +
          '<svg viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="9" r="7"/><path d="m20 20-5-5" stroke-linecap="round"/></svg>' +
        '</button>' +
      '</form>' +
      '<div class="search-modal__suggestions">' +
        '<span class="search-modal__suggestions-label">Popular</span>' +
        suggestionsHTML +
      '</div>' +
    '</div>';

  document.body.appendChild(modal);

  function setOpen(open) {
    modal.classList.toggle('is-open', open);
    document.body.classList.toggle('nav-locked', open);
    modal.setAttribute('aria-hidden', open ? 'false' : 'true');
    if (open) {
      var input = modal.querySelector('.search-modal__input');
      if (input) setTimeout(function () { input.focus(); }, 50);
    }
  }

  /* The trigger may be a <button> already; replace it with a real button if needed. */
  trigger.setAttribute('aria-label', 'Search');
  trigger.addEventListener('click', function (e) {
    e.preventDefault();
    setOpen(true);
  });
  modal.querySelector('.search-modal__close').addEventListener('click', function () { setOpen(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) setOpen(false);
  });
})();
