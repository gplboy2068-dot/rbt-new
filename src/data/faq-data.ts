// Authoritative FAQ Data for RBTPracticeExam.xyz
// Verified against current Behavior Analyst Certification Board (BACB) materials and Pearson VUE testing policies.
// Independent educational practice resource with full transparency.

export interface FAQCategory {
  id: string;
  title: string;
  description: string;
  badge: string;
}

export interface FAQEntry {
  id: string;
  categoryId: string;
  question: string;
  // Raw HTML string for the visible accordion answer, including safe semantic links
  answerHtml: string;
  // Clean plain text string for JSON-LD FAQPage schema
  answerText: string;
}

export const FAQ_CATEGORIES: FAQCategory[] = [
  {
    id: 'exam-basics',
    title: 'RBT Exam Basics & Structure',
    description: 'Fundamental details regarding examination format, question counts, testing duration, and content blueprint.',
    badge: 'Core Information',
  },
  {
    id: 'study-prep',
    title: 'Study Strategy & Preparation',
    description: 'Evidence-based study timelines, 30-day frameworks, domain remediation, and active recall strategies.',
    badge: 'Preparation Tips',
  },
  {
    id: 'practice-scoring',
    title: 'Practice Questions & Scoring Interpretation',
    description: 'Understanding practice scores, diagnostic benchmarks, clinical vignettes, and educational rationales.',
    badge: 'Scoring & Practice',
  },
  {
    id: 'exam-day',
    title: 'Exam Day & Pearson VUE Testing Rules',
    description: 'Identification requirements, arrival times, calculator policies, scratch materials, breaks, and lockers.',
    badge: 'Testing Center Procedures',
  },
  {
    id: 'results-retesting',
    title: 'Results, Scoring & Retesting Policy',
    description: 'Score reporting timelines, pass/fail notifications, diagnostic reports, waiting periods, and retest limits.',
    badge: 'Official Results',
  },
  {
    id: 'platform-transparency',
    title: 'RBTPracticeExam.xyz Platform & Privacy',
    description: 'Open-access policies, independent status, local browser data storage, developer identity, and error reporting.',
    badge: 'Platform Transparency',
  },
];

export const FAQ_ENTRIES: FAQEntry[] = [
  // =========================================================================
  // CATEGORY 1: RBT Exam Basics & Structure
  // =========================================================================
  {
    id: 'faq-what-is-rbt-exam',
    categoryId: 'exam-basics',
    question: 'What is the RBT Exam?',
    answerHtml: `<p>The <strong>Registered Behavior Technician® (RBT®) examination</strong> is a national paraprofessional certification assessment administered by the <strong>Behavior Analyst Certification Board® (BACB®)</strong>. It evaluates foundational competence in delivering applied behavior analysis (ABA) services under the ongoing supervision of a Board Certified Behavior Analyst® (BCBA®), Board Certified Assistant Behavior Analyst® (BCaBA®), or Qualified Healthcare Professional (QHP).</p><p class="mt-2">RBTs do not independently assess clients, design behavior intervention plans, or modify clinical programs. Instead, their role is direct implementation of skill acquisition and behavior reduction protocols developed by their supervising analyst.</p>`,
    answerText: `The Registered Behavior Technician (RBT) examination is a national paraprofessional certification assessment administered by the Behavior Analyst Certification Board (BACB). It evaluates foundational competence in delivering applied behavior analysis (ABA) services under the ongoing supervision of a BCBA, BCaBA, or Qualified Healthcare Professional. RBTs do not independently assess clients or design behavior intervention plans; their role is direct implementation of clinical protocols developed by their supervisor.`
  },
  {
    id: 'faq-exam-format-questions',
    categoryId: 'exam-basics',
    question: 'How many questions are on the RBT exam, and what is the time limit?',
    answerHtml: `<p>According to official BACB examination specifications, the RBT exam consists of <strong>85 multiple-choice questions</strong> delivered via computer-based testing at Pearson VUE testing centers (or Pearson OnVUE remote proctoring where approved). You are allotted exactly <strong>90 minutes (1 hour 30 minutes)</strong> to complete the exam.</p><p class="mt-2">The 85 questions are divided into two categories:</p><ul class="list-disc pl-5 mt-1 space-y-1"><li><strong>75 Scored Questions:</strong> These items directly count toward your examination score.</li><li><strong>10 Unscored Pilot (Pretest) Questions:</strong> These experimental items are evaluated by the BACB for statistical validity in future exam cycles. They do not affect your final score, but you cannot tell which questions are scored and which are unscored.</li></ul>`,
    answerText: `The BACB RBT exam consists of 85 multiple-choice questions completed within a 90-minute testing window. Of the 85 items, 75 are scored questions that determine your result, and 10 are unscored pilot questions evaluated by the BACB for future exam forms. Candidates cannot distinguish between scored and unscored items during the test.`
  },
  {
    id: 'faq-content-domains',
    categoryId: 'exam-basics',
    question: 'What content domains are covered on the RBT exam?',
    answerHtml: `<p>The examination is organized around the official BACB <strong>RBT Test Content Outline (3rd ed.)</strong>, covering six core behavioral domains:</p><ul class="list-disc pl-5 mt-1.5 space-y-1"><li><strong>Domain A: Data Collection and Graphing</strong> (13 scored questions / 17%) — See our <a href="/study-guides/measurement-guide" class="text-brand-600 dark:text-brand-400 font-semibold underline">Measurement Study Guide</a></li><li><strong>Domain B: Behavior Assessment</strong> (8 scored questions / 11%) — See our <a href="/study-guides/behavior-assessment" class="text-brand-600 dark:text-brand-400 font-semibold underline">Behavior Assessment Guide</a></li><li><strong>Domain C: Behavior Acquisition</strong> (19 scored questions / 25%) — See our <a href="/study-guides/behavior-acquisition" class="text-brand-600 dark:text-brand-400 font-semibold underline">Skill Acquisition Guide</a></li><li><strong>Domain D: Behavior Reduction</strong> (14 scored questions / 19%) — See our <a href="/study-guides/behavior-reduction-guide" class="text-brand-600 dark:text-brand-400 font-semibold underline">Behavior Reduction Guide</a></li><li><strong>Domain E: Documentation and Reporting</strong> (10 scored questions / 13%) — See our <a href="/study-guides/documentation-and-reporting" class="text-brand-600 dark:text-brand-400 font-semibold underline">Documentation Guide</a></li><li><strong>Domain F: Ethics</strong> (11 scored questions / 15%) — See our <a href="/study-guides/ethics" class="text-brand-600 dark:text-brand-400 font-semibold underline">Ethics Guide</a></li></ul><p class="mt-2">You can review complete curriculum outlines across all individual tasks in our <a href="/topics" class="text-brand-600 dark:text-brand-400 font-semibold underline">Curriculum Topic Outlines</a>.</p>`,
    answerText: `The RBT exam covers six core domains based on the BACB RBT Test Content Outline (3rd ed.): Domain A: Data Collection and Graphing (13 scored questions / 17%); Domain B: Behavior Assessment (8 scored questions / 11%); Domain C: Behavior Acquisition (19 scored questions / 25%); Domain D: Behavior Reduction (14 scored questions / 19%); Domain E: Documentation and Reporting (10 scored questions / 13%); and Domain F: Ethics (11 scored questions / 15%). Total: 75 scored questions.`
  },
  {
    id: 'faq-eligibility-prerequisites',
    categoryId: 'exam-basics',
    question: 'What are the official eligibility requirements before taking the RBT exam?',
    answerHtml: `<p>Before you can schedule and sit for the RBT examination with Pearson VUE, you must satisfy official BACB eligibility criteria and submit an application:</p><ol class="list-decimal pl-5 mt-1.5 space-y-1"><li>Be at least <strong>18 years old</strong>.</li><li>Hold a <strong>high school diploma</strong> or equivalent legal credential.</li><li>Complete a qualifying <strong>40-hour RBT training course</strong> based on the current RBT Test Content Outline.</li><li>Pass a background check meeting regulatory guidelines.</li><li>Successfully pass the <strong>RBT Initial Competency Assessment</strong> administered by a qualified BCBA or BCaBA.</li><li>Submit an application with documentation to the BACB. Once approved, the BACB issues your official Authorization to Test (ATT) letter.</li></ol><p class="mt-2 text-xs text-slate-500 dark:text-slate-400">Always consult the official <a href="https://www.bacb.com/rbt-handbook/" target="_blank" rel="noopener noreferrer" class="underline font-semibold">BACB RBT Handbook</a> for complete and current application guidelines.</p>`,
    answerText: `To sit for the RBT examination, candidates must be at least 18 years old, hold a high school diploma or equivalent, complete a qualifying 40-hour training course, pass a background check, successfully pass the RBT Initial Competency Assessment administered by a qualified BCBA or BCaBA, and receive an approved Authorization to Test (ATT) letter from the BACB.`
  },

  // =========================================================================
  // CATEGORY 2: Study Strategy & Preparation
  // =========================================================================
  {
    id: 'faq-how-to-prepare',
    categoryId: 'study-prep',
    question: 'How should I prepare for the RBT exam effectively?',
    answerHtml: `<p>Effective RBT preparation combines conceptual terminology mastery with scenario-based critical thinking. Follow this four-stage approach:</p><ol class="list-decimal pl-5 mt-1.5 space-y-1"><li><strong>Master Key Definitions:</strong> Become fluent in behavioral vocabulary using our <a href="/glossary" class="text-brand-600 dark:text-brand-400 font-semibold underline">Interactive RBT & ABA Glossary</a>.</li><li><strong>Study Core Domain Principles:</strong> Read our comprehensive <a href="/study-guides" class="text-brand-600 dark:text-brand-400 font-semibold underline">Pillar Study Guides</a> covering all six examination domains.</li><li><strong>Practice Scenario Reasoning:</strong> Solve situational questions in our <a href="/practice-questions" class="text-brand-600 dark:text-brand-400 font-semibold underline">Practice Questions Hub</a>, always reviewing rationales for correct and incorrect options.</li><li><strong>Simulate Test Conditions:</strong> Take full-length timed sessions in our <a href="/mock-exams" class="text-brand-600 dark:text-brand-400 font-semibold underline">85Q Timed Mock Exams</a> to build pacing and stamina.</li></ol>`,
    answerText: `To prepare effectively, master behavioral definitions using the glossary, review comprehensive study guides across all six domains, practice scenario-based questions while carefully reading answer rationales, and take full-length 85-question timed mock exams to develop pacing and stamina.`
  },
  {
    id: 'faq-how-long-to-study',
    categoryId: 'study-prep',
    question: 'How long should I study before taking the RBT exam?',
    answerHtml: `<p>Most candidates dedicate between <strong>3 to 6 weeks</strong> of focused preparation (averaging 15 to 25 total study hours) after completing their 40-hour training course. The exact time required depends on your prior clinical experience as a behavior technician and your familiarity with ABA terminology.</p><p class="mt-2">Short daily study sessions of 30 to 45 minutes using active recall and spaced repetition are significantly more effective than cramming for multiple hours right before your test appointment.</p>`,
    answerText: `Most candidates study for 3 to 6 weeks, totaling approximately 15 to 25 hours of focused preparation after completing the 40-hour training. Daily 30 to 45-minute sessions utilizing spaced repetition and active recall yield far better retention than last-minute cramming.`
  },
  {
    id: 'faq-30-day-study-plan',
    categoryId: 'study-prep',
    question: 'Can I prepare for the RBT exam in 30 days?',
    answerHtml: `<p><strong>Yes.</strong> A structured 30-day study framework is one of the most efficient and manageable timelines for working adults and student candidates. We provide a full day-by-day roadmap in our comprehensive guide: <a href="/articles/how-to-pass-rbt-exam-30-day-study-plan" class="text-brand-600 dark:text-brand-400 font-semibold underline">How to Pass the RBT Exam: A Realistic 30-Day Study Plan</a>.</p><p class="mt-2">The 30-day framework organizes your effort into four progressive phases:</p><ul class="list-disc pl-5 mt-1 space-y-1"><li><strong>Week 1 (Days 1–7):</strong> Measurement and Assessment foundation (Domains A & B).</li><li><strong>Week 2 (Days 8–14):</strong> Skill Acquisition deep dive (Domain C).</li><li><strong>Week 3 (Days 15–21):</strong> Behavior Reduction and Documentation (Domains D & E).</li><li><strong>Week 4 (Days 22–30):</strong> Ethics mastery (Domain F), timed mock exams, and final review.</li></ul>`,
    answerText: `Yes. A structured 30-day study plan is an effective timeframe. Our 30-Day Study Plan organizes preparation into four weekly phases: Week 1 focuses on Measurement and Assessment, Week 2 covers Skill Acquisition, Week 3 covers Behavior Reduction and Documentation, and Week 4 is dedicated to Ethics and full-length timed mock exams.`
  },
  {
    id: 'faq-weak-domain-remediation',
    categoryId: 'study-prep',
    question: 'How should I study if I am weak in one specific domain?',
    answerHtml: `<p>When diagnostic practice shows lower performance in a specific area, isolate that domain rather than doing random full-length tests:</p><ul class="list-disc pl-5 mt-1.5 space-y-1"><li><strong>Measurement weakness:</strong> Study our guide on <a href="/articles/continuous-vs-discontinuous-measurement-rbt-guide" class="text-brand-600 dark:text-brand-400 font-semibold underline">Continuous vs. Discontinuous Measurement</a> and review latency, IRT, and interval recording procedures.</li><li><strong>Behavior Reduction weakness:</strong> Read our deep dive on the <a href="/articles/the-4-functions-of-behavior-seat-explained" class="text-brand-600 dark:text-brand-400 font-semibold underline">4 Functions of Behavior (SEAT Explained)</a> and practice differentiating DRA, DRI, and DRO.</li><li><strong>Ethics or Scope weakness:</strong> Review the <a href="/study-guides/ethics" class="text-brand-600 dark:text-brand-400 font-semibold underline">Domain F Ethics Guide</a> to master dual relationships, client dignity, and mandatory reporting thresholds.</li><li><strong>Targeted Drills:</strong> Use <a href="/study" class="text-brand-600 dark:text-brand-400 font-semibold underline">Unlimited Study Mode</a> filtered specifically to your target domain until your accuracy reaches consistent mastery.</li></ul>`,
    answerText: `To strengthen a weak domain, isolate that domain with targeted guides and drills. Review continuous vs discontinuous measurement for Domain A, the 4 functions of behavior (SEAT) for Domain D, or ethical boundaries for Domain F. Use domain-filtered practice questions in Unlimited Study Mode until you achieve consistent accuracy.`
  },
  {
    id: 'faq-review-wrong-answers',
    categoryId: 'study-prep',
    question: 'How should I review questions I answer incorrectly?',
    answerHtml: `<p>Never merely look at the correct letter choice and move on. Effective review requires analyzing the <strong>clinical rationale</strong> behind the question:</p><ol class="list-decimal pl-5 mt-1.5 space-y-1"><li><strong>Identify the error type:</strong> Did you misread the clinical scenario (e.g., confusing antecedent vs. consequence), misunderstand a technical term, or miss a qualifier like "EXCEPT" or "FIRST"?</li><li><strong>Inspect the distractors:</strong> Understand why the incorrect choices are flawed in that specific clinical context.</li><li><strong>Reference the core principle:</strong> Look up the associated concept in the <a href="/glossary" class="text-brand-600 dark:text-brand-400 font-semibold underline">Glossary</a> or <a href="/study-guides" class="text-brand-600 dark:text-brand-400 font-semibold underline">Study Guides</a> to reinforce the underlying behavioral mechanism.</li></ol>`,
    answerText: `When you answer a question incorrectly, analyze the full clinical rationale. Determine whether the error stemmed from misreading the scenario, unfamiliar vocabulary, or failing to identify key qualifiers. Review why the incorrect options are wrong and look up the underlying concept in the glossary or study guides.`
  },
  {
    id: 'faq-concepts-before-questions',
    categoryId: 'study-prep',
    question: 'Should I study concepts before taking practice questions?',
    answerHtml: `<p><strong>Yes, absolutely.</strong> Attempting practice questions without first reviewing core behavioral principles often leads to memorizing specific question wording rather than understanding the underlying clinical logic. The real BACB exam uses novel clinical scenarios that you have never seen before.</p><p class="mt-2">First review definitions and clinical examples in the <a href="/study-guides" class="text-brand-600 dark:text-brand-400 font-semibold underline">Domain Pillar Guides</a>. Once you grasp the concepts, use <a href="/practice-questions" class="text-brand-600 dark:text-brand-400 font-semibold underline">Practice Questions</a> to test your ability to discriminate between behavioral principles in simulated situations.</p>`,
    answerText: `Yes. Reviewing core behavioral concepts before attempting practice questions prevents rote memorization. Because the actual exam presents novel clinical vignettes, you need a strong conceptual foundation to apply behavioral principles accurately in unfamiliar situations.`
  },
  {
    id: 'faq-how-to-use-mock-exams',
    categoryId: 'study-prep',
    question: 'How should I use timed mock exams in my study routine?',
    answerHtml: `<p>Timed mock exams serve two essential functions: <strong>pacing awareness</strong> and <strong>test stamina</strong>. With 85 questions to complete in 90 minutes, you have roughly <strong>63 seconds per question</strong>.</p><p class="mt-2">Take your first diagnostic mock exam early to establish a baseline score. Take 1 to 2 additional full-length exams in our <a href="/mock-exams" class="text-brand-600 dark:text-brand-400 font-semibold underline">Timed Mock Exam Center</a> during Weeks 3 and 4 under strict test conditions: 90 minutes uninterrupted, no notes, and no pausing.</p>`,
    answerText: `Use timed mock exams to build stamina and practice pacing (approximately 63 seconds per question). Take an initial diagnostic mock exam to identify baseline weaknesses, then take full-length mock exams under strict timed, uninterrupted conditions in the final two weeks of preparation.`
  },

  // =========================================================================
  // CATEGORY 3: Practice Questions & Scoring Interpretation
  // =========================================================================
  {
    id: 'faq-are-questions-official',
    categoryId: 'practice-scoring',
    question: 'Are the questions on RBTPracticeExam.xyz official BACB questions?',
    answerHtml: `<p><strong>No.</strong> RBTPracticeExam.xyz has no official affiliation with the Behavior Analyst Certification Board® (BACB®). The BACB does not release, license, or endorse actual certification examination questions to any third-party prep platform.</p><p class="mt-2">All questions on this site are independent, original educational practice items developed in alignment with the publicly available <strong>BACB RBT Test Content Outline (3rd ed.)</strong> and standard applied behavior analysis textbooks (e.g., Cooper, Heron, & Heward). For complete methodology details, read our <a href="/methodology" class="text-brand-600 dark:text-brand-400 font-semibold underline">Question Methodology</a> and <a href="/editorial-policy" class="text-brand-600 dark:text-brand-400 font-semibold underline">Editorial Policy</a>.</p>`,
    answerText: `No. The questions on RBTPracticeExam.xyz are not official BACB exam questions. The BACB does not release or endorse proprietary examination questions. All practice items on this site are independently authored educational simulations aligned with the BACB RBT Test Content Outline (3rd ed.).`
  },
  {
    id: 'faq-practice-score-prediction',
    categoryId: 'practice-scoring',
    question: 'Does a passing practice score guarantee that I will pass the real exam?',
    answerHtml: `<p><strong>No.</strong> High performance on practice tests is a positive indicator of your knowledge retention, but it does <strong>not guarantee</strong> that you will pass the official BACB examination.</p><p class="mt-2">Practice tests cannot replicate the exact proprietary questions, psychometric equating models, or psychological testing pressures present at Pearson VUE test centers. Treat your practice score as an internal diagnostic metric to guide study priorities, not as a guarantee of certification success.</p>`,
    answerText: `No. Practice test scores do not guarantee exam success. While strong practice scores indicate conceptual familiarity, they cannot replicate official testing conditions, proprietary test forms, or psychometric equating models used by the BACB at Pearson VUE centers.`
  },
  {
    id: 'faq-how-to-interpret-score',
    categoryId: 'practice-scoring',
    question: 'How should I interpret my practice scores on this site?',
    answerHtml: `<p>On RBTPracticeExam.xyz, practice tests are scored as raw percentages based on your correct answers. As a general educational benchmark, we recommend targeting a consistent score of <strong>80% to 85% or higher</strong> across multiple full-length mock exams before taking the official test.</p><p class="mt-2">More importantly, examine your <strong>domain breakdown</strong>: achieving 90% in Skill Acquisition does not compensate for scoring 50% in Ethics. Use domain score reports to ensure balanced competence across all six task areas.</p>`,
    answerText: `On this platform, practice tests are scored as raw percentages. We recommend targeting consistent scores of 80% to 85% or higher across full-length mock exams. Pay close attention to domain breakdowns to ensure balanced mastery across all six areas rather than relying on an overall average.`
  },
  {
    id: 'faq-why-review-rationales',
    categoryId: 'practice-scoring',
    question: 'Why should I review the explanation after answering a question?',
    answerHtml: `<p>Clinical scenario questions often feature multiple distractors that sound plausible in everyday conversation. Reviewing the detailed rationale teaches you to identify the <strong>discriminative features</strong> of the scenario—such as why an action qualifies as <a href="/glossary#negative-reinforcement" class="text-brand-600 dark:text-brand-400 font-semibold underline">negative reinforcement</a> rather than <a href="/glossary#positive-reinforcement" class="text-brand-600 dark:text-brand-400 font-semibold underline">positive punishment</a>, or why a specific boundary crosses into an unethical dual relationship.</p>`,
    answerText: `Reviewing explanations teaches you how to identify subtle clinical discriminative stimuli in scenario questions. It clarifies why plausible-sounding distractors are incorrect under strict behavioral terminology and reinforces the exact clinical principles tested on the exam.`
  },

  // =========================================================================
  // CATEGORY 4: Exam Day & Pearson VUE Testing Rules
  // =========================================================================
  {
    id: 'faq-what-id-needed',
    categoryId: 'exam-day',
    question: 'What identification do I need to bring to Pearson VUE on exam day?',
    answerHtml: `<p>Pearson VUE testing centers have strict identity verification policies. You must present <strong>two valid (unexpired) forms of identification</strong> upon arrival:</p><ul class="list-disc pl-5 mt-1.5 space-y-1"><li><strong>Primary ID:</strong> Must be government-issued, contain your current photograph, and have your signature (e.g., State Driver's License, Passport, Military ID, State ID card).</li><li><strong>Secondary ID:</strong> Must contain your signature and pre-printed legal name (e.g., signed debit/credit card, employee ID, student ID).</li></ul><p class="mt-2 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-xl border border-amber-200 dark:border-amber-900/50">CRITICAL: The first and last names on both IDs must match the legal name on your BACB account and Pearson VUE appointment confirmation letter exactly. Middle names or initials do not need to match, but discrepancies in first or last names will result in denied entry and forfeiture of testing fees.</p>`,
    answerText: `Pearson VUE requires two valid, unexpired forms of identification. Both IDs must include your signature, and the primary ID must be government-issued with a recent photo (driver's license, passport, military ID). The secondary ID can be a signed credit card, debit card, or employee ID. The legal first and last names on both IDs must match your BACB profile and appointment notice exactly.`
  },
  {
    id: 'faq-when-to-arrive',
    categoryId: 'exam-day',
    question: 'When should I arrive at the Pearson VUE testing center?',
    answerHtml: `<p>You should arrive at least <strong>30 minutes prior</strong> to your scheduled appointment time. This buffer is required to complete mandatory check-in procedures, including identification verification, digital signature capture, security photo capture, and biometric palm vein scanning.</p><p class="mt-2">If you arrive late, the testing center staff may turn you away, and your exam appointment and fee will be forfeited.</p>`,
    answerText: `Arrive at the Pearson VUE testing center at least 30 minutes before your scheduled appointment. This time is required for identity verification, signature capture, photograph taking, and biometric palm vein scanning. Late arrivals may be turned away and forfeit their fees.`
  },
  {
    id: 'faq-can-i-bring-calculator',
    categoryId: 'exam-day',
    question: 'Can I bring my own calculator to the RBT exam?',
    answerHtml: `<p><strong>No.</strong> Personal handheld calculators of any kind are strictly prohibited in the testing room. Pearson VUE testing software provides an <strong>on-screen digital calculator</strong> directly within the computer testing interface for any math-based questions (such as calculating rate, percentage of intervals, or duration).</p>`,
    answerText: `No. Personal handheld calculators are strictly prohibited in the Pearson VUE testing room. An on-screen digital calculator is built directly into the computer testing software for any calculation questions.`
  },
  {
    id: 'faq-can-i-use-scratch-paper',
    categoryId: 'exam-day',
    question: 'Can I bring scratch paper or notebooks to the exam?',
    answerHtml: `<p><strong>No.</strong> You are not permitted to bring personal paper, notebooks, sticky notes, or writing pens into the examination room. Pearson VUE test administrators will provide you with a <strong>reusable erasable note board (or booklet) and dry-erase marker</strong> at check-in.</p><p class="mt-2">You may use this board for notes or calculations during your exam. All materials must remain on your desk and must be returned to the proctor when you check out.</p>`,
    answerText: `No personal scratch paper, notebooks, or writing utensils are allowed. The testing center provides an erasable whiteboard booklet and dry-erase marker at check-in. All scratch materials must be returned to the test administrator upon departure.`
  },
  {
    id: 'faq-can-i-take-break',
    categoryId: 'exam-day',
    question: 'Can I take a break during the 90-minute examination?',
    answerHtml: `<p>You may take an unscheduled restroom break during the exam, but <strong>the 90-minute examination timer will NOT stop</strong>. The clock continues running the entire time you are away from your workstation.</p><p class="mt-2">Additionally, you must complete security check-out and re-check-in procedures (including ID and biometric palm scans) every time you exit and re-enter the testing room. Scheduled, paused breaks are not provided for the standard 90-minute RBT exam unless pre-approved under formal BACB medical accommodation rules.</p>`,
    answerText: `Unscheduled breaks are allowed (e.g., for restrooms), but the 90-minute testing timer does NOT pause. The timer continues running while you are away, and you must complete full check-in security procedures upon re-entering. Scheduled pauses are only provided for pre-approved medical accommodations.`
  },
  {
    id: 'faq-personal-items-lockers',
    categoryId: 'exam-day',
    question: 'What items can I bring into the testing room?',
    answerHtml: `<p><strong>Only your approved identification documents and the locker key provided by the testing center are permitted inside the testing room.</strong></p><p class="mt-2">All personal belongings must be stored in secure lockers outside the testing room before entering. Prohibited items in the testing room include:</p><ul class="list-disc pl-5 mt-1 space-y-1"><li>Mobile phones, smart watches, fitness trackers, and all electronics (must be turned completely off).</li><li>Bags, backpacks, purses, and wallets.</li><li>Coats, jackets, hats, and scarves (except recognized religious apparel).</li><li>Food, drinks, water bottles, gum, and study notes.</li></ul>`,
    answerText: `No personal belongings are allowed inside the testing room. Cell phones, smart watches, bags, jackets, food, drinks, and study materials must be locked in a personal storage locker provided at the testing center before you enter.`
  },
  {
    id: 'faq-how-to-reschedule',
    categoryId: 'exam-day',
    question: 'What happens if I need to cancel or reschedule my exam appointment?',
    answerHtml: `<p>According to BACB and Pearson VUE examination policies, you must cancel or reschedule your exam appointment at least <strong>48 hours in advance</strong> of your scheduled appointment time through your Pearson VUE online candidate portal or by phone.</p><p class="mt-2">If you reschedule or cancel with less than 48 hours notice, or if you fail to appear for your appointment (no-show), your appointment fee will be forfeited. Always refer to your official Pearson VUE appointment confirmation email for exact deadlines and fee policies.</p>`,
    answerText: `Appointments must be rescheduled or canceled at least 48 hours prior to the scheduled start time through your Pearson VUE account or by phone. Changes made within 48 hours or failing to appear result in the forfeiture of your appointment fee.`
  },

  // =========================================================================
  // CATEGORY 5: Results, Scoring & Retesting Policy
  // =========================================================================
  {
    id: 'faq-when-results-received',
    categoryId: 'results-retesting',
    question: 'When and how do I receive my official RBT exam results?',
    answerHtml: `<p>You will receive an <strong>immediate printed unofficial score report</strong> at the Pearson VUE test center test administrator desk as soon as you finish your exam and complete checkout.</p><ul class="list-disc pl-5 mt-1.5 space-y-1"><li><strong>If you pass:</strong> Your printout will indicate <strong>"PASS"</strong>. The BACB does not report numerical scores or percentage correct for passing candidates to prevent competitive ranking. Official certification confirmation will post to your online BACB account within 24–48 hours.</li><li><strong>If you do not pass:</strong> Your printout will indicate <strong>"DID NOT PASS"</strong> and will include a detailed diagnostic breakdown showing your performance relative to the passing threshold across each content domain.</li></ul>`,
    answerText: `You receive an immediate printed unofficial score report at the Pearson VUE test center upon checkout. Passing candidates receive a report stating 'PASS' (no numerical score is reported). Candidates who do not pass receive a diagnostic report displaying performance across each content domain to assist with re-study. Official results appear in your BACB portal shortly after.`
  },
  {
    id: 'faq-retesting-policy',
    categoryId: 'results-retesting',
    question: 'What is the BACB retesting policy if I do not pass the RBT exam?',
    answerHtml: `<p>Under current official BACB policies, candidates who do not pass the RBT exam are permitted to retake it with the following rules:</p><ul class="list-disc pl-5 mt-1.5 space-y-1"><li><strong>Attempt Limit:</strong> You may take the RBT exam up to <strong>8 times</strong> within your active 1-year Authorization to Test (ATT) window.</li><li><strong>Mandatory Waiting Period:</strong> You must wait a minimum of <strong>7 days</strong> between test attempts before taking the exam again. This mandatory period ensures time for remediation and study.</li><li><strong>Retesting Fee:</strong> An examination fee is payable to Pearson VUE for each test attempt.</li><li><strong>Expiration:</strong> If you do not pass within the 1-year authorization window, you must restart the application process, which includes completing a new 40-hour training course and a new Initial Competency Assessment.</li></ul>`,
    answerText: `If you do not pass, BACB policy allows up to 8 examination attempts within your 1-year Authorization to Test (ATT) window. There is a mandatory minimum 7-day waiting period between attempts to allow remediation, and an exam appointment fee applies to each attempt. If the 1-year window expires, a new application and competency assessment are required.`
  },

  // =========================================================================
  // CATEGORY 6: RBTPracticeExam.xyz Platform & Privacy
  // =========================================================================
  {
    id: 'faq-is-platform-free',
    categoryId: 'platform-transparency',
    question: 'Is this platform really 100% free with no sign-up or paywalls?',
    answerHtml: `<p><strong>Yes.</strong> RBTPracticeExam.xyz is committed to an open-access educational model. All practice questions, 85-question timed mock exams, SuperMemo-2 flashcards, domain study guides, and clinical articles are completely free to use with <strong>zero mandatory account creation, zero email gates, and zero payment paywalls</strong>.</p>`,
    answerText: `Yes. RBTPracticeExam.xyz is 100% free and open access. All practice questions, mock exams, flashcards, study guides, and articles are available without mandatory sign-up, email submission, or paywalls.`
  },
  {
    id: 'faq-how-progress-saved',
    categoryId: 'platform-transparency',
    question: 'Where is my study progress saved if I do not create an account?',
    answerHtml: `<p>Your study history, answered question records, flashcard mastery intervals (SM-2 algorithm), and bookmarks are saved locally on your own device using your browser's <strong>IndexedDB (RTB_StudyDB)</strong> and localStorage.</p><p class="mt-2">No personal tracking data or private identifiers are stored on external web servers. To safeguard or transfer your progress between computers or mobile phones, you can download a <strong>1-Click JSON Progress Backup</strong> anytime from the <a href="/analytics" class="text-brand-600 dark:text-brand-400 font-semibold underline">Analytics Page</a>.</p>`,
    answerText: `Your study history, question attempts, and flashcard intervals are saved locally in your browser using IndexedDB and local storage. No personal data is stored on remote servers. You can export a 1-Click JSON backup anytime from the Analytics page to transfer your data between devices.`
  },
  {
    id: 'faq-who-maintains-site',
    categoryId: 'platform-transparency',
    question: 'Who created and maintains RBTPracticeExam.xyz?',
    answerHtml: `<p>RBTPracticeExam.xyz is developed and maintained as an independent educational technology project by <strong>Firoz Khan</strong>, a Full Stack Developer at <strong>FK Digital Media</strong>. For complete developer profile details and our organizational mission, visit our <a href="/about" class="text-brand-600 dark:text-brand-400 font-semibold underline">About Us Page</a>.</p><p class="mt-2 text-xs text-slate-500 dark:text-slate-400"><em>Transparency Note:</em> Firoz Khan is a software engineer and web developer. Educational content on this site is compiled from publicly available, authoritative reference materials (including the BACB RBT Test Content Outline and peer-reviewed ABA literature). We do not claim clinical BCBA or BACB endorsement.</p>`,
    answerText: `RBTPracticeExam.xyz was created and is maintained by Firoz Khan, a Full Stack Developer at FK Digital Media. He is a software engineer, not a BCBA or clinician. Study content is synthesized from authoritative public curriculum sources including the BACB RBT Test Content Outline and standard ABA textbooks.`
  },
  {
    id: 'faq-how-to-report-error',
    categoryId: 'platform-transparency',
    question: 'How do I report a typo, question correction, or curriculum suggestion?',
    answerHtml: `<p>We uphold strict educational accuracy and welcome feedback from learners, RBTs, and BCBAs. If you discover a typographical error, ambiguous phrasing, or questionable question rationale, please submit a report via our <a href="/contact#report-error" class="text-brand-600 dark:text-brand-400 font-semibold underline">Report an Error Form</a> or email us at <code>support@rbtpracticeexam.xyz</code>.</p><p class="mt-2">Every report is reviewed against authoritative applied behavior analysis reference materials and current BACB outlines.</p>`,
    answerText: `To report an error, typo, or question clarification, submit a report via our Contact page or email support@rbtpracticeexam.xyz. All feedback is reviewed against authoritative ABA textbooks and current BACB outlines.`
  },
];

export const OFFICIAL_RESOURCES = [
  {
    name: 'Behavior Analyst Certification Board (BACB)',
    description: 'The official credentialing organization establishing RBT standards, application procedures, and ethics codes.',
    url: 'https://www.bacb.com',
  },
  {
    name: 'Official BACB RBT Handbook',
    description: 'The authoritative candidate handbook outlining eligibility, application steps, maintenance, and examination policies.',
    url: 'https://www.bacb.com/rbt-handbook/',
  },
  {
    name: 'BACB RBT Test Content Outline (3rd ed.)',
    description: 'The official examination blueprint defining the 6 content domains and required paraprofessional task competencies.',
    url: 'https://www.bacb.com/wp-content/uploads/2023/12/RBT-3rd-Edition-Test-Content-Outline_240202-a.pdf',
  },
  {
    name: 'Pearson VUE BACB Testing Guidelines',
    description: 'Pearson VUE scheduling portal, testing center identification requirements, and candidate security rules.',
    url: 'https://home.pearsonvue.com/bacb',
  },
];
