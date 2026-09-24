/**
 * Centralized Educational Link Resolver for RBTPracticeExam.xyz (Step 7)
 * Maps questions to authoritative Study Guides, Curriculum Topics, Glossary Concepts,
 * Clinical Articles, and Next-Step Practice / Mock Exams.
 *
 * Implements a closed-loop learning journey:
 * Question -> Answer/Rationale -> Study Guide / Glossary -> Practice -> Mock Exam.
 */

export interface EducationalLink {
  title: string;
  url: string;
  anchorText: string;
  badge?: string;
  type: 'study-guide' | 'glossary' | 'topic' | 'article' | 'practice' | 'mock-exam';
}

export interface QuestionLearningPath {
  studyGuide: EducationalLink;
  glossary?: EducationalLink;
  topic?: EducationalLink;
  article?: EducationalLink;
  practice: EducationalLink;
  mockExam: EducationalLink;
}

export interface ResolvableQuestion {
  id?: string;
  domainId?: string;
  domainName?: string;
  topicId?: string;
  topicName?: string;
  content?: string;
  explanation?: string;
  tags?: string[];
}

// 1. Authoritative Domain to Study Guide Mapping
const DOMAIN_STUDY_GUIDES: Record<string, { slug: string; title: string; anchorText: string }> = {
  A: {
    slug: 'measurement-guide',
    title: 'Domain A: Measurement & Data Collection Guide',
    anchorText: 'Review Domain A: Measurement in Study Guide',
  },
  B: {
    slug: 'behavior-assessment',
    title: 'Domain B: Behavior Assessment Guide',
    anchorText: 'Review Domain B: Behavior Assessment in Study Guide',
  },
  C: {
    slug: 'behavior-acquisition',
    title: 'Domain C: Behavior Acquisition Guide',
    anchorText: 'Review Domain C: Skill Acquisition in Study Guide',
  },
  D: {
    slug: 'behavior-reduction-guide',
    title: 'Domain D: Behavior Reduction Guide',
    anchorText: 'Review Domain D: Behavior Reduction in Study Guide',
  },
  E: {
    slug: 'documentation-and-reporting',
    title: 'Domain E: Documentation & Reporting Guide',
    anchorText: 'Review Domain E: Documentation in Study Guide',
  },
  F: {
    slug: 'ethics',
    title: 'Domain F: Ethics & Professional Conduct Guide',
    anchorText: 'Review Domain F: Ethics & Conduct in Study Guide',
  },
};

// 2. Published Topic Slugs & Metadata (Domain A - F)
const TOPIC_SLUGS: Record<string, { slug: string; name: string; domainCode: string }> = {
  // Domain A
  'continuous-measurement': { slug: 'continuous-measurement', name: 'Continuous Measurement Procedures', domainCode: 'A' },
  'discontinuous-measurement': { slug: 'discontinuous-measurement', name: 'Discontinuous Measurement (Time Sampling)', domainCode: 'A' },
  'permanent-product': { slug: 'permanent-product', name: 'Permanent Product Recording', domainCode: 'A' },
  'graphing-data': { slug: 'graphing-data', name: 'Enter Data and Update Graphs', domainCode: 'A' },
  // Domain B
  'preference-assessments': { slug: 'preference-assessments', name: 'Stimulus Preference Assessments', domainCode: 'B' },
  'abc-narrative-data': { slug: 'abc-narrative-data', name: 'Functional Assessment Assistance & ABC Data', domainCode: 'B' },
  // Domain C
  'skill-acquisition-plans': { slug: 'skill-acquisition-plans', name: 'Components of a Skill Acquisition Plan', domainCode: 'C' },
  'prompting-hierarchies': { slug: 'prompting-hierarchies', name: 'Prompting and Prompt Fading Hierarchies', domainCode: 'C' },
  'shaping-chaining': { slug: 'shaping-chaining', name: 'Shaping, Task Analysis, and Chaining', domainCode: 'C' },
  // Domain D
  'behavior-reduction-plans': { slug: 'behavior-reduction-plans', name: 'Behavior Intervention Plans & Functions of Behavior', domainCode: 'D' },
  'differential-reinforcement': { slug: 'differential-reinforcement', name: 'Differential Reinforcement (DRA, DRI, DRO)', domainCode: 'D' },
  'extinction-procedures': { slug: 'extinction-procedures', name: 'Extinction Procedures & Managing Bursts', domainCode: 'D' },
  // Domain E
  'objective-session-notes': { slug: 'objective-session-notes', name: 'Writing Objective Clinical Session Notes', domainCode: 'E' },
  'incident-reporting': { slug: 'incident-reporting', name: 'Incident Reporting & Crisis Documentation', domainCode: 'E' },
  // Domain F
  'professional-boundaries-gifts': { slug: 'professional-boundaries-gifts', name: 'Professional Boundaries, Gifts & Avoiding Dual Relationships', domainCode: 'F' },
  'client-dignity-communication': { slug: 'client-dignity-communication', name: 'Client Dignity, Assent & Confidentiality', domainCode: 'F' },
};

// 3. Concept to Glossary Term Anchors
interface GlossaryConceptRule {
  domainCode?: string;
  keywords: string[];
  slug: string;
  term: string;
  anchorText: string;
}

const GLOSSARY_CONCEPT_RULES: GlossaryConceptRule[] = [
  // Specific Measurement Concepts (Domain A)
  { domainCode: 'A', keywords: ['inter-response time', 'irt', 'between two behaviors', 'between two consecutive'], slug: 'inter-response-time', term: 'Inter-Response Time (IRT)', anchorText: 'Explore Inter-Response Time (IRT) in Glossary' },
  { domainCode: 'A', keywords: ['latency', 'time between the sd', 'initiation of the response', 'begins the behavior', 'starts the behavior'], slug: 'latency', term: 'Latency', anchorText: 'Explore Latency in Glossary' },
  { domainCode: 'A', keywords: ['duration', 'length of time', 'how long a behavior lasts', 'onset to cessation'], slug: 'duration', term: 'Duration', anchorText: 'Explore Duration in Glossary' },
  { domainCode: 'A', keywords: ['rate', 'per hour', 'per minute', 'divided by time'], slug: 'rate', term: 'Rate', anchorText: 'Explore Rate in Glossary' },
  { domainCode: 'A', keywords: ['frequency', 'count', 'tally', 'number of times a behavior occurs'], slug: 'frequency', term: 'Frequency', anchorText: 'Explore Frequency in Glossary' },
  { domainCode: 'A', keywords: ['whole interval', 'entire duration of the interval', '100% of the interval'], slug: 'whole-interval-recording', term: 'Whole Interval Recording', anchorText: 'Explore Whole Interval Recording in Glossary' },
  { domainCode: 'A', keywords: ['partial interval', 'any point during the interval', 'at least once during the interval'], slug: 'partial-interval-recording', term: 'Partial Interval Recording', anchorText: 'Explore Partial Interval Recording in Glossary' },
  { domainCode: 'A', keywords: ['momentary time', 'mts', 'exact end of each interval', 'at the end of the interval'], slug: 'momentary-time-sampling', term: 'Momentary Time Sampling', anchorText: 'Explore Momentary Time Sampling in Glossary' },
  { domainCode: 'A', keywords: ['permanent product', 'tangible outcome', 'environmental effect', 'worksheet', 'lasting product'], slug: 'permanent-product', term: 'Permanent Product', anchorText: 'Explore Permanent Product in Glossary' },
  { domainCode: 'A', keywords: ['graphing', 'line graph', 'abscissa', 'ordinate', 'phase change line', 'trend', 'variability'], slug: 'graphing', term: 'Graphing Data', anchorText: 'Explore ABA Graphing in Glossary' },

  // Assessment Concepts (Domain B)
  { domainCode: 'B', keywords: ['mswo', 'without replacement'], slug: 'multiple-stimulus-without-replacement', term: 'MSWO Assessment', anchorText: 'Explore MSWO Preference Assessment in Glossary' },
  { domainCode: 'B', keywords: ['paired stimulus', 'forced choice'], slug: 'paired-stimulus', term: 'Paired Stimulus', anchorText: 'Explore Paired Stimulus Assessment in Glossary' },
  { domainCode: 'B', keywords: ['free operant', 'unrestricted access'], slug: 'free-operant', term: 'Free Operant Assessment', anchorText: 'Explore Free Operant Assessment in Glossary' },
  { domainCode: 'B', keywords: ['preference assessment', 'reinforcer assessment', 'identify reinforcers'], slug: 'preference-assessment', term: 'Preference Assessment', anchorText: 'Explore Preference Assessments in Glossary' },
  { domainCode: 'B', keywords: ['abc data', 'antecedent-behavior-consequence', 'abc narrative', 'three-term contingency'], slug: 'abc-data', term: 'ABC Data', anchorText: 'Explore ABC Data Collection in Glossary' },
  { domainCode: 'B', keywords: ['functional behavior assessment', 'fba', 'functional assessment'], slug: 'functional-behavior-assessment', term: 'Functional Behavior Assessment', anchorText: 'Explore FBA Assistance in Glossary' },

  // Skill Acquisition Concepts (Domain C)
  { domainCode: 'C', keywords: ['prompt fading', 'fading prompts', 'transfer of stimulus control'], slug: 'prompt-fading', term: 'Prompt Fading', anchorText: 'Explore Prompt Fading in Glossary' },
  { domainCode: 'C', keywords: ['most-to-least', 'full physical'], slug: 'most-to-least-prompting', term: 'Most-to-Least Prompting', anchorText: 'Explore Most-to-Least Prompting in Glossary' },
  { domainCode: 'C', keywords: ['least-to-most', 'independent opportunity'], slug: 'least-to-most-prompting', term: 'Least-to-Most Prompting', anchorText: 'Explore Least-to-Most Prompting in Glossary' },
  { domainCode: 'C', keywords: ['prompt', 'prompts', 'gestural', 'verbal prompt', 'model prompt'], slug: 'prompt', term: 'Prompts', anchorText: 'Explore Prompt Hierarchies in Glossary' },
  { domainCode: 'C', keywords: ['backward chaining', 'last step'], slug: 'backward-chaining', term: 'Backward Chaining', anchorText: 'Explore Backward Chaining in Glossary' },
  { domainCode: 'C', keywords: ['forward chaining', 'first step'], slug: 'forward-chaining', term: 'Forward Chaining', anchorText: 'Explore Forward Chaining in Glossary' },
  { domainCode: 'C', keywords: ['task analysis', 'broken down into discrete steps'], slug: 'task-analysis', term: 'Task Analysis', anchorText: 'Explore Task Analysis in Glossary' },
  { domainCode: 'C', keywords: ['chaining', 'behavior chain'], slug: 'chaining', term: 'Chaining', anchorText: 'Explore Behavior Chaining in Glossary' },
  { domainCode: 'C', keywords: ['shaping', 'successive approximations'], slug: 'shaping', term: 'Shaping', anchorText: 'Explore Shaping in Glossary' },
  { domainCode: 'C', keywords: ['generalization', 'across settings', 'across people'], slug: 'generalization', term: 'Generalization', anchorText: 'Explore Generalization in Glossary' },
  { domainCode: 'C', keywords: ['maintenance', 'maintained over time'], slug: 'maintenance', term: 'Maintenance', anchorText: 'Explore Maintenance in Glossary' },

  // Behavior Reduction Concepts (Domain D)
  { domainCode: 'D', keywords: ['extinction burst', 'temporary increase in intensity', 'escalation upon extinction'], slug: 'extinction-burst', term: 'Extinction Burst', anchorText: 'Explore Extinction Bursts in Glossary' },
  { domainCode: 'D', keywords: ['extinction', 'withholding reinforcement', 'planned ignoring'], slug: 'extinction', term: 'Extinction', anchorText: 'Explore Extinction in Glossary' },
  { domainCode: 'D', keywords: ['dra', 'differential reinforcement of alternative', 'alternative behavior'], slug: 'differential-reinforcement', term: 'Differential Reinforcement (DRA)', anchorText: 'Explore Differential Reinforcement in Glossary' },
  { domainCode: 'D', keywords: ['dro', 'differential reinforcement of other', 'zero occurrence'], slug: 'differential-reinforcement', term: 'Differential Reinforcement (DRO)', anchorText: 'Explore DRO in Glossary' },
  { domainCode: 'D', keywords: ['dri', 'differential reinforcement of incompatible', 'incompatible behavior'], slug: 'differential-reinforcement', term: 'Differential Reinforcement (DRI)', anchorText: 'Explore DRI in Glossary' },
  { domainCode: 'D', keywords: ['differential reinforcement'], slug: 'differential-reinforcement', term: 'Differential Reinforcement', anchorText: 'Explore Differential Reinforcement in Glossary' },
  { domainCode: 'D', keywords: ['functions of behavior', 'seat', 'sensory', 'escape', 'tangible', 'attention'], slug: 'behavior-intervention-plan', term: 'Functions of Behavior & BIP', anchorText: 'Explore BIP & Functions in Glossary' },

  // Documentation Concepts (Domain E)
  { domainCode: 'E', keywords: ['objective session notes', 'mentalism', 'objective language', 'subjective feelings'], slug: 'objective-session-notes', term: 'Objective Session Notes', anchorText: 'Explore Session Documentation in Glossary' },
  { domainCode: 'E', keywords: ['incident report', 'safety crisis', 'elopement', 'injury'], slug: 'incident-report', term: 'Incident Reporting', anchorText: 'Explore Incident Reporting in Glossary' },
  { domainCode: 'E', keywords: ['mandated reporting', 'suspected abuse', 'neglect'], slug: 'mandated-reporting', term: 'Mandated Reporting', anchorText: 'Explore Mandated Reporting in Glossary' },

  // Ethics & Boundaries Concepts (Domain F)
  { domainCode: 'F', keywords: ['dual relationship', 'multiple relationship', 'babysit', 'friend on social media', 'gift'], slug: 'dual-relationship', term: 'Dual Relationships', anchorText: 'Explore Dual Relationships in Glossary' },
  { domainCode: 'F', keywords: ['supervision', '5% of hours', 'monthly supervision'], slug: 'supervision-requirements', term: 'Supervision Requirements', anchorText: 'Explore Supervision Requirements in Glossary' },
  { domainCode: 'F', keywords: ['dignity', 'assent', 'confidentiality', 'hipaa'], slug: 'assent', term: 'Client Dignity & Assent', anchorText: 'Explore Client Dignity & Assent in Glossary' },
];

/**
 * Normalizes domain code from various inputs ('A', 'dom_a', 'A: Measurement', 'Domain A...')
 */
function extractDomainCode(question: ResolvableQuestion): string {
  const raw = `${question.domainId || ''} ${question.domainName || ''} ${(question.tags || []).join(' ')}`;
  const match = raw.match(/\b([A-F])\b/i);
  if (match) {
    return match[1].toUpperCase();
  }
  if (/measurement/i.test(raw)) return 'A';
  if (/assessment/i.test(raw)) return 'B';
  if (/acquisition/i.test(raw) || /skill/i.test(raw)) return 'C';
  if (/reduction/i.test(raw) || /behavior/i.test(raw)) return 'D';
  if (/documentation/i.test(raw) || /reporting/i.test(raw)) return 'E';
  if (/ethics/i.test(raw) || /conduct/i.test(raw) || /supervision/i.test(raw)) return 'F';
  return 'A'; // Safe default
}

/**
 * Resolves the corresponding topic slug for a question.
 */
function resolveTopicSlug(question: ResolvableQuestion, domainCode: string): string | null {
  const combined = `${question.topicName || ''} ${question.topicId || ''} ${question.content || ''} ${question.explanation || ''}`.toLowerCase();

  switch (domainCode) {
    case 'A':
      if (combined.includes('discontinuous') || combined.includes('whole interval') || combined.includes('partial interval') || combined.includes('momentary')) {
        return 'discontinuous-measurement';
      }
      if (combined.includes('permanent product')) {
        return 'permanent-product';
      }
      if (combined.includes('graph') || combined.includes('visual analysis') || combined.includes('abscissa') || combined.includes('ordinate')) {
        return 'graphing-data';
      }
      return 'continuous-measurement';

    case 'B':
      if (combined.includes('preference') || combined.includes('mswo') || combined.includes('forced choice') || combined.includes('free operant')) {
        return 'preference-assessments';
      }
      return 'abc-narrative-data';

    case 'C':
      if (combined.includes('prompt') || combined.includes('fading') || combined.includes('hierarch')) {
        return 'prompting-hierarchies';
      }
      if (combined.includes('shaping') || combined.includes('chaining') || combined.includes('task analysis')) {
        return 'shaping-chaining';
      }
      return 'skill-acquisition-plans';

    case 'D':
      if (combined.includes('differential') || combined.includes('dra') || combined.includes('dro') || combined.includes('dri')) {
        return 'differential-reinforcement';
      }
      if (combined.includes('extinction')) {
        return 'extinction-procedures';
      }
      return 'behavior-reduction-plans';

    case 'E':
      if (combined.includes('incident') || combined.includes('crisis') || combined.includes('abuse') || combined.includes('mandated')) {
        return 'incident-reporting';
      }
      return 'objective-session-notes';

    case 'F':
      if (combined.includes('boundary') || combined.includes('dual') || combined.includes('gift') || combined.includes('supervis')) {
        return 'professional-boundaries-gifts';
      }
      return 'client-dignity-communication';

    default:
      return null;
  }
}

/**
 * Resolves contextually matched glossary term with domain awareness and keyword specificity.
 */
function resolveGlossaryTerm(question: ResolvableQuestion, domainCode: string): EducationalLink {
  const combined = `${question.content || ''} ${question.explanation || ''} ${question.topicName || ''} ${(question.tags || []).join(' ')}`.toLowerCase();

  // Find all matches, calculating score = (sameDomain ? 1000 : 0) + maxMatchedKeywordLength
  let bestRule: GlossaryConceptRule | null = null;
  let highestScore = 0;

  for (const rule of GLOSSARY_CONCEPT_RULES) {
    let matchedKwLength = 0;
    for (const kw of rule.keywords) {
      if (combined.includes(kw) && kw.length > matchedKwLength) {
        matchedKwLength = kw.length;
      }
    }

    if (matchedKwLength > 0) {
      const isDomainMatch = rule.domainCode === domainCode;
      const score = (isDomainMatch ? 1000 : 0) + matchedKwLength;
      if (score > highestScore) {
        highestScore = score;
        bestRule = rule;
      }
    }
  }

  if (bestRule) {
    return {
      title: bestRule.term,
      url: `/glossary#${bestRule.slug}`,
      anchorText: bestRule.anchorText,
      badge: 'Glossary Concept',
      type: 'glossary',
    };
  }

  // Domain-specific reliable fallbacks
  const domainFallbacks: Record<string, { slug: string; term: string; anchorText: string }> = {
    A: { slug: 'continuous-measurement', term: 'Continuous Measurement', anchorText: 'Explore Measurement in Glossary' },
    B: { slug: 'preference-assessment', term: 'Preference Assessment', anchorText: 'Explore Assessment Terms in Glossary' },
    C: { slug: 'prompt-fading', term: 'Prompt Fading', anchorText: 'Explore Acquisition Concepts in Glossary' },
    D: { slug: 'differential-reinforcement', term: 'Differential Reinforcement', anchorText: 'Explore Behavior Reduction in Glossary' },
    E: { slug: 'objective-session-notes', term: 'Objective Session Notes', anchorText: 'Explore Documentation in Glossary' },
    F: { slug: 'dual-relationship', term: 'Dual Relationships', anchorText: 'Explore Ethics Concepts in Glossary' },
  };

  const fb = domainFallbacks[domainCode] || domainFallbacks['A'];
  return {
    title: fb.term,
    url: `/glossary#${fb.slug}`,
    anchorText: fb.anchorText,
    badge: 'Glossary Concept',
    type: 'glossary',
  };
}

/**
 * Resolves optional clinical article if directly relevant to the question stem.
 */
function resolveArticle(question: ResolvableQuestion): EducationalLink | undefined {
  const text = `${question.content || ''} ${question.explanation || ''} ${question.topicName || ''}`.toLowerCase();

  if (text.includes('discontinuous') || text.includes('whole interval') || text.includes('partial interval') || text.includes('momentary') || (text.includes('continuous') && text.includes('rate'))) {
    return {
      title: 'Continuous vs. Discontinuous Measurement RBT Guide',
      url: '/articles/continuous-vs-discontinuous-measurement-rbt-guide',
      anchorText: 'Read Deep-Dive: Continuous vs. Discontinuous Measurement',
      badge: 'Clinical Article',
      type: 'article',
    };
  }

  if (text.includes('seat') || text.includes('function') && (text.includes('sensory') || text.includes('escape') || text.includes('attention') || text.includes('tangible'))) {
    return {
      title: 'The 4 Functions of Behavior (SEAT) Explained',
      url: '/articles/the-4-functions-of-behavior-seat-explained',
      anchorText: 'Read Deep-Dive: The 4 Functions of Behavior (SEAT)',
      badge: 'Clinical Article',
      type: 'article',
    };
  }

  return undefined;
}

/**
 * Main Educational Link Resolver for Questions.
 * Returns a complete educational learning pathway for any question.
 */
export function resolveQuestionLearningPath(question: ResolvableQuestion): QuestionLearningPath {
  const domainCode = extractDomainCode(question);
  const guideMeta = DOMAIN_STUDY_GUIDES[domainCode] || DOMAIN_STUDY_GUIDES['A'];

  // 1. Primary Educational Link: Study Guide
  const studyGuide: EducationalLink = {
    title: guideMeta.title,
    url: `/study-guides/${guideMeta.slug}`,
    anchorText: guideMeta.anchorText,
    badge: 'Pillar Study Guide',
    type: 'study-guide',
  };

  // 2. Secondary Educational Link: Glossary Term
  const glossary = resolveGlossaryTerm(question, domainCode);

  // 3. Topic Curriculum Link (if matching topic found)
  const topicSlug = resolveTopicSlug(question, domainCode);
  let topic: EducationalLink | undefined = undefined;
  if (topicSlug && TOPIC_SLUGS[topicSlug]) {
    const meta = TOPIC_SLUGS[topicSlug];
    topic = {
      title: meta.name,
      url: `/topics/${meta.slug}`,
      anchorText: `Topic Review: ${meta.name}`,
      badge: 'Curriculum Topic',
      type: 'topic',
    };
  }

  // 4. Clinical Article Link (optional deep dive)
  const article = resolveArticle(question);

  // 5. Related Practice Questions Link
  const domainLabel = question.domainName || `Domain ${domainCode}`;
  const practiceUrl = topic ? `/topics/${topicSlug}` : `/practice-questions?domain=${encodeURIComponent(domainLabel)}`;
  const practice: EducationalLink = {
    title: `Practice ${topic ? topic.title : domainLabel}`,
    url: practiceUrl,
    anchorText: `Practice Related ${domainCode} Questions`,
    badge: 'Practice Bank',
    type: 'practice',
  };

  // 6. Full Mock Exam Link
  const mockExam: EducationalLink = {
    title: 'Full 85-Question RBT Mock Exam',
    url: '/mock-exams',
    anchorText: 'Take Timed 85-Question Mock Exam',
    badge: 'Mock Exam',
    type: 'mock-exam',
  };

  return {
    studyGuide,
    glossary,
    topic,
    article,
    practice,
    mockExam,
  };
}
