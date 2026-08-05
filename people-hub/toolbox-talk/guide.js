const STORAGE_KEY='jj_toolbox_talk_v1';
const state={step:0,answers:{}};
const $=id=>document.getElementById(id);
const views=['intro','question-view','result-view'];
const questions=[
 {id:'teamType',title:'What kind of team is this for?',help:'Shapes the tone and format of the agenda.',options:[['site','Trade or site crew'],['floor','Retail or hospitality floor'],['office','Office team'],['mobile','Mobile or field service crew'],['other','Mixed or something else']]},
 {id:'meetingPurpose',title:'What is the main reason for this meeting?',help:'Pick the one that best fits today.',options:[['safety','Safety briefing or toolbox talk'],['checkin','Weekly check-in'],['update','Project or job update'],['problem','Solving a specific problem'],['general','General team catch-up']]},
 {id:'frequency',title:'How often do these happen?',help:'Changes how much needs re-explaining each time.',options:[['daily','Daily'],['weekly','Weekly'],['fortnightly','Fortnightly'],['adhoc','Ad-hoc, only when needed'],['first','This is our first one']]},
 {id:'duration',title:'How much time have you actually got?',help:'Be realistic—a 5-minute agenda and a 30-minute one look very different.',options:[['5','5 minutes'],['10','10 minutes'],['1520','15 to 20 minutes'],['30','30 minutes or more']]},
 {id:'teamSize',title:'How many people will be there?',help:'Bigger groups need tighter structure to stay on time.',options:[['couple','Just a couple of people'],['small','Small crew of 3–6'],['bigger','Bigger team of 7–15'],['large','Large group of 15+']]},
 {id:'topicFocus',title:'What is the main topic today?',help:'A short description is enough—this is the core of the agenda.',type:'text'},
 {id:'urgentIssues',title:'Anything urgent that needs addressing today?',help:'Optional. Add anything time-sensitive so it does not get missed.',type:'text'},
 {id:'confidence',title:'How comfortable are you running this?',help:'No judgement—this controls how much structure you get.',options:[['comfortable','Comfortable—I just need a quick agenda'],['unsure','Slightly unsure'],['nervous','A bit nervous running meetings'],['first','This is genuinely my first time running one']]}
];
const visibleQuestions=()=>questions.filter(q=>!q.show||q.show(state));
const scrollBehavior=window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth';
function showView(id){views.forEach(v=>$(v).classList.toggle('hidden',v!==id));window.scrollTo({top:0,behavior:scrollBehavior})}
function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state));$('saved-label')?.classList.remove('hidden')}
function load(){try{const saved=JSON.parse(localStorage.getItem(STORAGE_KEY));if(saved){state.step=saved.step||0;state.answers=saved.answers||{};return true}}catch{}return false}
function adviceFor(q){
 if(q.id==='duration'&&state.answers.duration==='5')return `<aside class="advice-card"><h2>Five minutes means one topic.</h2><p>Do not try to cover safety, updates and a problem all in five minutes. Pick the single most important thing and stick to it.</p></aside>`;
 if(q.id==='confidence'&&['nervous','first'].includes(state.answers.confidence))return `<aside class="advice-card"><h2>Short and clear beats polished.</h2><p>Nobody expects a slick presentation for a quick team meeting. A short list of points you actually cover works better than a speech you are nervous about forgetting.</p></aside>`;
 return '';
}
function label(id,value){const q=questions.find(x=>x.id===id);return q?.options?.find(x=>x[0]===value)?.[1]||value||''}
function renderQuestion(){const list=visibleQuestions();state.step=Math.max(0,Math.min(state.step,list.length-1));const q=list[state.step];$('progress-label').textContent=`Question ${state.step+1} of ${list.length}`;$('progress-bar').style.width=`${((state.step+1)/list.length)*100}%`;$('question-kicker').textContent=q.type==='text'?'Add detail':'Build your agenda';$('question-title').textContent=q.title;$('question-help').textContent=q.help;$('context-advice').innerHTML=adviceFor(q);$('back-button').disabled=state.step===0;
 const answers=$('answer-list');answers.innerHTML='';if(q.type==='text'){const area=document.createElement('textarea');area.className='text-answer';area.placeholder='Type here…';area.value=state.answers[q.id]||'';area.addEventListener('input',()=>{state.answers[q.id]=area.value;save()});answers.append(area)}else q.options.forEach(([value,lbl])=>{const btn=document.createElement('button');btn.type='button';btn.className='answer'+(state.answers[q.id]===value?' selected':'');btn.textContent=lbl;btn.addEventListener('click',()=>{state.answers[q.id]=value;save();renderQuestion()});answers.append(btn)});showView('question-view')}
function opening(){const purpose=label('meetingPurpose',state.answers.meetingPurpose).toLowerCase();return `Right, let us keep this quick—today is mainly about ${state.answers.topicFocus||purpose}. Should take about ${label('duration',state.answers.duration)}.`}
function agenda(){const mins=state.answers.duration;const topic=state.answers.topicFocus||'today\'s main topic';
 if(mins==='5')return [['1 min','Quick welcome, state the one topic for today.'],['3 min',`Cover ${topic}.`],['1 min','Confirm any actions and close.']];
 if(mins==='10')return [['1 min','Welcome and today\'s focus.'],['5 min',`Cover ${topic}.`],['3 min','Quick round for questions or issues.'],['1 min','Confirm actions and close.']];
 if(mins==='1520')return [['2 min','Welcome and agenda for today.'],['8 min',`Cover ${topic} properly.`],['5 min','Open the floor—questions, issues, updates from the team.'],['3 min','Confirm actions, owners and close.']];
 return [['3 min','Welcome and agenda for today.'],['12 min',`Cover ${topic} in full.`],['10 min','Open discussion—questions, issues, updates from the team.'],['5 min','Any other business.'],['5 min','Confirm actions, owners and next meeting time.']];
}
function talkingPoints(){const map={safety:['State the specific hazard or safety topic clearly.','Explain what actually happened or what could happen, in plain terms.','Confirm the correct process everyone should follow.','Ask if anyone has seen this issue recently.'],checkin:['What is working well this week.','What is not working, and why.','Anything blocking people from getting on with the job.'],update:['Where the project or job actually stands right now.','What has changed since the last update.','What happens next, and who owns it.'],problem:['State the problem clearly—no blame, just facts.','Ask the team for input before offering your own solution.','Agree on one practical next step.'],general:['Wins from the week worth acknowledging.','Anything the team needs to know.','Open floor for anything on people\'s minds.']};return map[state.answers.meetingPurpose]||map.general}
function questionsToAsk(){const base=['Does anyone have questions about what we just covered?','Is anything getting in the way of your work right now?'];if(state.answers.urgentIssues)base.unshift(`Specifically: ${state.answers.urgentIssues}`);return base}
function wrapUp(){return ['Confirm any actions out loud—who is doing what, by when.','Note anything that needs following up after the meeting.','Confirm the next meeting time if it is a recurring one.'];}
function renderResult(){const summary=[label('teamType',state.answers.teamType),label('meetingPurpose',state.answers.meetingPurpose),`${label('duration',state.answers.duration)} · ${label('teamSize',state.answers.teamSize)}`].join(' · ');$('result-summary').textContent=summary;$('opening-text').textContent=opening();
 const sections=[
  ['Timed agenda',agenda().map(([t,x])=>`<div class="agenda-row"><strong>${t}</strong><span>${x}</span></div>`).join(''),true],
  ['Key talking points',`<ul>${talkingPoints().map(x=>`<li>${x}</li>`).join('')}</ul>`,true],
  ['Questions to ask the team',`<ul>${questionsToAsk().map(x=>`<li>${x}</li>`).join('')}</ul>`],
  ['Wrap-up actions',`<ul>${wrapUp().map(x=>`<li>${x}</li>`).join('')}</ul>`]
 ];
 $('result-sections').innerHTML=sections.map(([title,body,open])=>`<details ${open?'open':''}><summary>${title}</summary><div class="section-body">${body}</div></details>`).join('');window.trackToolCompletion&&window.trackToolCompletion('toolbox_talk',{purpose:state.answers.meetingPurpose});showView('result-view');save()}
function next(){const list=visibleQuestions(),q=list[state.step];if(q.type!=='text'&&!state.answers[q.id]){toast('Choose an answer to continue');return}if(q.id==='topicFocus'&&!state.answers[q.id]){toast('Add a quick topic so the agenda has something to build around');return}if(state.step>=list.length-1){renderResult();return}state.step++;save();renderQuestion()}
function back(){if(state.step>0){state.step--;save();renderQuestion()}}
function toast(msg){const t=$('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1800)}
function planText(){return `TEAM MEETING AGENDA\n\nSUMMARY\n${$('result-summary').textContent}\n\nOPENING LINE\n${opening()}\n\nAGENDA\n${agenda().map(x=>`${x[0]} — ${x[1]}`).join('\n')}\n\nKEY TALKING POINTS\n${talkingPoints().map(x=>`- ${x}`).join('\n')}\n\nQUESTIONS TO ASK\n${questionsToAsk().map(x=>`- ${x}`).join('\n')}\n\nWRAP-UP\n${wrapUp().map(x=>`- ${x}`).join('\n')}\n\nGeneral guidance only—confirm safety content against current WHS requirements.`}
async function copy(text){await navigator.clipboard.writeText(text);toast('Copied')}
$('start-guide').onclick=()=>{state.step=0;state.answers={};save();renderQuestion()};$('resume-guide').onclick=renderQuestion;$('continue-button').onclick=next;$('back-button').onclick=back;$('edit-answers').onclick=renderQuestion;$('copy-plan').onclick=()=>copy(planText());$('restart-guide').onclick=()=>{$('clear-dialog').showModal()};$('save-exit').onclick=()=>{save();location.href='../'};$('confirm-clear').onclick=()=>{localStorage.removeItem(STORAGE_KEY);state.step=0;state.answers={};$('clear-dialog').close();showView('intro');$('resume-guide').classList.add('hidden');toast('Saved answers cleared')};$('cancel-clear').onclick=()=>$('clear-dialog').close();document.addEventListener('click',e=>{const b=e.target.closest('[data-copy]');if(b)copy($(b.dataset.copy).textContent)});
if(load())$('resume-guide').classList.remove('hidden');
