import fs from 'fs';

const extraTerms = [
  // H
  {
    slug: 'high-probability-request-sequence',
    term: 'High-Probability (High-p) Request Sequence',
    letter: 'H',
    shortDefinition: 'An antecedent intervention where 2 to 5 easy, high-compliance tasks with known history of compliance are presented immediately before presenting a low-probability (difficult) target request.',
    inSimpleTerms: 'Building "behavioral momentum" by asking for a few easy things first (like high-fives) before asking for a harder chore or task.',
    detailedExplanation: 'Also known as behavioral momentum. Reinforcing rapid compliance with easy requests increases the likelihood that the learner will comply with the subsequent low-p request, reducing escape-maintained avoidance.',
    example: 'Example scenario: Before asking a child to sit and open a math workbook (low-p), the RBT asks for high-five, "Touch head," and "Spin around" (high-p requests), praising each before delivering the math instruction.',
    whyItMatters: 'Effective non-punitive antecedent strategy to decrease instructional resistance and increase task engagement.',
    commonMistake: 'Do not pause for too long between the high-p requests and the low-p request. The low-p command must be presented within 3 to 5 seconds of the final high-p completion to capitalize on momentum.',
    relatedTerms: ['antecedent', 'behavior-intervention-plan', 'reinforcement'],
    domain: 'Domain C — Behavior Acquisition',
    topicSlug: 'skill-acquisition-plans',
    studyGuideSlug: 'behavior-acquisition',
    practiceDomain: 'C: Behavior Acquisition',
    keywords: ['behavioral momentum', 'high-p', 'compliance', 'antecedent strategy'],
  },
  // J
  {
    slug: 'joint-attention',
    term: 'Joint Attention',
    letter: 'J',
    shortDefinition: 'The shared focus of two individuals on an object or event, established through gaze following, pointing, or vocal cues.',
    inSimpleTerms: 'When two people look at and pay attention to the same interesting thing together, like both looking at an airplane flying overhead.',
    detailedExplanation: 'Joint attention is a critical early communicative and social milestone. It encompasses Responding to Joint Attention (RJA - looking where another points) and Initiating Joint Attention (IJA - pointing or showing an item to share enjoyment).',
    example: 'Example scenario: A toddler sees a dog in the yard, turns to the RBT, points to the dog, and smiles to ensure the RBT sees the dog too (initiating joint attention).',
    whyItMatters: 'Pivotal social skill taught early in behavioral programs because it serves as the foundation for language, social interactions, and cooperative play.',
    commonMistake: 'Joint attention is not simply requesting. Pointing to GET an item is a mand; pointing simply to SHARE enjoyment or notice something is joint attention.',
    relatedTerms: ['mand', 'tact', 'naturalistic-teaching'],
    domain: 'Domain C — Behavior Acquisition',
    topicSlug: 'skill-acquisition-plans',
    studyGuideSlug: 'behavior-acquisition',
    practiceDomain: 'C: Behavior Acquisition',
    keywords: ['shared focus', 'pointing', 'gaze', 'social skills'],
  },
  // Q
  {
    slug: 'qabf',
    term: 'Questions About Behavioral Function (QABF)',
    letter: 'Q',
    shortDefinition: 'A 25-item indirect behavioral assessment rating scale completed by caregivers to evaluate the hypothesized functions of challenging behavior.',
    inSimpleTerms: 'A questionnaire that parents or teachers fill out to help guess why a behavior is happening.',
    detailedExplanation: 'The QABF assesses 5 potential functions/factors: Attention, Escape, Non-social (automatic/sensory), Physical (pain/discomfort), and Tangible. As an indirect assessment, it relies on informant recall and must be confirmed through direct observations.',
    example: 'Example scenario: A caregiver completes the QABF rating scale with an RBT, rating questions 1 to 25 from "Never" to "Often" regarding when a student hits peers.',
    whyItMatters: 'RBTs may assist BCBAs by distributing or collecting rating scales from caregivers and school staff during initial assessment phases.',
    commonMistake: 'The QABF is an indirect assessment and does NOT prove functional causation. Direct ABC data or experimental analysis is required for confirmation.',
    relatedTerms: ['indirect-assessment', 'functional-behavior-assessment', 'abc-data'],
    domain: 'Domain B — Behavior Assessment',
    topicSlug: 'abc-narrative-data',
    studyGuideSlug: 'behavior-assessment',
    practiceDomain: 'B: Behavior Assessment',
    keywords: ['qabf', 'rating scale', 'indirect assessment', 'questionnaire'],
  },
  // V
  {
    slug: 'variable-ratio-schedule',
    term: 'Variable Ratio (VR) Schedule of Reinforcement',
    letter: 'V',
    shortDefinition: 'An intermittent schedule of reinforcement where reinforcement is delivered after an unpredictable, average number of correct responses.',
    inSimpleTerms: 'Rewarding a behavior after an unpredictable number of times (like an average of every 5 times), just like a slot machine.',
    detailedExplanation: 'VR schedules produce high, consistent, and steady rates of responding with no post-reinforcement pause. They are highly resistant to extinction. Example: A VR-3 schedule might reinforce after 2 responses, then 5 responses, then 2 responses (averaging 3).',
    example: 'Example scenario: During math drills, the RBT provides praise and tokens on a VR-4 schedule (reinforcing after 3 correct answers, then 5, then 4), keeping the learner consistently engaged.',
    whyItMatters: 'Used to thin reinforcement schedules during maintenance and generalization to match natural community contingencies.',
    commonMistake: 'Confusing Variable Ratio (VR) with Fixed Ratio (FR). Fixed Ratio reinforces after an exact, predictable count (e.g., every 5th time); Variable Ratio reinforces around an unpredictable average.',
    relatedTerms: ['reinforcement', 'token-economy', 'maintenance'],
    domain: 'Domain C — Behavior Acquisition',
    topicSlug: 'skill-acquisition-plans',
    studyGuideSlug: 'behavior-acquisition',
    practiceDomain: 'C: Behavior Acquisition',
    keywords: ['vr', 'schedule of reinforcement', 'intermittent', 'variable ratio'],
  },
  {
    slug: 'visual-schedule',
    term: 'Visual Schedule',
    letter: 'V',
    shortDefinition: 'An antecedent intervention that utilizes sequential pictures, icons, or text to represent the scheduled activities of a therapy session or day.',
    inSimpleTerms: 'A visual picture or checklist that shows the learner what activities are happening and in what order.',
    detailedExplanation: 'Visual schedules promote predictability, ease environmental transitions, reduce anxiety, and foster independent task completion by providing clear, concrete visual cues regarding upcoming demands and breaks.',
    example: 'Example scenario: A visual schedule shows icons: 1) Math puzzle, 2) Snack time, 3) Coloring, 4) Outdoor playground. The student removes each icon as the activity is completed.',
    whyItMatters: 'Extremely effective proactive antecedent strategy for reducing transition-induced challenging behaviors.',
    commonMistake: 'A visual schedule should be accessible and interactive for the learner (e.g., allowing them to flip over or check off finished items), not merely held by the therapist.',
    relatedTerms: ['antecedent', 'behavior-intervention-plan', 'naturalistic-teaching'],
    domain: 'Domain C — Behavior Acquisition',
    topicSlug: 'skill-acquisition-plans',
    studyGuideSlug: 'behavior-acquisition',
    practiceDomain: 'C: Behavior Acquisition',
    keywords: ['visual support', 'antecedent', 'schedule', 'icons', 'transition'],
  },
];

// Read current glossary-data.ts
const existingContent = fs.readFileSync('src/data/glossary-data.ts', 'utf8');
const match = existingContent.match(/export const GLOSSARY_TERMS: GlossaryTerm\[\] = (\[[\s\S]*?\]);\s*$/);
if (!match) {
  console.error('Could not match GLOSSARY_TERMS in glossary-data.ts');
  process.exit(1);
}

const currentTerms = JSON.parse(match[1]);
// Merge and sort alphabetically by term name
const combined = [...currentTerms, ...extraTerms].sort((a, b) => a.term.localeCompare(b.term));

// Assign correct letter
combined.forEach(t => {
  t.letter = t.term.charAt(0).toUpperCase();
});

const updatedContent = `// Authoritative Glossary Data for RBTPracticeExam.xyz
// Aligned with BACB RBT Test Content Outline (3rd ed.) and RBT Ethics Code (2.0)
// Independent educational glossary resource with original fictional examples.

import { GlossaryTerm } from '../types';

export const GLOSSARY_TERMS: GlossaryTerm[] = ${JSON.stringify(combined, null, 2)};
`;

fs.writeFileSync('src/data/glossary-data.ts', updatedContent, 'utf8');
console.log('Successfully updated src/data/glossary-data.ts to', combined.length, 'terms.');
