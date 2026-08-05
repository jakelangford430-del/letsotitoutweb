const STORAGE_KEY = "jj_business_sort_out_map_v1";
const state = { step: 0, answers: {} };
const $ = (id) => document.getElementById(id);
const views = ["intro", "question-view", "result-view"];
const scrollBehavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";

const categories = {
  customer: {
    label: "Customer path",
    plain: "customer path",
    why: "Customers are waiting, chasing, dropping off or getting mixed messages.",
    first48: ["Test the full enquiry path on a phone.", "Write the three messages customers need most.", "Remove one delay between enquiry and response."],
    thirty: ["Create one enquiry-to-booking flow.", "Lock in response times and owners.", "Track missed enquiries and follow-ups weekly."],
    avoid: "Do not spend more on ads until the enquiry and follow-up path is clean.",
    tools: [["Online Presence Audit", "../customer-journey-check/", "Check trust, contact and enquiry friction."], ["Stop Doing It Twice", "../stop-doing-it-twice/", "Find repeat customer follow-up work."]]
  },
  admin: {
    label: "Admin handover",
    plain: "admin handover",
    why: "The same information is being copied, checked, chased or held in someone's head.",
    first48: ["Write the current steps exactly as they happen.", "Circle every duplicate entry or manual check.", "Pick one source of truth for the workflow."],
    thirty: ["Cut or combine repeat steps.", "Create a simple checklist for the handover.", "Review the workflow after five real jobs or customer cases."],
    avoid: "Do not build automation over a process nobody can explain in plain English.",
    tools: [["Stop Doing It Twice", "../stop-doing-it-twice/", "Estimate the cost of duplicate work."], ["Workflow Order Tool", "../workflow-order/", "Put messy process fixes in order."]]
  },
  people: {
    label: "People consistency",
    plain: "people consistency",
    why: "People are doing the work differently, waiting for one person or guessing what good looks like.",
    first48: ["Choose one repeat task and define the standard.", "Name who owns the handover.", "Have the short conversation before changing the system."],
    thirty: ["Create a one-page way of working.", "Run two short check-ins on what is working.", "Make the follow-up visible so it does not rely on memory."],
    avoid: "Do not make this a software problem if people have not been shown the expected way to do the work.",
    tools: [["People Hub", "../people-hub/", "Use workplace tools for clearer conversations."], ["Prepare for a One-on-One", "../people-hub/one-on-one/", "Plan the next people conversation."]]
  },
  systems: {
    label: "Systems setup",
    plain: "systems setup",
    why: "The tools are not connected, not trusted or not being used consistently.",
    first48: ["List every system used in the workflow.", "Mark what each tool is meant to own.", "Stop one unnecessary copy-and-paste step."],
    thirty: ["Decide the source of truth.", "Clean the fields, templates or automations that cause rework.", "Train the team on the final version."],
    avoid: "Do not add another app until you know what the current stack is meant to do.",
    tools: [["No-BS Software Stack", "../software-stack/", "Choose tools without creating a mess."], ["Automation Opportunity Finder", "../automation-opportunity-finder/", "Check what is actually worth automating."]]
  },
  money: {
    label: "Money flow",
    plain: "money flow",
    why: "Quotes, approvals, invoices, payments or revenue follow-up are slower than they should be.",
    first48: ["Map quote to payment in five steps or fewer.", "Find where money waits for a person to remember.", "Write the reminder or approval message that is missing."],
    thirty: ["Standardise quote follow-up.", "Make unpaid or unapproved work visible weekly.", "Check where missed add-ons or revenue leaks occur."],
    avoid: "Do not chase growth while basic quote, invoice or payment follow-up is leaking money.",
    tools: [["Workflow Order Tool", "../workflow-order/", "Decide what money process comes first."], ["Automation Opportunity Finder", "../automation-opportunity-finder/", "Pilot reminders or handoff automation."]]
  },
  risk: {
    label: "Risk and compliance",
    plain: "risk and compliance",
    why: "There are signs of privacy, safety, employment, payroll, customer promise or compliance exposure.",
    first48: ["Stop relying on memory for the risky step.", "Document what is happening and who owns it.", "Check the issue against the right Australian source."],
    thirty: ["Create a simple control or approval point.", "Train the people involved.", "Review the risk monthly until it is boring."],
    avoid: "Do not treat regulated work as a normal admin tidy-up. Get the right advice where needed.",
    tools: [["Australian Workplace Resources", "../people-hub/workplace-resources/", "Use proper workplace links for people issues."], ["Business Thinking Tools", "../business-thinking/", "Separate facts, risks and options."]]
  },
  training: {
    label: "Training and adoption",
    plain: "training and adoption",
    why: "People need clearer guidance, simpler steps or better support to use the process properly.",
    first48: ["Pick the one task people get wrong most often.", "Write the expected steps in plain language.", "Test the instruction with someone who is not an expert."],
    thirty: ["Create a short onboarding or refresher flow.", "Use screenshots, examples and checklists.", "Review completion by real-world behaviour, not attendance."],
    avoid: "Do not dump a long document on mixed teams and call it training.",
    tools: [["People Hub", "../people-hub/", "Keep people guidance separate and practical."], ["The No-BS AI Guide", "../ai-guide/", "Create plain-English training prompts and checklists."]]
  }
};

const questions = [
  {
    id: "business",
    title: "What kind of business is this?",
    help: "Pick the closest fit. This only shapes the guidance.",
    options: [
      ["trade", "Trade, building or field service", { customer: 1, admin: 1, systems: 1, training: 1 }],
      ["retail", "Retail, hospitality or local service", { customer: 2, money: 1, people: 1 }],
      ["professional", "Professional or office-based service", { customer: 1, admin: 1, money: 1 }],
      ["online", "Online, e-commerce or digital service", { customer: 2, systems: 1, money: 1 }],
      ["internal", "Internal operations or support team", { admin: 1, people: 2, training: 1 }],
      ["mixed", "A bit of everything", { admin: 1, systems: 1 }]
    ]
  },
  {
    id: "team",
    title: "How many people touch the work?",
    help: "Include owners, casuals, contractors and anyone who helps regularly.",
    options: [
      ["solo", "Just me", { admin: 1, systems: 1 }],
      ["tiny", "2 to 5 people", { people: 1, training: 1 }],
      ["small", "6 to 15 people", { people: 2, training: 2, systems: 1 }],
      ["growing", "16 to 40 people", { people: 3, training: 3, systems: 2, risk: 1 }],
      ["larger", "More than 40 people", { people: 3, training: 3, risk: 2, systems: 2 }]
    ]
  },
  {
    id: "stage",
    title: "What stage are you in?",
    help: "This keeps the advice realistic for the amount of change you can handle.",
    options: [
      ["starting", "Starting or rebuilding the basics", { admin: 2, systems: 1, money: 1 }],
      ["steady", "Steady, but too manual", { admin: 2, systems: 1 }],
      ["growing", "Growing and starting to wobble", { people: 2, training: 2, systems: 1 }],
      ["stretched", "Stretched and reactive", { admin: 2, people: 2, risk: 1 }],
      ["cleanup", "Cleaning up a messy setup", { systems: 2, admin: 2 }]
    ]
  },
  {
    id: "pressure",
    title: "What pressure is loudest right now?",
    help: "Choose the thing that keeps coming back, not the thing that is easiest to complain about.",
    options: [
      ["customer", "Customers wait, chase or get confused", { customer: 7 }],
      ["admin", "Admin gets repeated or missed", { admin: 7 }],
      ["people", "People do the work differently", { people: 7, training: 2 }],
      ["systems", "Tools do not connect or are not trusted", { systems: 7 }],
      ["money", "Quotes, invoices or payments are slow", { money: 7 }],
      ["risk", "There is a safety, privacy or compliance worry", { risk: 8 }],
      ["training", "People need clearer training or support", { training: 7, people: 2 }]
    ]
  },
  {
    id: "customer",
    title: "What happens for customers?",
    help: "Think about the path from finding you to getting the job done.",
    options: [
      ["clear", "Mostly clear and handled well", {}],
      ["chase", "They chase for updates", { customer: 4, admin: 1 }],
      ["missed", "Enquiries or follow-ups get missed", { customer: 5, money: 1 }],
      ["handover", "They repeat themselves between people", { customer: 3, admin: 3, people: 1 }],
      ["trust", "They are not sure what happens next", { customer: 4, training: 1 }]
    ]
  },
  {
    id: "admin",
    title: "What is the admin really like?",
    help: "Be honest. Tiny bits of double handling become a big cost.",
    options: [
      ["clean", "One place, mostly clean", {}],
      ["repeat", "The same info is entered more than once", { admin: 5, systems: 2 }],
      ["spreadsheet", "Spreadsheets and inboxes hold the truth", { admin: 4, systems: 3 }],
      ["owner", "The owner or manager checks everything", { admin: 3, people: 2 }],
      ["unknown", "Nobody can clearly explain the workflow", { admin: 4, training: 2, risk: 1 }]
    ]
  },
  {
    id: "people",
    title: "How consistent is the team?",
    help: "This matters even if the team is small.",
    options: [
      ["consistent", "People follow the same way of working", {}],
      ["tribal", "It lives in a few people's heads", { people: 4, training: 3 }],
      ["different", "Everyone has their own version", { people: 5, training: 3, admin: 1 }],
      ["bottleneck", "One person becomes the blocker", { people: 4, admin: 2 }],
      ["new-starters", "New starters take too long to become useful", { training: 5, people: 2 }]
    ]
  },
  {
    id: "systems",
    title: "How healthy is the software setup?",
    help: "New software is not automatically the answer.",
    options: [
      ["simple", "Simple and mostly working", {}],
      ["gaps", "Useful, but there are clear gaps", { systems: 3, admin: 1 }],
      ["many", "Too many tools and workarounds", { systems: 5, admin: 2 }],
      ["wrong", "The main tool does not fit the work", { systems: 5, risk: 1 }],
      ["source", "No one trusts the same source of truth", { systems: 4, people: 1, admin: 2 }]
    ]
  },
  {
    id: "money",
    title: "Where does money get stuck?",
    help: "Revenue protection is not complicated. It is making sure work and money do not fall through cracks.",
    options: [
      ["fine", "Nothing obvious", {}],
      ["quotes", "Quotes or approvals are slow", { money: 4, customer: 1 }],
      ["invoices", "Invoices or payments need chasing", { money: 5, admin: 1 }],
      ["leaks", "We miss add-ons, renewals or follow-ups", { money: 5, systems: 1 }],
      ["visibility", "I cannot see what is stuck", { money: 3, systems: 3 }]
    ]
  },
  {
    id: "risk",
    title: "Any risk you should not ignore?",
    help: "This includes customer data, workplace issues, safety, payroll and promises made to customers.",
    options: [
      ["low", "Mostly normal business mess", {}],
      ["privacy", "Customer data or access feels loose", { risk: 6, systems: 2 }],
      ["workplace", "Pay, safety, workplace or HR matters", { risk: 8, people: 2 }],
      ["promise", "Customers may be promised things we cannot track", { risk: 5, customer: 2 }],
      ["unknown", "I am not sure what the risk is", { risk: 4, training: 2 }]
    ]
  },
  {
    id: "training",
    title: "What would make learning easier?",
    help: "Assume different ages, confidence levels and learning styles. Keep it simple.",
    options: [
      ["already", "People already know what to do", {}],
      ["short", "Short checklists and examples", { training: 3 }],
      ["visual", "Screenshots, demos or side-by-side help", { training: 4, systems: 1 }],
      ["onboarding", "A proper new-starter path", { training: 5, people: 1 }],
      ["plain", "Less jargon and clearer instructions", { training: 4, people: 1 }],
      ["confidence", "People need confidence using tools", { training: 4, systems: 2 }]
    ]
  },
  {
    id: "capacity",
    title: "What can you realistically do now?",
    help: "The right fix still has to fit the week you actually have.",
    options: [
      ["hour", "About an hour this week", {}],
      ["halfday", "A focused half-day", {}],
      ["month", "A few hours across the month", {}],
      ["project", "A proper improvement project", {}],
      ["help", "I need help working it out", {}]
    ]
  },
  {
    id: "outcome",
    title: "What outcome would you notice first?",
    help: "This helps turn the diagnosis into a useful action plan.",
    options: [
      ["hours", "Get hours back each week", { admin: 2, systems: 1 }],
      ["smooth", "Make customers easier to handle", { customer: 3 }],
      ["consistent", "Make the team more consistent", { people: 2, training: 2 }],
      ["visibility", "See what is happening without chasing", { systems: 2, admin: 1 }],
      ["cash", "Get money moving faster", { money: 3 }],
      ["risk", "Lower the chance of a serious mistake", { risk: 3 }],
      ["training", "Help people learn the work faster", { training: 3 }]
    ]
  },
  {
    id: "notes",
    title: "What is one real example?",
    help: "Optional. Name the task, customer path or handover that causes the most pain.",
    type: "text",
    placeholder: "Example: New enquiries come in by web form, SMS and email, then someone copies them into a spreadsheet before the first call."
  }
];

function addScores(scoreboard, scores = {}) {
  Object.entries(scores).forEach(([key, value]) => {
    scoreboard[key] = (scoreboard[key] || 0) + value;
  });
}

function showView(id) {
  views.forEach((view) => $(view).classList.toggle("hidden", view !== id));
  scrollTo({ top: 0, behavior: scrollBehavior });
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  $("saved-label")?.classList.remove("hidden");
}

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved) return false;
    state.step = saved.step || 0;
    state.answers = saved.answers || {};
    return true;
  } catch (_) {
    return false;
  }
}

function label(id, value) {
  const question = questions.find((item) => item.id === id);
  return question?.options?.find((item) => item[0] === value)?.[1] || value || "";
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
}

function advice(question) {
  const a = state.answers;
  if (question.id === "systems" && ["repeat", "spreadsheet", "unknown"].includes(a.admin)) {
    return '<aside class="advice-card"><h2>Do not buy software too early.</h2><p>If the workflow is unclear, a new app usually gives you a shinier mess. Get the handover and source of truth clear first.</p></aside>';
  }
  if (question.id === "training" && ["small", "growing", "larger"].includes(a.team)) {
    return '<aside class="advice-card"><h2>Training has to suit mixed people.</h2><p>Use short steps, examples and screenshots. If people need to read a novel before doing the task, it will not stick.</p></aside>';
  }
  if (question.id === "capacity" && (a.pressure === "risk" || ["workplace", "privacy"].includes(a.risk))) {
    return '<aside class="advice-card"><h2>Risk changes the order.</h2><p>If privacy, safety, payroll, employment or compliance is involved, do not leave it sitting behind cosmetic improvements.</p></aside>';
  }
  return "";
}

function renderQuestion() {
  const question = questions[state.step];
  $("progress-label").textContent = `Question ${state.step + 1} of ${questions.length}`;
  $("progress-bar").style.width = `${((state.step + 1) / questions.length) * 100}%`;
  $("question-kicker").textContent = question.id === "notes" ? "Last step" : "Business pressure";
  $("question-title").textContent = question.title;
  $("question-help").textContent = question.help;
  $("context-advice").innerHTML = advice(question);
  $("back-button").disabled = state.step === 0;
  const box = $("answer-list");
  box.innerHTML = "";
  if (question.type === "text") {
    const answer = document.createElement("textarea");
    answer.className = "text-answer";
    answer.placeholder = question.placeholder;
    answer.value = state.answers[question.id] || "";
    answer.oninput = () => {
      state.answers[question.id] = answer.value;
      save();
    };
    box.append(answer);
  } else {
    question.options.forEach(([value, text]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `answer${state.answers[question.id] === value ? " selected" : ""}`;
      button.textContent = text;
      button.onclick = () => {
        state.answers[question.id] = value;
        save();
        renderQuestion();
      };
      box.append(button);
    });
  }
  showView("question-view");
}

function scoreMap() {
  const scores = Object.fromEntries(Object.keys(categories).map((key) => [key, 0]));
  questions.forEach((question) => {
    if (question.type === "text") return;
    const selected = question.options.find(([value]) => value === state.answers[question.id]);
    if (selected) addScores(scores, selected[2]);
  });
  if (state.answers.risk === "workplace" || state.answers.pressure === "risk") scores.risk += 4;
  if (state.answers.capacity === "hour") {
    scores.admin += 1;
    scores.training += 1;
  }
  return scores;
}

function rankedScores() {
  const scores = scoreMap();
  return Object.entries(scores).sort((a, b) => b[1] - a[1]);
}

function capacityPlan() {
  const selected = state.answers.capacity;
  if (selected === "hour") return "Keep the first fix tiny: one workflow, one owner, one obvious change. That is still progress.";
  if (selected === "halfday") return "Use the half-day to map the current path, remove one repeated step and test the cleaner version on real work.";
  if (selected === "month") return "Use the month for one focused improvement sprint. Weekly check-ins beat a giant plan nobody follows.";
  if (selected === "project") return "Treat this as a proper improvement project, but keep the first release small enough to test quickly.";
  return "Write down examples, screenshots and the outcome you want. That will make outside help faster and cheaper.";
}

function learningPlan(firstKey) {
  if (firstKey === "training") return "Start with the task people get wrong most often. Build the guide for a busy person, not an expert.";
  if (["people", "systems", "admin"].includes(firstKey)) return "The fix needs a short training step. Show the new way, give one example and check whether people can do it without you.";
  return "Do not skip training. Even customer, money and risk fixes fail when people do not understand the new way of working.";
}

function causeLine(firstKey) {
  const a = state.answers;
  const lines = [];
  if (a.admin === "repeat" || a.admin === "spreadsheet") lines.push("double handling");
  if (a.people === "different" || a.people === "tribal") lines.push("inconsistent ways of working");
  if (a.systems === "many" || a.systems === "source") lines.push("no trusted source of truth");
  if (a.training && a.training !== "already") lines.push("training that needs to be clearer");
  if (a.risk !== "low") lines.push("risk that should be checked properly");
  if (!lines.length) return `The strongest signal is ${categories[firstKey].plain}. Start there before adding more moving parts.`;
  return `The likely causes are ${lines.slice(0, 3).join(", ")}. Fix the cause, not just the symptom.`;
}

function renderMap(scores) {
  const max = Math.max(...Object.values(scores), 1);
  $("map-grid").innerHTML = Object.entries(categories)
    .map(([key, item]) => {
      const score = scores[key];
      const width = Math.max(7, Math.round((score / max) * 100));
      return `<div class="map-row"><strong>${item.label}</strong><span class="score-track"><span class="score-fill" style="--score-width:${width}%"></span></span><span class="score-number">${score}</span></div>`;
    })
    .join("");
}

function renderPriorityCards(ranking) {
  $("priority-grid").innerHTML = ranking
    .slice(0, 3)
    .map(([key], index) => `<article class="priority-card"><span>${index === 0 ? "First" : index === 1 ? "Next" : "Then"}</span><strong>${categories[key].label}</strong></article>`)
    .join("");
}

function section(title, body, open = false) {
  return `<details ${open ? "open" : ""}><summary>${title}</summary><div class="section-body">${body}</div></details>`;
}

function toolLinks(tools) {
  return `<div class="tool-links">${tools.map(([name, url, text]) => `<a href="${url}"><span><strong>${name}</strong><br/><small>${text}</small></span><em>Open</em></a>`).join("")}</div>`;
}

function resultData() {
  const scores = scoreMap();
  const ranking = rankedScores();
  const firstKey = ranking[0][0];
  const secondKey = ranking[1][0];
  const thirdKey = ranking[2][0];
  return { scores, ranking, firstKey, secondKey, thirdKey, first: categories[firstKey] };
}

function renderResult() {
  const { scores, ranking, firstKey, secondKey, thirdKey, first } = resultData();
  const example = state.answers.notes ? escapeHtml(state.answers.notes) : "Use the real workflow that causes the most frequent frustration.";
  $("result-summary").textContent = [label("business", state.answers.business), label("team", state.answers.team), label("stage", state.answers.stage)].filter(Boolean).join(" · ");
  $("opening-text").textContent = `Your main bottleneck is ${first.plain}. ${first.why}`;
  renderMap(scores);
  renderPriorityCards(ranking);
  $("result-sections").innerHTML = [
    section("Why this comes first", `<p>${causeLine(firstKey)}</p><p><strong>Your example:</strong> ${example}</p>`, true),
    section("First 48 hours", `<ol>${first.first48.map((item) => `<li>${item}</li>`).join("")}</ol>`, true),
    section("30-day plan", `<ol>${first.thirty.map((item) => `<li>${item}</li>`).join("")}</ol><p>${capacityPlan()}</p>`, true),
    section("Training angle", `<p>${learningPlan(firstKey)}</p><p>For mixed teams, use plain English, short instructions, real examples and one clear owner. Do not make people hunt through a long document to find the next step.</p>`),
    section("What not to touch yet", `<p>${first.avoid}</p><p>Leave ${categories[thirdKey].plain} alone until ${categories[firstKey].plain} and ${categories[secondKey].plain} are moving in the right direction.</p>`),
    section("Recommended tools", `<p>Use these if you want to go one step deeper.</p>${toolLinks(first.tools)}`)
  ].join("");
  showView("result-view");
  save();
  if (typeof window.trackToolCompletion === "function") {
    window.trackToolCompletion("Business Sort-Out Map", { priority: first.label, scores });
  }
  window.LSIO_MEMBER?.saveResult?.({ priority: first.label, scores, answers: state.answers }, { toolSlug: "business-sort-out-map", title: "Business Sort-Out Map", status: "completed" });
}

function next() {
  const question = questions[state.step];
  if (question.type !== "text" && !state.answers[question.id]) {
    toast("Choose an answer to continue");
    return;
  }
  if (state.step === questions.length - 1) {
    renderResult();
    return;
  }
  state.step += 1;
  save();
  renderQuestion();
}

function toast(message) {
  const box = $("toast");
  box.textContent = message;
  box.classList.add("show");
  setTimeout(() => box.classList.remove("show"), 1800);
}

async function copy(text) {
  try {
    await navigator.clipboard.writeText(text);
    toast("Copied");
  } catch (_) {
    toast("Copy is not available");
  }
}

function planText() {
  const { scores, ranking, firstKey, secondKey, thirdKey, first } = resultData();
  return `BUSINESS SORT-OUT MAP

Top bottleneck: ${first.label}
Why: ${first.why}

Order of attack:
1. ${categories[firstKey].label}
2. ${categories[secondKey].label}
3. ${categories[thirdKey].label}

First 48 hours:
${first.first48.map((item) => `- ${item}`).join("\n")}

30-day plan:
${first.thirty.map((item) => `- ${item}`).join("\n")}

Training angle:
${learningPlan(firstKey)}

Scores:
${Object.entries(scores).map(([key, value]) => `- ${categories[key].label}: ${value}`).join("\n")}

Practical general guidance for an Australian business. Check regulated issues with the right source.`;
}

$("start-guide").onclick = () => {
  state.step = 0;
  state.answers = {};
  save();
  renderQuestion();
};
$("resume-guide").onclick = renderQuestion;
$("continue-button").onclick = next;
$("back-button").onclick = () => {
  if (!state.step) return;
  state.step -= 1;
  save();
  renderQuestion();
};
$("edit-answers").onclick = renderQuestion;
$("copy-plan").onclick = () => copy(planText());
$("restart-guide").onclick = () => $("clear-dialog").showModal();
$("save-exit").onclick = () => {
  save();
  location.href = "../free-tools/";
};
$("confirm-clear").onclick = () => {
  localStorage.removeItem(STORAGE_KEY);
  state.step = 0;
  state.answers = {};
  $("clear-dialog").close();
  showView("intro");
  $("resume-guide").classList.add("hidden");
};
$("cancel-clear").onclick = () => $("clear-dialog").close();
document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-copy]");
  if (button) copy($(button.dataset.copy).textContent);
});
if (load()) $("resume-guide").classList.remove("hidden");
