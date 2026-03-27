/* ===== BUX LABEL TOGGLE =====
   Adds a toggle button to show/hide all .bux-label pill components.
   State persists across pages via localStorage.
*/
(function () {
  var STORAGE_KEY = 'bux-labels-visible';
  var visible = localStorage.getItem(STORAGE_KEY) !== 'false'; // default: visible

  // Inject CSS rule for hiding labels
  var style = document.createElement('style');
  style.textContent =
    'body.hide-labels .bux-label { display: none !important; }' +
    '.label-toggle { position: fixed; bottom: 20px; right: 20px; z-index: 9999;' +
    '  display: flex; align-items: center; gap: 8px; background: #fff;' +
    '  border: 1px solid #ccc; border-radius: 6px; padding: 8px 14px;' +
    '  box-shadow: 0 2px 8px rgba(0,0,0,0.12); cursor: pointer;' +
    '  font-family: "BuckeyeSans", Arial, sans-serif; font-size: 12px;' +
    '  font-weight: 600; color: #555; user-select: none; transition: box-shadow 0.15s; }' +
    '.label-toggle:hover { box-shadow: 0 3px 12px rgba(0,0,0,0.18); }' +
    '.label-toggle__switch { width: 34px; height: 18px; border-radius: 9px;' +
    '  background: #ccc; position: relative; transition: background 0.2s; flex-shrink: 0; }' +
    '.label-toggle__switch.is-on { background: #3b4fc4; }' +
    '.label-toggle__knob { width: 14px; height: 14px; border-radius: 50%;' +
    '  background: #fff; position: absolute; top: 2px; left: 2px;' +
    '  transition: left 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.2); }' +
    '.label-toggle__switch.is-on .label-toggle__knob { left: 18px; }';
  document.head.appendChild(style);

  // Apply initial state
  if (!visible) document.body.classList.add('hide-labels');

  // Build toggle button
  var btn = document.createElement('div');
  btn.className = 'label-toggle';
  btn.innerHTML =
    '<div class="label-toggle__switch' + (visible ? ' is-on' : '') + '">' +
    '  <div class="label-toggle__knob"></div>' +
    '</div>' +
    '<span>BUX</span>';

  btn.addEventListener('click', function () {
    visible = !visible;
    localStorage.setItem(STORAGE_KEY, visible);
    document.body.classList.toggle('hide-labels', !visible);
    btn.querySelector('.label-toggle__switch').classList.toggle('is-on', visible);
  });

  document.body.appendChild(btn);
})();
