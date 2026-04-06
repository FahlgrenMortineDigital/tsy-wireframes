/* ===== WIREFRAME REVIEW COMMENTS =====
   Compact submission-only widget for reviewers to leave feedback.
   Comments are stored via Netlify Functions (shared across all reviewers).
   Badge shows count of active (non-completed) comments for the current page.
   Full comment list, completion workflow, and export live on review-dashboard.html.
*/
(function () {
  var API_BASE = 'https://osueventssite.netlify.app/.netlify/functions';
  var PROJECT = 'fk';
  var STORAGE_KEY = 'fk-review-comments';
  var pageName = document.title.split('—')[0].split('-')[0].trim() || location.pathname.split('/').pop() || 'Unknown Page';
  var pageFile = location.pathname.split('/').pop() || 'index.html';

  /* ---------- localStorage helpers ---------- */
  function getLocalComments() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch (e) { return []; }
  }
  function saveLocalComments(comments) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(comments));
  }
  function getCurrentReviewer() {
    return localStorage.getItem('rc-reviewer-name') || '';
  }
  function getActivePageCount(comments) {
    return comments.filter(function (c) {
      return c.page === pageFile && !c.cleared && !c.completed;
    }).length;
  }

  /* ---------- Server sync ---------- */
  function submitToServer(comment) {
    fetch(API_BASE + '/submit-comment?project=' + PROJECT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page: comment.page,
        pageTitle: comment.pageTitle,
        name: comment.name,
        comment: comment.text,
        timestamp: comment.timestamp
      })
    }).then(function (res) {
      if (res.ok) { console.log('[Review] Comment submitted to server'); }
      else { res.text().then(function (t) { console.warn('[Review] Server status:', res.status, t); }); }
    }).catch(function (err) {
      console.warn('[Review] Could not reach server:', err.message);
    });
  }

  function fetchServerComments() {
    return fetch(API_BASE + '/get-comments?project=' + PROJECT)
      .then(function (res) {
        if (!res.ok) throw new Error('Status ' + res.status);
        return res.json();
      })
      .then(function (data) { return Array.isArray(data) ? data : []; })
      .catch(function (err) {
        console.warn('[Review] Could not fetch from server:', err.message);
        return [];
      });
  }

  /* ---------- Merge & de-duplicate ---------- */
  function mergeComments(serverComments, localComments) {
    var seen = {};
    var merged = [];
    function makeKey(c) { return (c.page || '') + '|' + (c.name || '') + '|' + (c.timestamp || ''); }
    serverComments.forEach(function (c) {
      var k = makeKey(c); if (!seen[k]) { seen[k] = true; merged.push(c); }
    });
    localComments.forEach(function (c) {
      var k = makeKey(c); if (!seen[k]) { seen[k] = true; merged.push(c); }
    });
    return merged;
  }

  /* ---------- Inject styles ---------- */
  var style = document.createElement('style');
  style.textContent =
    '.rc-fab { position: fixed; bottom: 20px; left: 20px; z-index: 10000;' +
    '  width: 48px; height: 48px; border-radius: 50%; background: #3b4fc4;' +
    '  color: #fff; border: none; cursor: pointer; font-size: 20px;' +
    '  display: flex; align-items: center; justify-content: center;' +
    '  box-shadow: 0 3px 12px rgba(0,0,0,0.25); transition: transform 0.15s, background 0.15s; }' +
    '.rc-fab:hover { transform: scale(1.08); background: #2d3ea0; }' +
    '.rc-fab__badge { position: absolute; top: -4px; right: -4px; background: #e53935;' +
    '  color: #fff; font-size: 10px; font-weight: 700; min-width: 18px; height: 18px;' +
    '  border-radius: 9px; display: flex; align-items: center; justify-content: center;' +
    '  padding: 0 4px; font-family: Arial, sans-serif; }' +
    '.rc-panel { position: fixed; bottom: 80px; left: 20px; z-index: 10001;' +
    '  width: 340px; background: #fff; border: 1px solid #ddd;' +
    '  border-radius: 10px; box-shadow: 0 8px 30px rgba(0,0,0,0.18);' +
    '  display: none; flex-direction: column; overflow: hidden;' +
    '  font-family: "Open Sans", Arial, sans-serif; }' +
    '.rc-panel.is-open { display: flex; }' +
    '.rc-panel__header { padding: 14px 16px; background: #3b4fc4; color: #fff;' +
    '  font-size: 13px; font-weight: 700; display: flex; justify-content: space-between; align-items: center; }' +
    '.rc-panel__header-page { font-size: 10px; font-weight: 400; opacity: 0.8; margin-top: 2px; }' +
    '.rc-panel__close { background: none; border: none; color: #fff; font-size: 18px;' +
    '  cursor: pointer; padding: 0 4px; opacity: 0.8; }' +
    '.rc-panel__close:hover { opacity: 1; }' +
    '.rc-panel__form { padding: 12px 16px; background: #fafafa; }' +
    '.rc-panel__row { display: flex; gap: 8px; margin-bottom: 8px; }' +
    '.rc-panel__input { flex: 1; height: 32px; border: 1px solid #ccc; border-radius: 4px;' +
    '  padding: 0 10px; font-size: 12px; font-family: "Open Sans", Arial, sans-serif; }' +
    '.rc-panel__textarea { width: 100%; height: 60px; border: 1px solid #ccc; border-radius: 4px;' +
    '  padding: 8px 10px; font-size: 12px; font-family: "Open Sans", Arial, sans-serif;' +
    '  resize: vertical; margin-bottom: 8px; }' +
    '.rc-panel__actions { display: flex; justify-content: space-between; align-items: center; }' +
    '.rc-panel__submit { background: #3b4fc4; color: #fff; border: none; border-radius: 4px;' +
    '  padding: 7px 16px; font-size: 12px; font-weight: 600; cursor: pointer;' +
    '  font-family: "Open Sans", Arial, sans-serif; }' +
    '.rc-panel__submit:hover { background: #2d3ea0; }' +
    '.rc-panel__sync-note { font-size: 10px; color: #999; text-align: center; margin-top: 6px; }' +
    '.rc-panel__dashboard { font-size: 11px; color: #3b4fc4; text-decoration: underline; cursor: pointer; }' +
    '.rc-panel__dashboard:hover { color: #2d3ea0; }' +
    '.rc-panel__success { font-size: 12px; color: #2e7d32; text-align: center; padding: 10px 0 2px;' +
    '  font-weight: 600; display: none; }';
  document.head.appendChild(style);

  /* ---------- Build FAB ---------- */
  var fab = document.createElement('button');
  fab.className = 'rc-fab';
  fab.innerHTML = '&#128172;';
  var badge = document.createElement('span');
  badge.className = 'rc-fab__badge';
  badge.style.display = 'none';
  badge.textContent = '0';
  fab.appendChild(badge);

  /* ---------- Build panel ---------- */
  var panel = document.createElement('div');
  panel.className = 'rc-panel';
  panel.innerHTML =
    '<div class="rc-panel__header">' +
    '  <div>Leave Feedback<div class="rc-panel__header-page">' + pageName + '</div></div>' +
    '  <button class="rc-panel__close">&times;</button>' +
    '</div>' +
    '<div class="rc-panel__form">' +
    '  <div class="rc-panel__row">' +
    '    <input class="rc-panel__input" id="rc-name" type="text" placeholder="Your name">' +
    '  </div>' +
    '  <textarea class="rc-panel__textarea" id="rc-comment" placeholder="Leave a comment about this page..."></textarea>' +
    '  <div class="rc-panel__success" id="rc-success">Comment submitted!</div>' +
    '  <div class="rc-panel__actions">' +
    '    <a class="rc-panel__dashboard" href="review-dashboard.html">View All Comments</a>' +
    '    <button class="rc-panel__submit" id="rc-submit">Submit</button>' +
    '  </div>' +
    '  <div class="rc-panel__sync-note">Comments are shared with all reviewers</div>' +
    '</div>';

  /* ---------- Badge update ---------- */
  var cachedComments = getLocalComments();

  function updateBadge(comments) {
    var count = getActivePageCount(comments || cachedComments);
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }

  /* ---------- Toggle panel ---------- */
  fab.addEventListener('click', function () {
    panel.classList.toggle('is-open');
    if (panel.classList.contains('is-open')) {
      var savedName = getCurrentReviewer();
      panel.querySelector('#rc-name').value = savedName;
      panel.querySelector('#rc-comment').focus();
      panel.querySelector('#rc-success').style.display = 'none';
    }
  });

  /* ---------- Close ---------- */
  panel.querySelector('.rc-panel__close').addEventListener('click', function () {
    panel.classList.remove('is-open');
  });

  /* ---------- Submit ---------- */
  panel.querySelector('#rc-submit').addEventListener('click', function () {
    var nameInput = panel.querySelector('#rc-name');
    var commentInput = panel.querySelector('#rc-comment');
    var successMsg = panel.querySelector('#rc-success');
    var text = commentInput.value.trim();
    if (!text) return;
    var name = nameInput.value.trim() || 'Anonymous';
    localStorage.setItem('rc-reviewer-name', name);

    var comment = {
      page: pageFile,
      pageTitle: pageName,
      name: name,
      text: text,
      timestamp: new Date().toISOString()
    };

    var local = getLocalComments();
    local.push(comment);
    saveLocalComments(local);
    cachedComments = local;
    updateBadge(cachedComments);
    submitToServer(comment);
    commentInput.value = '';

    // Flash success message
    successMsg.style.display = 'block';
    setTimeout(function () { successMsg.style.display = 'none'; }, 2500);
  });

  /* ---------- Enter key submits ---------- */
  panel.querySelector('#rc-comment').addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      panel.querySelector('#rc-submit').click();
    }
  });

  /* ---------- Persist name ---------- */
  panel.querySelector('#rc-name').addEventListener('change', function () {
    var name = this.value.trim();
    if (name) localStorage.setItem('rc-reviewer-name', name);
  });

  /* ---------- Fetch from server on page load ---------- */
  updateBadge(cachedComments);
  fetchServerComments().then(function (serverComments) {
    if (serverComments.length > 0) {
      var local = getLocalComments();
      var merged = mergeComments(serverComments, local);
      saveLocalComments(merged);
      cachedComments = merged;
      updateBadge(cachedComments);
    }
  });

  document.body.appendChild(fab);
  document.body.appendChild(panel);
})();
