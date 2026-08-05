# Let's Sort It Out Tool Improvement Plan

## Quick Summary

The next build should move the tools from "useful result generators" to outcome-focused working aids.

The core shift is:

- Every tool should produce a clear outcome, not just advice.
- Every result should name the next action, owner, timing, risk and recommended follow-up path.
- The AI section should help users understand how to use AI well, choose a sensible platform, and lock in a reusable business tone of voice.
- People Hub should stay visually familiar to the rest of the site, but remain clearly separate as the HR and workplace conversation area.
- The whole experience should feel like a learning and development manager built it for real people: low effort, low clicks, no jargon, no tech ego, and clear guidance for different confidence levels.

Important source note: the current workspace is older than the supplied deploy archive. The deploy archive includes newer `ai-guide`, `account`, member dashboard, Netlify functions, additional People Hub tools, and Google Workspace for Sales content. Reconcile the deploy archive into the working source before starting major feature work.

## Recommended Approach

### Experience Lens: Learning And Development First

Goal: design every page as if it is being used by a busy learning and development manager teaching different demographics through online tools.

This means the site must work for:

- Confident operators who want the answer quickly.
- New business owners who need more guidance.
- People with low confidence using digital tools.
- Time-poor managers who will abandon anything that feels slow.
- Practical learners who need examples before theory.
- People using a phone while doing other work.

Principles:

- Keep clicks low. A user should know what to do next without hunting.
- Use progressive disclosure: show the simple next step first, then optional detail.
- Prefer guided choices over blank-page writing.
- Use plain examples before abstract concepts.
- Keep result screens short enough to act on.
- Avoid forcing account creation before value is delivered.
- Make copy, save and continue actions obvious.
- Let users preview what a tool does before they open it.
- Use friendly guardrails instead of scary warnings.
- Make every tool feel like "I can do this now", not "I need to learn a system".

Tone rules:

- No jargon.
- No corporate fluff.
- No AI hype.
- No HR/legal pretending.
- Use direct, down-to-earth Australian English.
- Say what to do, why it matters, and what to avoid.
- Challenge bad assumptions plainly, but keep it useful.
- Replace technical labels with human labels wherever possible.

Examples:

- Use "Fix this first" instead of "Priority remediation pathway".
- Use "Needs a human check" instead of "Manual governance checkpoint required".
- Use "Do not automate the mess" instead of "Process optimisation prerequisite".
- Use "Start with this task" instead of "Recommended initial implementation candidate".

### 1. Reconcile The Codebase First

Goal: make the workspace match the latest deployed site before enhancements begin.

Actions:

- Bring in the deployed `ai-guide/` as the active AI Prompt Builder.
- Bring in `account/`, `assets/auth.js`, `assets/member-tools.js`, `assets/account-dashboard.js`, `assets/auth.css`, `content-catalog.json`, `netlify/`, `package.json`, `package-lock.json`, `site.webmanifest`, and missing People Hub tools.
- Check redirects so `chatgpt-guide/` continues pointing to `ai-guide/`.
- Confirm existing pages are not overwritten with older versions.

Outcome:

- One source of truth for the live site.
- Future tool upgrades build on the current member-save and dashboard functionality.

### 2. SEO And Australian English Standards

Goal: every tool should be easy to find, easy to understand, and clearly written for Australian businesses.

Site-wide language rules:

- Use English only across the platform.
- Use Australian English spelling and terminology.
- Keep `lang="en-AU"` on pages.
- Do not add multilingual UI, translation toggles or international wording unless the business later chooses to support it properly.
- Avoid US-only assumptions, American spelling, overseas tax/legal references and generic global business advice.
- Keep examples realistic for Australian small businesses, managers and teams.
- When a topic touches tax, employment, payroll, privacy, safety, consumer law or regulated work, say what needs checking instead of pretending certainty.

SEO requirements for each tool:

- Unique title tag focused on the tool outcome and Australian audience.
- Unique meta description written in plain language.
- One clear H1 that matches the tool's real value.
- Canonical URL.
- Open Graph and Twitter preview copy.
- Breadcrumb schema where relevant.
- `SoftwareApplication` schema for interactive tools.
- FAQ schema only where the page has genuine FAQ content.
- Internal links to related tools and next-step pages.
- Plain-language intro copy that says who the tool is for, what it produces and when not to use it.
- Outcome-focused keywords without keyword stuffing.

Example SEO shape:

```text
Title: Automation Opportunity Finder For Australian Small Business
Description: Check whether a repeated admin task should be automated, simplified, kept human or left alone. Built for practical Australian small businesses.
H1: Find The Admin Worth Automating
Primary outcome: A realistic recommendation and first action plan.
```

Tool SEO should focus on:

- The problem the user recognises.
- The outcome the tool gives them.
- Australian business context.
- Practical next steps.
- Clear limitations.

Do not overpromise:

- Avoid "guaranteed savings".
- Avoid "AI will fix your business".
- Avoid "complete HR advice".
- Avoid legal, tax, safety or employment certainty.
- Use "starting point", "practical check", "first action" and "what to check next".

### 3. Add A Shared Outcome Layer

Goal: every tool produces structured output that can be saved, reopened, measured and acted on.

Create a shared result shape:

```js
{
  toolSlug: "automation-opportunity-finder",
  title: "Automation Opportunity Finder",
  status: "completed",
  outcome: {
    primaryResult: "Worth a small controlled test",
    priority: "High",
    nextAction: "Map the trigger, required fields, exceptions and owner.",
    owner: "Business owner or process owner",
    timeframe: "7 days",
    effort: "Low",
    riskLevel: "Medium",
    expectedBenefit: "Reduce rework and improve response consistency",
    complianceNote: "Keep human approval until the workflow is proven.",
    recommendedNextTool: "workflow-order",
    implementationPath: "Simplify, pilot, measure, then automate"
  },
  answers: {},
  resultText: ""
}
```

Use this for:

- Member dashboard.
- Tool result cards.
- Analytics.
- Tally handoff links.
- Future PDF/CSV exports.

### 4. Upgrade The Member Dashboard Into An Action Dashboard

Goal: saved work should tell users what to do next.

Add dashboard sections:

- Next best action.
- Ready to implement.
- Needs process cleanup first.
- High-risk or compliance check needed.
- Biggest time or revenue opportunity.
- Recently finished tools.
- Recommended next tool.

Keep the tone practical and plain:

- "Fix this first"
- "Worth automating"
- "Needs a human check"
- "Do not overbuild this"
- "Come back to this later"

### 5. Add Tool Previews And Better Discovery

Goal: users should understand the value of a tool before opening it.

Add a preview section to the Free Tools page and relevant hub pages:

- Show a short preview card for each tool.
- Include "What it helps with", "What you will get", "How long it takes" and "Best for".
- Show a sample result snippet so users can see the output style.
- Add a "Preview" action beside "Start tool".
- Let users filter by outcome: save time, reduce admin, improve customer journey, manage people, use AI, make a decision.
- Keep preview cards short and scannable.

Example preview card:

```text
Automation Opportunity Finder

Best for: A repeat task you think might be worth automating.
You will get: Automate, simplify, assist or leave-alone recommendation.
Takes: 5-8 minutes.
Sample output: "Worth a small controlled test. Map the trigger, owner, exception path and human check before building anything."
```

Preview UX rules:

- Do not make the preview feel like a sales page.
- Show real outputs, not vague promises.
- Keep the start button visible.
- Let users jump straight in if they already know what they need.
- On mobile, show one simple preview card at a time with clear filters.

### 6. Add One Advanced Business Tool Concept

Goal: add one more powerful business tool that is useful for serious operators, while still feeling simple for normal users.

Recommended concept: Business Sort-Out Map.

Purpose:

- Help a business owner or manager see what is really holding the business back across customers, admin, people, systems, money and compliance.
- Turn messy problems into a realistic order of attack.
- Connect users to the right existing tool or service path.

User experience:

- Starts with one plain question: "What is making the business harder than it should be?"
- Uses guided choices first, optional details second.
- Keeps each step to one decision.
- Lets confident users skip detail and get the recommendation quickly.
- Shows progress clearly.
- Gives a useful result without needing an account.

Inputs:

- Business type.
- Team size.
- Main customer problem.
- Main admin problem.
- Main people problem.
- Main systems problem.
- Money or revenue friction.
- Compliance or risk concern.
- Current software.
- Time available to fix things.
- What success would look like in 30 days.

Behind-the-scenes scoring:

- Customer friction.
- Manual work.
- Revenue leakage.
- Process clarity.
- People risk.
- System maturity.
- Compliance sensitivity.
- Effort required.
- Confidence level.

Output:

- Top business bottleneck.
- Second and third priority.
- What not to fix yet.
- First 48-hour action.
- 30-day improvement path.
- Tool recommendations.
- Risks to check.
- Likely benefit if fixed.
- When to get help.

Sample output:

```text
Fix customer follow-up first.

Your answers point to lost enquiries and unclear ownership as the biggest leak. Do not start by replacing software. First, map what happens from enquiry to booked job, choose one owner, and set one follow-up rule.

First 48 hours:
1. Write down every enquiry source.
2. Choose one place where new enquiries are recorded.
3. Set a same-day follow-up rule.
4. Check whether any current tool can send the reminder.

Use next: Workflow Order, then Automation Opportunity Finder.
```

Why this is worth building:

- It becomes the front door for confused users.
- It helps users choose the right tool without guessing.
- It creates stronger consulting/service leads because the result explains the business problem.
- It supports different learner confidence levels.
- It gives practical value without sounding like a corporate diagnostic.

### 7. Make The AI Section More Useful And More Mature

Goal: the AI Prompt Builder should become an AI guidance and working setup area, not just a prompt picker.

Keep the existing tone: direct, practical, no hype, Australian English.

Learning design rules for this section:

- Let users choose their confidence level and adapt the guidance to it.
- Explain AI concepts through business tasks, not technical definitions.
- Keep each step to one decision at a time.
- Use short examples for trades, services, retail, hospitality, office and online businesses.
- Give users a useful output within a few clicks.
- Do not make the user read a long guide before they can build something.
- Always include a "copy this and use it" output.

Add these sections inside the AI experience:

#### AI Platform Selector

Help users choose the right AI platform for the job.

Suggested platforms:

- ChatGPT: general business thinking, writing, summaries, prompt workflows, reusable instructions.
- Claude: long documents, policy reviews, structured writing, careful editing.
- Gemini: Google Workspace, Sheets, Gmail, Docs and Drive workflows.
- Microsoft Copilot: Microsoft 365, Word, Excel, Outlook and Teams workflows.
- Canva AI: simple marketing assets, brand content and social creative.

Output should say:

- Best fit.
- What it is good for.
- What not to use it for.
- First task to try.
- Risk or privacy reminder.

Example:

> Start with Gemini if most of your work is already in Google Sheets, Gmail and Docs. Use it for summaries, formulas, follow-up drafts and simple reporting. Do not paste sensitive customer, payroll or legal information unless you know the access and storage rules.

#### AI Basics Without The Fluff

Add a short guidance layer that explains:

- AI is best at drafting, summarising, structuring, checking and transforming information.
- AI is weaker at current legal, tax, employment, safety and compliance advice unless checked.
- Better prompts need role, context, source material, output format, tone and constraints.
- Users should start with low-risk repeatable tasks.
- Sensitive customer or employee information needs care.

Suggested modules:

- What AI is good at.
- What AI is not responsible for.
- How to write a useful prompt.
- How to improve the first answer.
- What to avoid pasting.
- When to get a human to check it.

Keep these modules short. Each one should be scannable in under 30 seconds and end with one practical example.

#### Business Voice And Brand Brain Builder

Add a tool that helps a business lock in its reusable tone of voice.

Call it something clear and practical:

- Business Voice Builder.
- Brand Brain Builder.
- Voice Setup.
- Tone Of Voice Lock-In.

Recommended output:

- Business type.
- Audience.
- What the business helps with.
- Tone words.
- Words to use.
- Words to avoid.
- Level of formality.
- Plain-English rules.
- Example sentence.
- Reusable AI instruction.

The final output should be copyable as a reusable instruction:

```text
Use this business voice:

We are a practical Australian business helping [audience] with [service].
Sound [tone words].
Use Australian English.
Keep wording clear, useful and human.
Avoid hype, corporate jargon and overpromising.
When writing for customers, be direct, friendly and specific.
When the topic involves legal, employment, tax, privacy or safety issues, flag what needs checking instead of pretending certainty.
```

This should be saved to the member account so future AI prompts can reuse it.

#### AI Workflow Builder

Add an outcome-focused step after prompt generation:

- What task are you trying to improve?
- What information goes in?
- What should AI produce?
- Who checks the output?
- Where does the output go next?
- How often will this be reused?

Output:

- Suggested workflow.
- Prompt.
- Review checklist.
- Privacy note.
- Repeat-use template.
- Next automation opportunity if relevant.

This makes the AI section more advanced without turning it into vague AI strategy.

### 8. Keep People Hub Similar But Clearly Separate

Goal: People Hub should feel connected to Let's Sort It Out, but not mixed with general operations, systems or AI tools.

Keep similar:

- Same practical language.
- Similar guided question flow.
- Same clean result structure.
- Same member save behaviour.
- Same copy/export actions.

Make separate:

- People Hub navigation label stays prominent.
- Result language stays focused on workplace conversations, HR preparation and documentation.
- Stronger boundaries around legal, Fair Work, safety, discrimination, formal performance and termination matters.
- People Hub dashboard grouping should be "Workplace and people plans", not mixed into process automation.

People Hub result structure:

- Conversation purpose.
- Suggested opening.
- Facts to prepare.
- Questions to ask.
- Actions agreed.
- Documentation note.
- Follow-up date.
- Risk flag.
- Official resources if the matter is serious.

Add this to People Hub tools:

- Follow-up reminder option.
- Documentation trail copy block.
- "This needs proper advice" escalation state.
- Reusable manager notes.
- Separate HR-focused export format.

Learning design rules for People Hub:

- Keep the user calm. These topics can feel awkward or risky.
- Ask only what is needed to build the next useful step.
- Avoid HR jargon unless it is required, then explain it plainly.
- Use scenario-based wording so managers and employees can recognise their situation.
- Make serious-risk escalation clear and respectful.
- Keep the result practical: what to say, what to ask, what to document, and when to follow up.

### 9. Upgrade Existing Tools To Be More Outcome-Focused

#### Stop Doing It Twice

Add:

- Monthly and annual labour saving estimate.
- First task worth fixing.
- Automation readiness.
- Manual-work risk.
- Recommended next tool.
- "Start this week" action list.

#### Workflow Order

Add:

- 30-day roadmap.
- Impact vs effort score.
- Owner field.
- What not to touch yet.
- Next best tool recommendation.

#### Automation Opportunity Finder

Add:

- Automation MVP design.
- Trigger, source data, action, exception path and owner.
- Human approval point.
- Test plan.
- Salesforce/Twilio/Google/Microsoft-style implementation examples where relevant to the user.

#### Online Presence Audit

Add:

- Lead leakage risk.
- Highest revenue-impact fix.
- Customer friction score.
- First 48-hour action.
- Retest checklist.

#### Software Stack

Add:

- Recommended operating stack, not only shortlist.
- Current stack maturity.
- Duplicate-tool warning.
- Integration risk.
- "Use what you already pay for first" recommendation.

#### Business Thinking Tools

Add:

- One decision.
- One owner.
- One action.
- One review date.
- Link to the tool that helps execute the decision.

#### Brand Colour Picker

Add:

- Contrast check.
- Usage guidance.
- Copyable brand tokens.
- AI brand-voice tie-in.

#### Google Workspace For Sales

Add:

- Downloadable lead tracker template.
- Formula examples.
- Sales workflow maturity score.
- Gemini prompt examples tied to actual sales actions.

### 10. Conversion And Handoff

Replace generic CTAs with result-specific next steps:

- Help me automate this.
- Help me fix this workflow.
- Help me clean up my software stack.
- Help me improve enquiry conversion.
- Help me build this people process.
- Help me set up AI properly.

When a user clicks through, pass useful context:

- Tool name.
- Result type.
- Priority.
- Score.
- Recommended next action.

### 11. Analytics And Reporting

Track:

- Tool started.
- Tool completed.
- Result category.
- Risk level.
- CTA clicked.
- Account created after result.
- Saved result reopened.
- File uploaded after result.
- AI voice setup completed.
- AI platform selected.

Fix:

- Replace placeholder GA4 ID.
- Standardise event names.
- Keep analytics privacy-conscious.

## Risks

- The current workspace is behind the deploy archive. Building without reconciliation may lose newer account and AI work.
- AI guidance must avoid implying professional advice for legal, tax, employment, privacy or safety topics.
- People Hub must not accidentally position itself as formal HR/legal advice.
- Too much complexity could make the tools feel heavier. Keep MVP outputs practical and short.
- User-entered business voice and HR notes may contain sensitive information, so save and export behaviour must be clear.

## Next Steps

1. Reconcile the deploy archive into the workspace.
2. Add the shared outcome schema and helper functions.
3. Upgrade the AI Prompt Builder first, including platform guidance and Business Voice Builder.
4. Upgrade People Hub as a separate HR-focused hub with the same interaction quality.
5. Upgrade Automation Opportunity Finder and Workflow Order next, because they create the clearest operational value.
6. Upgrade the dashboard so saved results become next actions.
7. Add analytics, export options and targeted CTAs.

## MVP Acceptance Criteria

- AI Prompt Builder includes platform guidance, AI basics, Business Voice Builder and reusable prompt outputs.
- People Hub remains visually related but clearly HR/workplace focused.
- Every completed tool produces a structured outcome with next action, risk level and recommended follow-up.
- Member dashboard shows action-oriented saved results.
- Tone stays practical, direct and Australian.
- Legal, HR, tax, privacy and safety caveats are clear where needed.
- Most tool paths deliver a useful result within a small number of decisions, with no unnecessary account wall.
- Guidance is suitable for mixed confidence levels and different business demographics.
- Result language is plain, direct and free of jargon.
- Every tool has unique SEO metadata, schema where useful, and Australian business context.
- The platform uses English only, with Australian English spelling and `en-AU` page language.
- The advanced Business Sort-Out Map concept is represented in previews and ready for a future build.
