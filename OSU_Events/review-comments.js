/* ===== WIREFRAME REVIEW COMMENTS =====
   Floating chat-style widget for reviewers to leave feedback.
   Comments submitted to Netlify Forms (shared across all reviewers)
   and cached in localStorage for instant local display.
*/
(function () {
  var STORAGE_KEY = 'wireframe-review-comments';
  var pageName = document.title.split('—')[0].trim() || location.pathname.split('/').pop() || 'Unknown Page';
  var pageFile = location.pathname.split('/').pop() || 'index.html';

  function getLocalComments() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch (e) { return []; }
  }
  function saveLocalComment(comment) {
    var comments = getLocalComments();
    comments.push(comment);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(comments));
  }
  function getPageCommentCount() {
    return getLocalComments().filter(function (c) { return c.page === pageFile; }).length;
  }

  // Submit to Netlify Function (serverless endpoint that stores comments)
  function submitToNetlify(comment) {
    fetch('/.netlify/functions/submit-comment', {
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
      if (res.ok) {
        console.log('[Review] Comment submitted to server');
      } else {
        res.text().then(function (t) {
          console.warn('[Review] Server returned status:', res.status, t);
        });
      }
    }).catch(function (err) {
      console.warn('[Review] Could not reach server (local dev?):', err.message);
    });
  }

  // Inject styles
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
    '  width: 340px; max-height: 480px; background: #fff; border: 1px solid #ddd;' +
    '  border-radius: 10px; box-shadow: 0 8px 30px rgba(0,0,0,0.18);' +
    '  display: none; flex-direction: column; overflow: hidden;' +
    '  font-family: "BuckeyeSans", Arial, sans-serif; }' +
    '.rc-panel.is-open { display: flex; }' +
    '.rc-panel__header { padding: 14px 16px; background: #3b4fc4; color: #fff;' +
    '  font-size: 13px; font-weight: 700; display: flex; justify-content: space-between; align-items: center; }' +
    '.rc-panel__header-page { font-size: 10px; font-weight: 400; opacity: 0.8; margin-top: 2px; }' +
    '.rc-panel__close { background: none; border: none; color: #fff; font-size: 18px;' +
    '  cursor: pointer; padding: 0 4px; opacity: 0.8; }' +
    '.rc-panel__close:hover { opacity: 1; }' +
    '.rc-panel__messages { flex: 1; overflow-y: auto; padding: 12px 16px;' +
    '  max-height: 260px; min-height: 80px; }' +
    '.rc-panel__empty { color: #aaa; font-size: 12px; text-align: center; padding: 24px 0; }' +
    '.rc-msg { margin-bottom: 12px; padding: 10px 12px; background: #f5f5f5;' +
    '  border-radius: 8px; font-size: 12px; line-height: 1.5; color: #333; }' +
    '.rc-msg__meta { font-size: 10px; color: #999; margin-top: 4px;' +
    '  display: flex; justify-content: space-between; }' +
    '.rc-panel__form { padding: 12px 16px; border-top: 1px solid #eee; background: #fafafa; }' +
    '.rc-panel__row { display: flex; gap: 8px; margin-bottom: 8px; }' +
    '.rc-panel__input { flex: 1; height: 32px; border: 1px solid #ccc; border-radius: 4px;' +
    '  padding: 0 10px; font-size: 12px; font-family: "BuckeyeSans", Arial, sans-serif; }' +
    '.rc-panel__textarea { width: 100%; height: 60px; border: 1px solid #ccc; border-radius: 4px;' +
    '  padding: 8px 10px; font-size: 12px; font-family: "BuckeyeSans", Arial, sans-serif;' +
    '  resize: vertical; margin-bottom: 8px; }' +
    '.rc-panel__actions { display: flex; justify-content: space-between; align-items: center; }' +
    '.rc-panel__submit { background: #3b4fc4; color: #fff; border: none; border-radius: 4px;' +
    '  padding: 7px 16px; font-size: 12px; font-weight: 600; cursor: pointer;' +
    '  font-family: "BuckeyeSans", Arial, sans-serif; }' +
    '.rc-panel__submit:hover { background: #2d3ea0; }' +
    '.rc-panel__netlify-note { font-size: 10px; color: #999; text-align: center; margin-top: 6px; }' +
    '.rc-panel__dashboard { font-size: 11px; color: #3b4fc4; text-decoration: underline; cursor: pointer; }' +
    '.rc-panel__dashboard:hover { color: #2d3ea0; }';
  document.head.appendChild(style);

  // Build FAB button
  var fab = document.createElement('button');
  fab.className = 'rc-fab';
  fab.innerHTML = '&#128172;';
  var badge = document.createElement('span');
  badge.className = 'rc-fab__badge';
  var count = getPageCommentCount();
  badge.textContent = count;
  badge.style.display = count > 0 ? 'flex' : 'none';
  fab.appendChild(badge);

  // Build panel
  var panel = document.createElement('div');
  panel.className = 'rc-panel';
  panel.innerHTML =
    '<div class="rc-panel__header">' +
    '  <div>Review Comments<div class="rc-panel__header-page">' + pageName + '</div></div>' +
    '  <button class="rc-panel__close">&times;</button>' +
    '</div>' +
    '<div class="rc-panel__messages"></div>' +
    '<div class="rc-panel__form">' +
    '  <div class="rc-panel__row">' +
    '    <input class="rc-panel__input" id="rc-name" type="text" placeholder="Your name">' +
    '  </div>' +
    '  <textarea class="rc-panel__textarea" id="rc-comment" placeholder="Leave a comment about this page..."></textarea>' +
    '  <div class="rc-panel__actions">' +
    '    <a class="rc-panel__dashboard" href="review-dashboard.html">View All Comments</a>' +
    '    <button class="rc-panel__submit" id="rc-submit">Submit</button>' +
    '  </div>' +
    '  <div class="rc-panel__netlify-note">Comments are shared with all reviewers via Netlify</div>' +
    '</div>';

  function renderMessages() {
    var container = panel.querySelector('.rc-panel__messages');
    var pageComments = getLocalComments().filter(function (c) { return c.page === pageFile; });
    if (pageComments.length === 0) {
      container.innerHTML = '<div class="rc-panel__empty">No comments on this page yet.</div>';
    } else {
      container.innerHTML = pageComments.map(function (c) {
        var d = new Date(c.timestamp);
        var time = d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return '<div class="rc-msg">' +
          '<div>' + c.text.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</div>' +
          '<div class="rc-msg__meta"><span>' + (c.name || 'Anonymous').replace(/</g, '&lt;') + '</span><span>' + time + '</span></div>' +
          '</div>';
      }).join('');
      container.scrollTop = container.scrollHeight;
    }
    count = pageComments.length;
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }

  // Toggle panel
  fab.addEventListener('click', function () {
    panel.classList.toggle('is-open');
    if (panel.classList.contains('is-open')) {
      renderMessages();
      var savedName = localStorage.getItem('rc-reviewer-name') || '';
      panel.querySelector('#rc-name').value = savedName;
      panel.querySelector('#rc-comment').focus();
    }
  });

  // Close button
  panel.querySelector('.rc-panel__close').addEventListener('click', function () {
    panel.classList.remove('is-open');
  });

  // Submit — saves locally AND sends to Netlify Forms
  panel.querySelector('#rc-submit').addEventListener('click', function () {
    var nameInput = panel.querySelector('#rc-name');
    var commentInput = panel.querySelector('#rc-comment');
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

    // Save locally for instant display
    saveLocalComment(comment);
    // Submit to Netlify Forms for shared visibility
    submitToNetlify(comment);

    commentInput.value = '';
    renderMessages();
  });

  // Enter key submits (shift+enter for newline)
  panel.querySelector('#rc-comment').addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      panel.querySelector('#rc-submit').click();
    }
  });

  document.body.appendChild(fab);
  document.body.appendChild(panel);
})();
