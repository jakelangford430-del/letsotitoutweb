import { getUser } from './vendor/netlify-identity.js';

const dashboard = document.querySelector('[data-signed-in]');
let dashboardLoaded = false;
let filesLoaded = false;

const formatDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'recently';
  return new Intl.DateTimeFormat('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
};

const escapeHtml = (value) =>
  String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const titleFromSlug = (slug) =>
  slug
    .split('/')
    .filter(Boolean)
    .at(-1)
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

const showDashboardError = (message) => {
  const resultsLoading = document.querySelector('[data-results-loading]');
  const contentLoading = document.querySelector('[data-content-loading]');
  if (resultsLoading) resultsLoading.textContent = message;
  if (contentLoading) contentLoading.textContent = message;
};

const renderResults = (results) => {
  const list = document.querySelector('[data-results-list]');
  const loading = document.querySelector('[data-results-loading]');
  loading.hidden = true;
  document.querySelector('[data-result-count]').textContent = results.length;
  document.querySelector('[data-complete-count]').textContent = results.filter((result) => result.status === 'completed').length;

  if (!results.length) {
    list.innerHTML = `
      <div class="member-empty">
        <strong>No saved work yet.</strong>
        <p>Use any free tool. Save the useful bits, then pick them up here next time.</p>
        <a class="auth-submit" href="/free-tools/">Find a tool that helps</a>
      </div>`;
    return;
  }

  list.innerHTML = results
    .map(
      (result) => `
        <article class="member-result" data-result-id="${escapeHtml(result.id)}">
          <div class="member-result__status member-result__status--${result.status}">${result.status === 'completed' ? 'Finished' : 'In progress'}</div>
          <div class="member-result__body">
            <h4>${escapeHtml(result.title || titleFromSlug(result.tool_slug))}</h4>
            <p>${escapeHtml(result.summary || 'Your latest saved answers are ready when you are.')}</p>
            <span>Updated ${formatDate(result.updated_at)}</span>
          </div>
          <div class="member-result__actions">
            <a href="/${escapeHtml(result.tool_slug)}/">${result.status === 'completed' ? 'Open result' : 'Keep going'}</a>
            <button type="button" data-delete-result="${escapeHtml(result.id)}">Delete</button>
          </div>
        </article>`,
    )
    .join('');
};

const markContentViewed = async (contentSlug) => {
  try {
    await fetch('/api/member-data', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'content_view', contentSlug }),
    });
  } catch {}
};

const renderContent = (catalogue, contentViews) => {
  const list = document.querySelector('[data-content-list]');
  const loading = document.querySelector('[data-content-loading]');
  const viewed = new Set(contentViews.map((item) => item.content_slug));
  const newItems = catalogue.filter((item) => !viewed.has(item.slug));
  loading.hidden = true;
  document.querySelector('[data-new-count]').textContent = newItems.length;

  list.innerHTML = catalogue
    .slice(0, 6)
    .map(
      (item) => `
        <a class="member-content" href="${escapeHtml(item.href)}" data-content-slug="${escapeHtml(item.slug)}">
          <div><span>${escapeHtml(item.category)}</span>${viewed.has(item.slug) ? '' : '<b>New</b>'}</div>
          <h4>${escapeHtml(item.title)}</h4>
          <p>${escapeHtml(item.description)}</p>
          <small>Added ${formatDate(item.publishedAt)}</small>
        </a>`,
    )
    .join('');

  list.querySelectorAll('[data-content-slug]').forEach((link) => {
    link.addEventListener('click', () => markContentViewed(link.dataset.contentSlug));
  });
};

const loadDashboard = async () => {
  if (!dashboard || dashboardLoaded) return;
  dashboardLoaded = true;
  try {
    const [memberResponse, contentResponse] = await Promise.all([
      fetch('/api/member-data', { credentials: 'same-origin' }),
      fetch('/content-catalog.json', { cache: 'no-cache' }),
    ]);
    if (!memberResponse.ok) throw new Error('member-data');
    const memberData = await memberResponse.json();
    const catalogue = await contentResponse.json();
    renderResults(memberData.results || []);
    renderContent(catalogue || [], memberData.contentViews || []);
  } catch {
    showDashboardError('Your dashboard could not load. Refresh the page, and if it is still being difficult, tell Jake.');
  }
};

const formatBytes = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const renderFiles = (files) => {
  const list = document.querySelector('[data-files-list]');
  const loading = document.querySelector('[data-files-loading]');
  if (!list || !loading) return;
  loading.hidden = true;

  if (!files.length) {
    list.innerHTML = `<div class="member-empty"><strong>No files uploaded yet.</strong><p>Only upload something when you want Jake to take a proper look at it.</p></div>`;
    return;
  }

  list.innerHTML = files
    .map(
      (file) => `
        <article class="member-file" data-file-id="${escapeHtml(file.id)}">
          <div class="member-file__body">
            <h4>${escapeHtml(file.filename)}</h4>
            ${file.note ? `<p>${escapeHtml(file.note)}</p>` : ''}
            <span>${formatBytes(file.size_bytes)} · Uploaded ${formatDate(file.created_at)}</span>
          </div>
          <button type="button" data-delete-file="${escapeHtml(file.id)}">Delete</button>
        </article>`,
    )
    .join('');
};

const loadFiles = async () => {
  const list = document.querySelector('[data-files-list]');
  if (!list) return;
  try {
    const response = await fetch('/api/member-files', { credentials: 'same-origin' });
    if (!response.ok) throw new Error('member-files');
    const data = await response.json();
    renderFiles(data.files || []);
  } catch {
    const loading = document.querySelector('[data-files-loading]');
    if (loading) loading.textContent = 'Your files could not load. Refresh the page and try again.';
  }
};

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

document.querySelector('[data-upload-form]')?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const fileInput = form.querySelector('#file-upload-input');
  const noteInput = form.querySelector('#file-upload-note');
  const file = fileInput?.files?.[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    window.alert('That file is over 5MB. Please choose a smaller file.');
    return;
  }

  const submitButton = form.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = 'Uploading…';

  try {
    const base64 = await fileToBase64(file);
    const response = await fetch('/api/member-files', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type || 'application/octet-stream',
        note: noteInput?.value || '',
        data: base64,
      }),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.error || 'upload failed');
    }
    form.reset();
    await loadFiles();
  } catch (error) {
    window.alert(error.message && error.message !== 'upload failed' ? error.message : 'That upload did not work. Please try again.');
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Upload file';
  }
});

document.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-delete-file]');
  if (!button) return;
  button.disabled = true;
  button.textContent = 'Deleting…';
  try {
    const response = await fetch(`/api/member-files?fileId=${encodeURIComponent(button.dataset.deleteFile)}`, {
      method: 'DELETE',
      credentials: 'same-origin',
    });
    if (!response.ok) throw new Error('delete');
    button.closest('[data-file-id]').remove();
  } catch {
    button.disabled = false;
    button.textContent = 'Try again';
  }
});

document.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-delete-result]');
  if (!button) return;
  button.disabled = true;
  button.textContent = 'Deleting…';
  try {
    const response = await fetch(`/api/member-data?resultId=${encodeURIComponent(button.dataset.deleteResult)}`, {
      method: 'DELETE',
      credentials: 'same-origin',
    });
    if (!response.ok) throw new Error('delete');
    button.closest('[data-result-id]').remove();
  } catch {
    button.disabled = false;
    button.textContent = 'Try again';
  }
});

// Both the auth-ready event and the direct getUser() check can fire, whichever resolves
// first. loadDashboard guards itself; the file list needs the same so it is not fetched
// twice on every visit (loadFiles stays re-callable for uploads and deletes).
const bootstrapMemberViews = () => {
  loadDashboard();
  if (filesLoaded) return;
  filesLoaded = true;
  loadFiles();
};

document.addEventListener('lsio:auth-ready', (event) => {
  if (event.detail.user) bootstrapMemberViews();
});

getUser().then((user) => {
  if (user) bootstrapMemberViews();
});
