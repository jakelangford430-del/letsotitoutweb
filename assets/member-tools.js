let currentUser = null;
const saveTimers = new Map();

const storageProfiles = {
  jj_workflow_order_v1: { toolSlug: 'workflow-order', title: 'Workflow Order' },
  jj_business_sort_out_map_v1: { toolSlug: 'business-sort-out-map', title: 'Business Sort-Out Map' },
  jj_automation_finder_v1: { toolSlug: 'automation-opportunity-finder', title: 'Automation Opportunity Finder' },
  jj_audit_results: { toolSlug: 'customer-journey-check', title: 'Online Presence Audit' },
  jj_audited_tasks: { toolSlug: 'stop-doing-it-twice', title: 'Stop Doing It Twice' },
  jj_shortlist: { toolSlug: 'software-stack', title: 'Software Stack Shortlist' },
  jj_difficult_conversation_v1: { toolSlug: 'people-hub/difficult-conversation', title: 'Difficult Conversation Planner' },
  jj_constructive_feedback_v1: { toolSlug: 'people-hub/constructive-feedback', title: 'Constructive Feedback Planner' },
  jj_one_on_one_v1: { toolSlug: 'people-hub/one-on-one', title: 'One-on-One Meeting Planner' },
  jj_career_development_v1: { toolSlug: 'people-hub/career-development', title: 'Career Development Planner' },
  jj_internal_role_v1: { toolSlug: 'people-hub/internal-role', title: 'Internal Role Change Planner' },
  jj_hiring_prep_v1: { toolSlug: 'people-hub/hiring-interview-prep', title: 'Hiring & Interview Prep Builder' },
  jj_performance_conv_v1: { toolSlug: 'people-hub/performance-conversation', title: 'Performance Conversation Builder' },
  jj_onboarding_plan_v1: { toolSlug: 'people-hub/onboarding-plan', title: 'New Starter Onboarding Plan' },
  jj_toolbox_talk_v1: { toolSlug: 'people-hub/toolbox-talk', title: 'Toolbox Talk & Meeting Agenda' },
  jj_gworkspace_sales_v1: { toolSlug: 'google-workspace-for-sales', title: 'Google Workspace & Sheets for Sales' },
};

const storageProfile = (key) => {
  if (storageProfiles[key]) return storageProfiles[key];
  if (key.startsWith('lets-sort-it-out-')) return { toolSlug: 'business-thinking', title: 'Business Thinking Tools' };
  return null;
};

const toolSlug = () => window.location.pathname.replace(/^\/+|\/+$/g, '') || 'home';

const pageTitle = () => {
  const heading = document.querySelector('h1');
  return heading?.textContent?.replace(/\s+/g, ' ').trim() || document.title.split('|')[0].trim() || 'Saved result';
};

const resultSummary = () => {
  const selectors = ['#result-summary', '[data-result-summary]', '.result-summary', '.verdict', '.score-card h2'];
  for (const selector of selectors) {
    const text = document.querySelector(selector)?.textContent?.replace(/\s+/g, ' ').trim();
    if (text) return text.slice(0, 500);
  }
  return 'Saved from your latest visit to this tool.';
};

const resultStatus = () => {
  const result = document.querySelector('#result-view, #results-view, [data-results], .results-view');
  return result && !result.classList.contains('hidden') && !result.hasAttribute('hidden') ? 'completed' : 'in_progress';
};

const postResult = async (save) => {
  if (!currentUser || !save) return;
  try {
    const response = await fetch('/api/member-data', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'result', ...save }),
    });
    if (!response.ok) {
      // fetch only rejects on network failure, so a rejected save has to be checked
      // explicitly — otherwise a 401 or 500 is reported to the page as a success.
      document.dispatchEvent(new CustomEvent('lsio:result-save-error', { detail: { status: response.status } }));
      return;
    }
    document.dispatchEvent(new CustomEvent('lsio:result-saved', { detail: save }));
  } catch {
    document.dispatchEvent(new CustomEvent('lsio:result-save-error', { detail: { status: 0 } }));
  }
};

const queueResult = (payload, options = {}) => {
  if (!currentUser) return;
  const slug = options.toolSlug || toolSlug();
  // The summary and status are read out of the current page, so they only describe the
  // tool you are actually looking at. When syncing a stored result that belongs to a
  // different tool, leave them out and let the saved values stand.
  const describesThisPage = slug === toolSlug();
  const save = {
    toolSlug: slug,
    resultKey: options.resultKey || 'latest',
    title: options.title || pageTitle(),
    payload,
  };
  if (options.status) save.status = options.status;
  else if (describesThisPage) save.status = resultStatus();
  if (describesThisPage) save.summary = resultSummary();

  const timerKey = `${save.toolSlug}:${save.resultKey}`;
  window.clearTimeout(saveTimers.get(timerKey));
  saveTimers.set(timerKey, window.setTimeout(() => postResult(save), 500));
};

const originalSetItem = Storage.prototype.setItem;
Storage.prototype.setItem = function patchedSetItem(key, value) {
  originalSetItem.call(this, key, value);
  const profile = storageProfile(key);
  if (this !== window.localStorage || !profile) return;
  let payload = value;
  try {
    payload = JSON.parse(value);
  } catch {}
  queueResult(payload, { ...profile, resultKey: 'latest' });
};

export const configureMemberTools = (user) => {
  currentUser = user;
  if (!user) return;

  Object.keys(window.localStorage)
    .filter((key) => storageProfile(key))
    .forEach((key) => {
      const profile = storageProfile(key);
      let payload = window.localStorage.getItem(key);
      try {
        payload = JSON.parse(payload);
      } catch {}
      queueResult(payload, { ...profile, resultKey: 'latest' });
    });
};

const originalTracker = window.trackToolCompletion;
if (typeof originalTracker === 'function') {
  window.trackToolCompletion = (name, details = {}) => {
    originalTracker(name, details);
    window.setTimeout(() => queueResult({ completion: details }, { resultKey: 'latest', status: 'completed' }), 0);
  };
}

window.LSIO_MEMBER = {
  saveResult(payload, options = {}) {
    queueResult(payload, options);
  },
};
