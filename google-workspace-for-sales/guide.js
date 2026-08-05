const STORAGE_KEY='jj_gworkspace_sales_v1';
const state={stage:'question',levelIndex:0,startAnswer:''};
const $=id=>document.getElementById(id);
const views=['intro','question-view','level-view','result-view'];
const scrollBehavior=window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth';

const startQuestion={
 title:'What is your comfort level with Google Sheets right now?',
 help:'This just decides where the walkthrough starts—you can still see every level at the end.',
 options:[
  ['beginner','Complete beginner',0],
  ['some','Comfortable with the basics',1],
  ['confident','Pretty confident already',3]
 ]
};

const levels=[
 {tag:'Level 1 of 5',title:'Getting Organised',subtitle:'Build a lead tracker that actually works.',
  learn:['Set up one clean sheet: name, company, contact details, status, last contact date, next action.','Freeze the header row so it stays visible while you scroll.','Use Data Validation to turn "status" into a dropdown—New, Contacted, Booked, No Response, Not Interested.','Add Conditional Formatting so overdue follow-ups turn red automatically.'],
  why:'A messy list is where leads quietly die. Five minutes of setup now saves hours of "wait, did I already call them?" later.',
  prompt:'I am setting up a lead tracker in Google Sheets for appointment setting. Suggest the columns I need and a simple status dropdown list, in plain English, for a small sales team.'},
 {tag:'Level 2 of 5',title:'Everyday Formulas',subtitle:'Stop counting your pipeline by hand.',
  learn:['COUNTIF / COUNTIFS — count how many leads are in each stage without touching a calculator.','A simple IF formula to flag anything overdue.','XLOOKUP (or VLOOKUP) to pull company info from one sheet into another without retyping it.'],
  why:'These three formulas alone remove most of the manual admin that eats into actual calling and outreach time.',
  prompt:'Write me a Google Sheets formula that flags a row as "Follow up" if the last contact date is more than 7 days ago. Explain it in plain English so I can adjust it myself.'},
 {tag:'Level 3 of 5',title:'Seeing the Bigger Picture',subtitle:'Pivot tables and simple reporting.',
  learn:['Build a Pivot Table showing calls made per week, or leads by source.','Add a simple chart—a funnel or bar chart is usually enough.','Understand Share settings: View access vs Edit access, so your manager can see the pipeline without changing it.'],
  why:'This is the difference between "I think I made a lot of calls this week" and actually being able to show it.',
  prompt:'I have a Google Sheet with columns for Date, Lead Source and Status. Walk me through building a pivot table that shows how many leads came from each source and how many converted to "Booked".'},
 {tag:'Level 4 of 5',title:'Connecting the Dots',subtitle:'Forms, Gmail and Calendar working together.',
  learn:['Use a Google Form to capture inbound enquiries straight into your tracking sheet—no manual copy-paste.','Basic mail merge: send a personalised outreach email to a list, pulling name and company from your sheet.','Link appointment booking to a shared Google Calendar so setting a meeting does not mean five back-and-forth emails.'],
  why:'This is where Sheets stops being a static list and starts actually connecting to the rest of your day.',
  prompt:'Draft a short, friendly outreach email template for a mail merge, aimed at booking a 15-minute discovery call. Keep it under 100 words and leave placeholders for [First Name] and [Company].'},
 {tag:'Level 5 of 5',title:'Working Smarter',subtitle:'Let Gemini do the boring bits.',
  learn:['Use Gemini directly inside Sheets to summarise a week\'s activity without building a report by hand.','Ask Gemini to draft personalised follow-up messages for a whole list of accounts, based on notes already in your sheet.','Know when a simple Apps Script (like an alert when a lead goes cold) is worth it—and when it is not.'],
  why:'This is the level where the sheet starts working for you instead of the other way around.',
  prompt:'Here is my pipeline data for this week: [paste rows]. Summarise it in three sentences—how many new leads, how many follow-ups are overdue, and one thing I should prioritise tomorrow.'}
];

function showView(id){views.forEach(v=>$(v).classList.toggle('hidden',v!==id));window.scrollTo({top:0,behavior:scrollBehavior})}
function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state));$('saved-label')?.classList.remove('hidden');$('level-saved-label')?.classList.remove('hidden')}
function load(){try{const saved=JSON.parse(localStorage.getItem(STORAGE_KEY));if(saved){Object.assign(state,saved);return true}}catch{}return false}

function renderQuestion(){
 $('progress-label').textContent='Question 1 of 1';$('progress-bar').style.width='100%';
 $('question-title').textContent=startQuestion.title;$('question-help').textContent=startQuestion.help;$('back-button').disabled=true;
 const answers=$('answer-list');answers.innerHTML='';
 startQuestion.options.forEach(([value,lbl,startIndex])=>{const btn=document.createElement('button');btn.type='button';btn.className='answer'+(state.startAnswer===value?' selected':'');btn.textContent=lbl;btn.addEventListener('click',()=>{state.startAnswer=value;state.levelIndex=startIndex;save();renderLevel()});answers.append(btn)});
 showView('question-view');
}

function renderLevel(){
 const i=state.levelIndex;const lvl=levels[i];
 $('level-progress-label').textContent=`Level ${i+1} of 5`;$('level-progress-bar').style.width=`${((i+1)/5)*100}%`;
 $('level-tag').textContent=lvl.tag;$('level-title').textContent=lvl.title;$('level-subtitle').textContent=lvl.subtitle;
 $('level-learn').innerHTML=lvl.learn.map(x=>`<li>${x}</li>`).join('');
 $('level-why').textContent=lvl.why;$('level-prompt').textContent=lvl.prompt;
 $('level-continue-button').textContent=i<levels.length-1?'Continue to next level':'Finish the guide';
 state.stage='level';save();
 showView('level-view');
}

function levelBack(){
 if(state.levelIndex>0){state.levelIndex--;save();renderLevel();return}
 state.stage='question';save();renderQuestion();
}
function levelNext(){
 if(state.levelIndex<levels.length-1){state.levelIndex++;save();renderLevel();return}
 renderResult();
}

function renderResult(){
 $('result-summary').textContent=`Started at ${levels[Math.max(0,startQuestion.options.find(o=>o[0]===state.startAnswer)?.[2]||0)]?.title||'Level 1'} · Completed all 5 levels`;
 const box=$('all-prompts');
 box.innerHTML='<h3>All five Gemini prompts, in one place</h3>'+levels.map((lvl,idx)=>`<div class="prompt-item"><strong>Level ${idx+1} — ${lvl.title}</strong><p id="all-prompt-${idx}">${lvl.prompt}</p></div>`).join('');
 window.trackToolCompletion&&window.trackToolCompletion('google_workspace_for_sales',{start_answer:state.startAnswer});
 state.stage='result';save();
 showView('result-view');
}

function allPromptsText(){return levels.map((lvl,idx)=>`LEVEL ${idx+1} — ${lvl.title.toUpperCase()}\n${lvl.prompt}`).join('\n\n')}

function toast(msg){const t=$('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1800)}
async function copy(text){await navigator.clipboard.writeText(text);toast('Copied')}

$('start-guide').onclick=()=>{state.stage='question';state.levelIndex=0;state.startAnswer='';save();renderQuestion()};
$('resume-guide').onclick=()=>{if(state.stage==='level')renderLevel();else if(state.stage==='result')renderResult();else renderQuestion()};
$('back-button').onclick=()=>{};
$('level-back-button').onclick=levelBack;
$('level-continue-button').onclick=levelNext;
$('edit-answers').onclick=()=>{state.stage='question';state.levelIndex=0;save();renderQuestion()};
$('copy-plan').onclick=()=>copy(allPromptsText());
$('restart-guide').onclick=()=>{$('clear-dialog').showModal()};
$('save-exit').onclick=()=>{save();location.href='../free-tools/'};
$('confirm-clear').onclick=()=>{localStorage.removeItem(STORAGE_KEY);state.stage='question';state.levelIndex=0;state.startAnswer='';$('clear-dialog').close();showView('intro');$('resume-guide').classList.add('hidden');toast('Progress cleared')};
$('cancel-clear').onclick=()=>$('clear-dialog').close();
document.addEventListener('click',e=>{const b=e.target.closest('[data-copy]');if(b)copy($(b.dataset.copy).textContent)});

if(load())$('resume-guide').classList.remove('hidden');
