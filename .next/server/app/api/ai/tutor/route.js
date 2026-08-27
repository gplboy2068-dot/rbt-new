"use strict";(()=>{var e={};e.id=875,e.ids=[875],e.modules={399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},3175:(e,t,i)=>{i.r(t),i.d(t,{originalPathname:()=>m,patchFetch:()=>g,requestAsyncStorage:()=>d,routeModule:()=>c,serverHooks:()=>h,staticGenerationAsyncStorage:()=>p});var r={};i.r(r),i.d(r,{POST:()=>l});var n=i(3278),a=i(5002),o=i(4877),s=i(1309),u=i(449);async function l(e){let t=e.headers.get("x-forwarded-for"),i=t?t.split(",")[0].trim():"127.0.0.1",r=u.B.checkLimit(i);if(!r.allowed)return s.NextResponse.json({error:"RATE_LIMIT_EXCEEDED",message:r.reason||"Rate limit exceeded. Please try again later.",remainingHourly:r.remainingHourly,remainingDaily:r.remainingDaily},{status:429});try{let{action:t,query:r,questionContext:n,subject:a}=await e.json();u.B.recordUsage(i);let o="",l=null;if("explain_question"===t&&n)o=`### 🧠 AI Step-by-Step Breakdown

**Topic:** ${n.topic||"General"}
**Question:** *${n.question}*

#### 1. Core Principle & Recognition
To solve this effectively, identify the governing formula and conditions. For **${n.subject}**, accuracy comes from isolating the given parameters before calculating.

#### 2. Why Option ${String.fromCharCode(65+(n.correctAnswer??0))} is Correct:
${n.explanation||"This option represents the direct consequence of the governing formula without arithmetic distortion."}

#### 3. Common Pitfalls & Traps
* Watch out for sign errors or unit mismatch during intermediate steps.
* Distractors often calculate intermediate values before final simplification.

#### 💡 Quick Pro-Tip / Mnemonic
Always double-check boundary constraints when eliminating incorrect choices!`;else if("generate_question"===t){let e=a||"Mathematics";l={id:`ai_gen_${Date.now()}`,subject:e,topic:r||"Adaptive Concept Reinforcement",difficulty:"Medium",question:`[AI Generated] What is the primary characteristic of a converged sequence in metric spaces under ${e} fundamentals?`,options:["It is strictly monotonic and unbounded","Every subsequence converges to the same unique limit","Its terms alternate in sign indefinitely","It cannot contain isolated points"],correctAnswer:1,explanation:"In metric spaces, every subsequence of a convergent sequence converges to the exact same unique limit point.",hint:"Think about the uniqueness of limits.",tags:["AI-Generated",e,"Adaptive"]},o=`I have generated a new practice challenge for you on **${e}**! Try answering it below.`}else{let e=(r||"").toLowerCase();o=e.includes("srs")||e.includes("spaced repetition")?`### 📚 How Spaced Repetition (SRS) Works on RTB

Spaced Repetition schedules flashcard reviews right before your brain is about to forget the concept.

1. **Again (1)**: Resets interval to 1 day if you missed it.
2. **Hard (3)**: Shorter step forward.
3. **Good (4)**: Multiplies interval by the ease factor.
4. **Easy (5)**: Maximum interval leap for mastered knowledge.

Because RTB is completely **open and login-free**, all your intervals are safely calculated and cached in your browser's IndexedDB engine!`:e.includes("calculus")||e.includes("derivative")||e.includes("integral")?`### 📐 Calculus Mastery Tip

When dealing with composite functions $f(g(x))$, always apply the **Chain Rule**:
$$\\frac{d}{dx}[f(g(x))] = f'(g(x)) \\cdot g'(x)$$

For integration, check for logarithmic substitutions: whenever the numerator is the derivative of the denominator, $\\int \\frac{u'}{u} dx = \\ln|u| + C$.`:`### 🎓 AI Tutor Response

You asked: *"${r}"*

Here is the key breakdown:
1. **Fundamental Principle**: Focus on first-principles understanding rather than rote memorization.
2. **Application in Tests**: Exam questions frequently test edge cases or subtle counterexamples.
3. **Recommended Next Step**: Head to our **Practice Questions** or **Flashcards** section to reinforce this topic actively.

*Feel free to ask for step-by-step math derivations, physics formulas, reasoning logic, or coding explanations!*`}let c=u.B.checkLimit(i);return s.NextResponse.json({reply:o,generatedQuestion:l,quota:{remainingHourly:c.remainingHourly,remainingDaily:c.remainingDaily}})}catch{return s.NextResponse.json({error:"Failed to process AI tutor query"},{status:500})}}let c=new n.AppRouteRouteModule({definition:{kind:a.x.APP_ROUTE,page:"/api/ai/tutor/route",pathname:"/api/ai/tutor",filename:"route",bundlePath:"app/api/ai/tutor/route"},resolvedPagePath:"G:\\NEw website\\RTB NEW WEBSITE\\src\\app\\api\\ai\\tutor\\route.ts",nextConfigOutput:"",userland:r}),{requestAsyncStorage:d,staticGenerationAsyncStorage:p,serverHooks:h}=c,m="/api/ai/tutor/route";function g(){return(0,o.patchFetch)({serverHooks:h,staticGenerationAsyncStorage:p})}},449:(e,t,i)=>{i.d(t,{B:()=>a});let r={aiQueriesPerHourPerIp:15,aiQueriesPerDayPerIp:50,maxBatchGeneration:5,aiTutorEnabled:!0,rateLimitWindowMs:36e5};class n{getConfig(){return{...this.currentConfig}}updateConfig(e){return this.currentConfig={...this.currentConfig,...e},this.currentConfig}checkLimit(e){if(!this.currentConfig.aiTutorEnabled)return{allowed:!1,remainingHourly:0,remainingDaily:0,resetHourInSeconds:0,reason:"AI study assistance is temporarily paused by platform administrators."};let t=Date.now(),i=this.ipMap.get(e);i||(i={hourlyCount:0,hourlyReset:t+this.currentConfig.rateLimitWindowMs,dailyCount:0,dailyReset:t+864e5},this.ipMap.set(e,i)),t>i.hourlyReset&&(i.hourlyCount=0,i.hourlyReset=t+this.currentConfig.rateLimitWindowMs),t>i.dailyReset&&(i.dailyCount=0,i.dailyReset=t+864e5);let r=Math.max(0,this.currentConfig.aiQueriesPerHourPerIp-i.hourlyCount),n=Math.max(0,this.currentConfig.aiQueriesPerDayPerIp-i.dailyCount),a=Math.ceil(Math.max(0,i.hourlyReset-t)/1e3);return i.hourlyCount>=this.currentConfig.aiQueriesPerHourPerIp?{allowed:!1,remainingHourly:0,remainingDaily:n,resetHourInSeconds:a,reason:`Hourly rate limit reached (${this.currentConfig.aiQueriesPerHourPerIp}/hr). Resets in ${Math.ceil(a/60)} minutes.`}:i.dailyCount>=this.currentConfig.aiQueriesPerDayPerIp?{allowed:!1,remainingHourly:r,remainingDaily:0,resetHourInSeconds:a,reason:`Daily anonymous AI allowance reached (${this.currentConfig.aiQueriesPerDayPerIp}/day). Resets at midnight.`}:{allowed:!0,remainingHourly:r,remainingDaily:n,resetHourInSeconds:a}}recordUsage(e){let t=this.ipMap.get(e);t&&(t.hourlyCount+=1,t.dailyCount+=1)}getMetricsSummary(){return{trackedIpsCount:this.ipMap.size,activeSessionsToday:Array.from(this.ipMap.values()).filter(e=>e.dailyCount>0).length}}constructor(){this.ipMap=new Map,this.currentConfig={...r}}}let a=globalThis.__rtbRateLimiter||new n}};var t=require("../../../../webpack-runtime.js");t.C(e);var i=e=>t(t.s=e),r=t.X(0,[787,833],()=>i(3175));module.exports=r})();