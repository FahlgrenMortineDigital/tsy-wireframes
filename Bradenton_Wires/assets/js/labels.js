/* Bradenton wireframes — runtime helpers.
   This file is loaded at the END of <body>, so the DOM is already
   parsed when each block runs — no DOMContentLoaded wrapper needed.
   Same pattern as the FK reference. */


/* ============================================================
   1) HEADER AUTO-HIDE on scroll-down, reveal on scroll-up.
   Mirrors FK exactly: class on the .site-header element,
   requestAnimationFrame, DELTA=8, MIN_Y=100.
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
   2) COMPONENT PILL LABELS — visible by default.
   Inject an <a class="lib-label"> into every [data-component]
   element, linking to its anchor on project-components.html.
   The floating .label-toggle adds body.hide-labels to hide them.
   ============================================================ */
(function () {
  var STORAGE_KEY = 'bgi-lib-labels-visible';
  var body = document.body;

  /* Components we deliberately don't pill — they're sub-chrome of
     elements that already carry a parent pill (SITE_HEADER, etc.)
     and an extra pill in the header just clutters the layout. */
  var SKIP_INJECT = { PRIMARY_NAV: 1, UTILITY_NAV: 1 };

  /* Inject pills */
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

  /* Read stored state, default = visible */
  var visible = true;
  try { visible = localStorage.getItem(STORAGE_KEY) !== 'false'; } catch (e) {}

  function apply(v) {
    body.classList.toggle('hide-labels', !v);
    var sw = document.querySelector('.label-toggle__switch');
    if (sw) sw.classList.toggle('is-on', v);
  }
  apply(visible);

  /* Bind the switch */
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
   3) NAV DROPDOWNS (desktop hover + mobile inline expand)
   Wraps each existing primary-nav <a> in a .primary-nav__item.
   When the link's label matches a key in the NAV_TREE, the wrapper
   gets .has-children, an expand button, and a panel of child links.
   ============================================================ */
(function () {
  var nav = document.querySelector('.site-header .primary-nav');
  if (!nav) return;

  var LEISURE_NAV = {
    'Discover': [
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
    ],
    'Beaches': [
      { label: 'Beach Cams',              href: 'beaches.html#cams' },
      { label: 'Beach Conditions',        href: 'beaches.html#cams' },
      { label: 'Beach Finder Quiz',       href: 'beaches.html#quiz' }
    ],
    'See & Do': [
      { label: 'Arts & Culture',          href: '#' },
      { label: 'Outdoor Adventures',      href: 'see-do-outdoor-adventures.html' },
      { label: 'Boutiques & Markets',     href: '#' },
      { label: 'Spas & Wellness',         href: '#' },
      { label: 'Activities & Learning',   href: '#' },
      { label: 'Golf',                    href: '#' }
    ],
    'Eat & Drink': [
      { label: 'Floribbean Cuisine',      href: 'eat-drink-floribbean.html' },
      { label: 'Toes in the Sand',        href: '#' },
      { label: 'Breakfast & Brunch',      href: '#' },
      { label: 'International Flavors',   href: '#' },
      { label: 'Local Breweries & Distilleries', href: '#' },
      { label: 'Sweets & Treats',         href: '#' },
      { label: 'Date Night',              href: '#' },
      { label: 'Family Friendly',         href: '#' }
    ],
    'Stay': [
      { label: 'Hotels & Resorts',        href: 'stay-hotels-resorts.html' },
      { label: 'Vacation Rentals',        href: '#' },
      { label: 'Camping & RV',            href: '#' }
    ],
    'Plan': [
      { label: 'AI Trip Planner',         href: 'plan.html' },
      { label: 'Itineraries',             href: 'plan.html#itineraries' },
      { label: 'Visitor Guides',          href: 'plan.html#guide' },
      { label: 'Getting Here & Around',   href: 'plan.html#getting-here' },
      { label: 'Nonstop Flights',         href: 'plan.html#flights' },
      { label: 'Ferry Guide',             href: 'plan-ferry-guide.html' }
    ],
    'Events': [
      { label: 'Events Calendar',         href: 'events.html' },
      { label: 'Seasonal Events',         href: 'events.html#seasons' }
    ]
    /* Guides & Stories lives in utility nav per the FY27 IA — the
       guides-stories.html index links to all stories including:
         · guide-anna-maria-first-timer.html
         · guide-floribbean-101.html
         · guide-naturalist-robinson-preserve.html */
  };

  var MEETINGS_NAV = {
    'Why the Bradenton Area': [
      { label: 'Dining',                  href: 'why-bradenton.html#dining' },
      { label: 'Things To Do',            href: 'why-bradenton.html#things-to-do' },
      { label: 'Meet the Team',           href: 'why-bradenton.html#team' }
    ],
    'Convention Center Services': [
      { label: 'Venue Details',           href: 'convention-center.html#venue' },
      { label: 'Floor Plans',             href: 'convention-center-floor-plans.html' },
      { label: 'Food & Beverage',         href: 'convention-center.html#fb' },
      { label: 'Meeting Planner Guide',   href: 'convention-center.html#guide' },
      { label: 'Planner Resources',       href: 'convention-center.html#resources' }
    ],
    'Event Hosting & Lodging': [
      { label: 'Headquarters Hotel',      href: 'event-hosting-headquarters-hotel.html' },
      { label: 'Nearby Hotels',           href: 'event-hosting.html#nearby' },
      { label: 'Powel Crosley Estate',    href: 'event-hosting-powel-crosley.html' }
    ],
    'Articles': [
      { label: 'For Planners',            href: 'article-5-reasons.html' },
      { label: 'For Attendees',           href: 'article-8-ways-extra-day.html' },
      { label: 'Dine-Around Guide',       href: 'article-best-dine-arounds.html' },
      { label: 'Team-Building Ideas',     href: 'article-team-building.html' }
    ],
    'Events': [
      { label: 'Upcoming Events',         href: 'events.html#upcoming' },
      { label: 'Trade Shows',             href: 'events.html#trade-shows' },
      { label: 'Consumer Expos',          href: 'events.html#consumer' },
      { label: 'Corporate & Convention',  href: 'events.html#corporate' },
      { label: 'Featured Event',          href: 'event-detail-fl-restaurant-show.html' }
    ]
  };

  var tree = document.body.classList.contains('meetings') ? MEETINGS_NAV : LEISURE_NAV;

  var children = Array.prototype.slice.call(nav.children);
  children.forEach(function (link) {
    if (link.tagName !== 'A') return;
    /* Skip the auto-injected component pill so it doesn't get wrapped
       in a primary-nav__item and dragged into the flex layout. */
    if (link.classList.contains('lib-label')) return;
    var label = link.textContent.trim();
    var items = tree[label];

    var wrapper = document.createElement('div');
    wrapper.className = 'primary-nav__item';
    nav.insertBefore(wrapper, link);
    wrapper.appendChild(link);

    if (!items || !items.length) return;

    wrapper.classList.add('has-children');

    /* Mobile expand button */
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'primary-nav__expand';
    btn.setAttribute('aria-label', 'Show ' + label + ' submenu');
    wrapper.appendChild(btn);

    /* Panel */
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
      /* Close other open dropdowns */
      nav.querySelectorAll('.primary-nav__item.is-expanded').forEach(function (other) {
        if (other !== wrapper) other.classList.remove('is-expanded');
      });
      wrapper.classList.toggle('is-expanded');
    });
  });
})();


/* ============================================================
   4) MOBILE MENU DRAWER
   - Toggles the drawer + a body scroll-lock + the menu button label.
   - Closes when a link is tapped or the Escape key is pressed.
   ============================================================ */
(function () {
  var menuBtn = document.querySelector('.menu-btn');
  var nav = document.querySelector('.primary-nav');
  if (!menuBtn || !nav) return;

  /* Cache the original menu-btn text so we can restore it on close. */
  var originalLabel = menuBtn.textContent.trim() || 'Menu';

  function setOpen(open) {
    nav.classList.toggle('is-open', open);
    menuBtn.classList.toggle('is-active', open);
    document.body.classList.toggle('nav-locked', open);
    menuBtn.textContent = open ? 'Close' : originalLabel;
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  setOpen(false);

  menuBtn.addEventListener('click', function () {
    setOpen(!nav.classList.contains('is-open'));
  });

  /* Tap a link → close drawer (let the click navigate) */
  nav.addEventListener('click', function (e) {
    var t = e.target;
    while (t && t !== nav) {
      if (t.tagName === 'A') { setOpen(false); return; }
      t = t.parentNode;
    }
  });

  /* Escape closes */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) setOpen(false);
  });
})();
