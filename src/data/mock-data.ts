import { Question, Flashcard, MockExam, StudyGuide, Domain, Topic } from '@/types';

export const INITIAL_DOMAINS: Domain[] = [
  { id: 'dom_a', code: 'A', name: 'Measurement', description: 'Data collection, continuous & discontinuous measurement, graphing', orderIndex: 1 },
  { id: 'dom_b', code: 'B', name: 'Assessment', description: 'Preference assessments, assisting functional assessments, ABC data', orderIndex: 2 },
  { id: 'dom_c', code: 'C', name: 'Skill Acquisition', description: 'Discrete trial training, shaping, chaining, prompting, generalization', orderIndex: 3 },
  { id: 'dom_d', code: 'D', name: 'Behavior Reduction', description: 'Behavior intervention plans, extinction, differential reinforcement', orderIndex: 4 },
  { id: 'dom_e', code: 'E', name: 'Documentation & Reporting', description: 'Objective session notes, legal requirements, incident reporting', orderIndex: 5 },
  { id: 'dom_f', code: 'F', name: 'Professional Conduct', description: 'Ethics, dual relationships, role boundaries, BACB supervision', orderIndex: 6 },
];

export const INITIAL_TOPICS: Topic[] = [
  { id: 'top_a01', domainId: 'dom_a', code: 'A-01', name: 'Continuous Measurement', orderIndex: 1 },
  { id: 'top_a02', domainId: 'dom_a', code: 'A-02', name: 'Discontinuous Measurement', orderIndex: 2 },
  { id: 'top_b01', domainId: 'dom_b', code: 'B-01', name: 'Preference Assessments', orderIndex: 1 },
  { id: 'top_b02', domainId: 'dom_b', code: 'B-02', name: 'Functional Assessment Assistance', orderIndex: 2 },
  { id: 'top_c01', domainId: 'dom_c', code: 'C-01', name: 'Discrete Trial Teaching (DTT)', orderIndex: 1 },
  { id: 'top_c02', domainId: 'dom_c', code: 'C-02', name: 'Prompting & Prompt Fading', orderIndex: 2 },
  { id: 'top_d01', domainId: 'dom_d', code: 'D-01', name: 'Functions of Behavior', orderIndex: 1 },
  { id: 'top_d02', domainId: 'dom_d', code: 'D-02', name: 'Differential Reinforcement (DRA/DRO/DRI)', orderIndex: 2 },
  { id: 'top_e01', domainId: 'dom_e', code: 'E-01', name: 'Objective Session Notes', orderIndex: 1 },
  { id: 'top_f01', domainId: 'dom_f', code: 'F-01', name: 'Professional Boundaries & Dual Relationships', orderIndex: 1 },
];

export const INITIAL_QUESTIONS: Question[] = [
  {
    "id": "mq-rbt-freq-001",
    "code": "mq-rbt-freq-001",
    "domainId": "A",
    "domainName": "A — Data Collection and Graphing",
    "topicId": "Continuous",
    "topicName": "Continuous Measurement (A-01)",
    "difficulty": "Easy",
    "content": "What does frequency measure in behavior data collection?",
    "options": [
      "The number of times a behavior occurs",
      "How long a behavior lasts",
      "The time between two behaviors",
      "How intense a behavior is"
    ],
    "correctAnswer": 0,
    "explanation": "Frequency is a count-based measure that records the number of times a behavior occurs during an observation period.\n\n[Clinical Context]: RBTs use frequency counts for behaviors with a clear beginning and end, such as tallying how many times a client raises a hand or hits.",
    "referenceSource": "BACB — RBT Test Content Outline (3rd Edition)",
    "tags": [
      "A",
      "Easy"
    ],
    "certification": "RBT",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "mq-rbt-freq-002",
    "code": "mq-rbt-freq-002",
    "domainId": "A",
    "domainName": "A — Data Collection and Graphing",
    "topicId": "Continuous",
    "topicName": "Continuous Measurement (A-01)",
    "difficulty": "Easy",
    "content": "Frequency is best classified as which type of measurement?",
    "options": [
      "A permanent product measurement",
      "A continuous measurement procedure",
      "An interval recording procedure",
      "A time-sampling procedure"
    ],
    "correctAnswer": 1,
    "explanation": "Frequency recording requires the observer to detect and record every occurrence of the target behavior throughout the session, which makes it a continuous measurement procedure.\n\n[Clinical Context]: Because frequency is continuous, the RBT must remain attentive throughout the entire session so no occurrence is missed.",
    "referenceSource": "BACB — RBT Test Content Outline (3rd Edition)",
    "tags": [
      "A",
      "Easy"
    ],
    "certification": "RBT",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "mq-rbt-freq-003",
    "code": "mq-rbt-freq-003",
    "domainId": "A",
    "domainName": "A — Data Collection and Graphing",
    "topicId": "Continuous",
    "topicName": "Continuous Measurement (A-01)",
    "difficulty": "Easy",
    "content": "Which of the following behaviors is MOST appropriate to measure using frequency?",
    "options": [
      "A client crying for varying lengths of time",
      "A client engaging in continuous hand flapping",
      "A client raising their hand to ask a question",
      "A client's speed completing a worksheet"
    ],
    "correctAnswer": 2,
    "explanation": "Hand raising is a discrete behavior with a clear, consistent beginning and end, which makes it well suited to a simple count.\n\n[Clinical Context]: Frequency works best for behaviors that are brief and consistent in duration, so each occurrence can be counted as one unit.",
    "referenceSource": "BACB — RBT Test Content Outline (3rd Edition)",
    "tags": [
      "A",
      "Easy"
    ],
    "certification": "RBT",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "mq-rbt-freq-004",
    "code": "mq-rbt-freq-004",
    "domainId": "A",
    "domainName": "A — Data Collection and Graphing",
    "topicId": "Continuous",
    "topicName": "Continuous Measurement (A-01)",
    "difficulty": "Easy",
    "content": "[Scenario]: The RBT places a tally mark on a data sheet each time the client says the word.\n\nAn RBT is asked to count how many times a client says 'no' during a 30-minute session. Which measurement procedure is being used?",
    "options": [
      "Duration",
      "Latency",
      "Interresponse time",
      "Frequency"
    ],
    "correctAnswer": 3,
    "explanation": "Placing a tally mark for each occurrence of the behavior is the defining feature of frequency (event) recording.\n\n[Clinical Context]: Tally counting is one of the simplest and most common tools RBTs use to collect frequency data in session.",
    "referenceSource": "BACB — RBT Test Content Outline (3rd Edition)",
    "tags": [
      "A",
      "Easy"
    ],
    "certification": "RBT",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "mq-rbt-freq-005",
    "code": "mq-rbt-freq-005",
    "domainId": "A",
    "domainName": "A — Data Collection and Graphing",
    "topicId": "Continuous",
    "topicName": "Continuous Measurement (A-01)",
    "difficulty": "Easy",
    "content": "Which tool would an RBT most likely use to collect frequency data in real time?",
    "options": [
      "A hand tally counter",
      "A stopwatch",
      "A behavior rating scale",
      "A permanent product checklist"
    ],
    "correctAnswer": 0,
    "explanation": "A hand tally counter allows the observer to increment a count each time the behavior occurs, which directly matches how frequency data is collected.\n\n[Clinical Context]: Many RBTs carry small clicker-style counters so they can record occurrences without looking away from the client for long.",
    "referenceSource": "BACB — RBT Test Content Outline (3rd Edition)",
    "tags": [
      "A",
      "Easy"
    ],
    "certification": "RBT",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "mq-rbt-freq-006",
    "code": "mq-rbt-freq-006",
    "domainId": "A",
    "domainName": "A — Data Collection and Graphing",
    "topicId": "Continuous",
    "topicName": "Continuous Measurement (A-01)",
    "difficulty": "Easy",
    "content": "Frequency data is typically expressed as which of the following?",
    "options": [
      "A percentage of intervals",
      "A whole number count of occurrences",
      "A ratio of correct to incorrect responses",
      "A duration in minutes and seconds"
    ],
    "correctAnswer": 1,
    "explanation": "Frequency is simply the raw number of times the behavior happened, so it is reported as a whole number count.\n\n[Clinical Context]: When an RBT reports 'the client hit peers 4 times,' that number is a straightforward frequency count.",
    "referenceSource": "BACB — RBT Test Content Outline (3rd Edition)",
    "tags": [
      "A",
      "Easy"
    ],
    "certification": "RBT",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "mq-rbt-freq-007",
    "code": "mq-rbt-freq-007",
    "domainId": "A",
    "domainName": "A — Data Collection and Graphing",
    "topicId": "Continuous",
    "topicName": "Continuous Measurement (A-01)",
    "difficulty": "Easy",
    "content": "Which of the following is a key requirement for frequency data to be meaningfully compared across two different sessions?",
    "options": [
      "The client must be in the same mood both days",
      "The behavior must occur at least once per minute",
      "The observation periods must be of equal length",
      "The data must be graphed on a bar chart"
    ],
    "correctAnswer": 2,
    "explanation": "Raw counts are only directly comparable when the amount of time available for the behavior to occur is the same across sessions.\n\n[Clinical Context]: If session lengths differ, an RBT should flag this to the supervisor rather than assume the raw counts reflect a real change in behavior.",
    "referenceSource": "BACB — RBT Test Content Outline (3rd Edition)",
    "tags": [
      "A",
      "Easy"
    ],
    "certification": "RBT",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "mq-rbt-freq-008",
    "code": "mq-rbt-freq-008",
    "domainId": "A",
    "domainName": "A — Data Collection and Graphing",
    "topicId": "Continuous",
    "topicName": "Continuous Measurement (A-01)",
    "difficulty": "Easy",
    "content": "Which behavior would be LEAST appropriate to measure using simple frequency counting?",
    "options": [
      "A client asking to use the restroom",
      "A client throwing a single object",
      "A client answering a question correctly",
      "A behavior that occurs continuously for long, variable periods, such as ongoing rocking"
    ],
    "correctAnswer": 3,
    "explanation": "Behaviors that occur continuously and vary in duration are difficult to count as discrete events, making frequency a poor match for them.\n\n[Clinical Context]: For behaviors like ongoing rocking, a different measure such as duration is usually more informative than a simple count.",
    "referenceSource": "BACB — RBT Test Content Outline (3rd Edition)",
    "tags": [
      "A",
      "Easy"
    ],
    "certification": "RBT",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "mq-rbt-freq-009",
    "code": "mq-rbt-freq-009",
    "domainId": "A",
    "domainName": "A — Data Collection and Graphing",
    "topicId": "Continuous",
    "topicName": "Continuous Measurement (A-01)",
    "difficulty": "Easy",
    "content": "Why do behavior analysts prefer frequency data for behaviors with a consistent duration?",
    "options": [
      "Because each occurrence represents a roughly equal 'unit' of behavior, making counts meaningful",
      "Because frequency data does not require an observer",
      "Because consistent-duration behaviors cannot be timed",
      "Because frequency automatically calculates rate"
    ],
    "correctAnswer": 0,
    "explanation": "When each instance of the behavior takes about the same amount of time, a simple count reflects the behavior fairly, since one occurrence is roughly equivalent to another.\n\n[Clinical Context]: This is why frequency works well for something like 'raises hand' but less well for something like 'tantrums,' which can vary widely in length.",
    "referenceSource": "BACB — RBT Test Content Outline (3rd Edition)",
    "tags": [
      "A",
      "Easy"
    ],
    "certification": "RBT",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "mq-rbt-freq-010",
    "code": "mq-rbt-freq-010",
    "domainId": "A",
    "domainName": "A — Data Collection and Graphing",
    "topicId": "Continuous",
    "topicName": "Continuous Measurement (A-01)",
    "difficulty": "Easy",
    "content": "An RBT collecting frequency data on 'requests for a break' should record a new tally when which of the following occurs?",
    "options": [
      "Only at the end of the session",
      "Each time the client emits the request",
      "Only if the request is granted",
      "Every 5 minutes regardless of behavior"
    ],
    "correctAnswer": 1,
    "explanation": "Frequency recording requires marking each individual occurrence of the defined behavior as it happens.\n\n[Clinical Context]: The RBT should record the request itself, not the caregiver or therapist's response to it, since frequency measures the client's behavior.",
    "referenceSource": "BACB — RBT Test Content Outline (3rd Edition)",
    "tags": [
      "A",
      "Easy"
    ],
    "certification": "RBT",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "mq-rbt-freq-011",
    "code": "mq-rbt-freq-011",
    "domainId": "A",
    "domainName": "A — Data Collection and Graphing",
    "topicId": "Continuous",
    "topicName": "Continuous Measurement (A-01)",
    "difficulty": "Easy",
    "content": "A behavior plan defines the target behavior as 'each instance of hitting, defined as forceful contact of an open or closed hand with another person.' This definition supports which measurement approach?",
    "options": [
      "Duration, because hitting lasts a long time",
      "Latency, because hitting only matters if it is delayed",
      "Frequency, because hitting is a discrete event with a clear beginning and end",
      "IRT, because hitting only matters in relation to the next response"
    ],
    "correctAnswer": 2,
    "explanation": "A clearly defined, discrete event like a single instance of hitting is well suited to being counted, which is the basis of frequency recording.\n\n[Clinical Context]: Clear operational definitions like this one help RBTs decide reliably whether one instance has occurred and should be tallied.",
    "referenceSource": "BACB — RBT Test Content Outline (3rd Edition)",
    "tags": [
      "A",
      "Easy"
    ],
    "certification": "RBT",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "mq-rbt-freq-012",
    "code": "mq-rbt-freq-012",
    "domainId": "A",
    "domainName": "A — Data Collection and Graphing",
    "topicId": "Continuous",
    "topicName": "Continuous Measurement (A-01)",
    "difficulty": "Easy",
    "content": "What is the main advantage of using a wrist tally counter over paper-and-pencil tallying for frequency data?",
    "options": [
      "It automatically converts frequency into rate",
      "It records duration instead of count",
      "It eliminates the need for an operational definition",
      "It allows the RBT to record occurrences without looking away from the client"
    ],
    "correctAnswer": 3,
    "explanation": "A wrist counter lets the RBT keep visual attention on the client and environment while still incrementing a count for each occurrence.\n\n[Clinical Context]: Staying visually engaged with the client is important for both safety and accurate behavior detection during session.",
    "referenceSource": "BACB — RBT Test Content Outline (3rd Edition)",
    "tags": [
      "A",
      "Easy"
    ],
    "certification": "RBT",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "mq-rbt-freq-013",
    "code": "mq-rbt-freq-013",
    "domainId": "A",
    "domainName": "A — Data Collection and Graphing",
    "topicId": "Continuous",
    "topicName": "Continuous Measurement (A-01)",
    "difficulty": "Easy",
    "content": "Which of the following data sheets is designed for frequency recording?",
    "options": [
      "A sheet with tally boxes labeled by behavior for the RBT to mark each occurrence",
      "A sheet with a single start and stop time box",
      "A sheet divided into 10-second intervals to mark yes/no",
      "A sheet listing only the antecedent and consequence of one incident"
    ],
    "correctAnswer": 0,
    "explanation": "A sheet with tally boxes for marking each occurrence is designed specifically for counting how many times a behavior happens, which is frequency recording.\n\n[Clinical Context]: RBTs should choose the data sheet that matches the measurement procedure specified in the behavior plan.",
    "referenceSource": "BACB — RBT Test Content Outline (3rd Edition)",
    "tags": [
      "A",
      "Easy"
    ],
    "certification": "RBT",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "mq-rbt-freq-014",
    "code": "mq-rbt-freq-014",
    "domainId": "A",
    "domainName": "A — Data Collection and Graphing",
    "topicId": "Continuous",
    "topicName": "Continuous Measurement (A-01)",
    "difficulty": "Easy",
    "content": "In frequency recording, what does a single tally mark represent?",
    "options": [
      "One minute of observation",
      "One complete occurrence of the defined target behavior",
      "One correct response only",
      "One instruction delivered by the RBT"
    ],
    "correctAnswer": 1,
    "explanation": "Each tally mark corresponds to one full instance of the behavior as it has been operationally defined.\n\n[Clinical Context]: Consistently marking one tally per occurrence, and not per partial or unclear instance, keeps the data accurate.",
    "referenceSource": "BACB — RBT Test Content Outline (3rd Edition)",
    "tags": [
      "A",
      "Easy"
    ],
    "certification": "RBT",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "mq-rbt-freq-015",
    "code": "mq-rbt-freq-015",
    "domainId": "A",
    "domainName": "A — Data Collection and Graphing",
    "topicId": "Continuous",
    "topicName": "Continuous Measurement (A-01)",
    "difficulty": "Easy",
    "content": "An RBT is told to record frequency of 'calling out without raising a hand' during a 20-minute academic session. The client calls out 6 times. How should the RBT record this?",
    "options": [
      "Record a duration of 20 minutes",
      "Record a percentage of 30%",
      "Record a count of 6 for the session",
      "Record a rate of 6 per hour without noting session length"
    ],
    "correctAnswer": 2,
    "explanation": "Since the behavior was counted across the full session, the frequency is simply the total number of occurrences, which is 6.\n\n[Clinical Context]: Reporting the raw count of 6, along with the session length in the notes, gives the supervisor accurate information for later comparison.",
    "referenceSource": "BACB — RBT Test Content Outline (3rd Edition)",
    "tags": [
      "A",
      "Easy"
    ],
    "certification": "RBT",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "mq-rbt-freq-016",
    "code": "mq-rbt-freq-016",
    "domainId": "A",
    "domainName": "A — Data Collection and Graphing",
    "topicId": "Continuous",
    "topicName": "Continuous Measurement (A-01)",
    "difficulty": "Easy",
    "content": "Which of the following best distinguishes frequency from duration recording?",
    "options": [
      "Frequency measures time; duration measures count",
      "Frequency and duration are two names for the same procedure",
      "Frequency is only used for verbal behavior; duration is used for physical behavior",
      "Frequency counts how often a behavior occurs; duration measures how long each occurrence lasts"
    ],
    "correctAnswer": 3,
    "explanation": "Frequency answers 'how many times,' while duration answers 'how long,' making them distinct dimensions of behavior.\n\n[Clinical Context]: An RBT might use frequency for hand-raising and duration for a tantrum, since these behaviors are better captured by different dimensions.",
    "referenceSource": "BACB — RBT Test Content Outline (3rd Edition)",
    "tags": [
      "A",
      "Easy"
    ],
    "certification": "RBT",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "mq-rbt-freq-017",
    "code": "mq-rbt-freq-017",
    "domainId": "A",
    "domainName": "A — Data Collection and Graphing",
    "topicId": "Continuous",
    "topicName": "Continuous Measurement (A-01)",
    "difficulty": "Easy",
    "content": "A behavior technician records a tally each time a client independently completes a step of a daily living task. What is being measured?",
    "options": [
      "Frequency of independent task completions",
      "Duration of task engagement",
      "Latency to begin the task",
      "Interresponse time between tasks"
    ],
    "correctAnswer": 0,
    "explanation": "Counting each completed step as it happens is a straightforward application of frequency recording.\n\n[Clinical Context]: This kind of frequency data helps the team track how often the client independently performs the skill across sessions.",
    "referenceSource": "BACB — RBT Test Content Outline (3rd Edition)",
    "tags": [
      "A",
      "Easy"
    ],
    "certification": "RBT",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "mq-rbt-freq-018",
    "code": "mq-rbt-freq-018",
    "domainId": "A",
    "domainName": "A — Data Collection and Graphing",
    "topicId": "Continuous",
    "topicName": "Continuous Measurement (A-01)",
    "difficulty": "Easy",
    "content": "Why is frequency considered a 'continuous' measurement procedure?",
    "options": [
      "Because the behavior must occur continuously without stopping",
      "Because the observer must watch and record throughout the entire observation period without sampling",
      "Because it produces a continuous line on a graph",
      "Because it can only be used with permanent products"
    ],
    "correctAnswer": 1,
    "explanation": "Continuous measurement means the observer records every instance of the behavior across the whole session rather than sampling only certain intervals.\n\n[Clinical Context]: This is different from interval-based procedures, where the RBT only notes whether behavior occurred during specific time windows.",
    "referenceSource": "BACB — RBT Test Content Outline (3rd Edition)",
    "tags": [
      "A",
      "Easy"
    ],
    "certification": "RBT",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "mq-rbt-freq-019",
    "code": "mq-rbt-freq-019",
    "domainId": "A",
    "domainName": "A — Data Collection and Graphing",
    "topicId": "Continuous",
    "topicName": "Continuous Measurement (A-01)",
    "difficulty": "Easy",
    "content": "Which of these is an example of frequency data being reported correctly?",
    "options": [
      "'The client raised their hand for 45 minutes.'",
      "'The client raised their hand 18% of the time.'",
      "'The client engaged in 8 instances of hand-raising during the 45-minute session.'",
      "'The client took 8 seconds to raise their hand.'"
    ],
    "correctAnswer": 2,
    "explanation": "This statement reports a whole-number count of occurrences within a stated session, which is the correct format for frequency data.\n\n[Clinical Context]: Including the session length alongside the count, as shown here, helps anyone reviewing the data later understand the context.",
    "referenceSource": "BACB — RBT Test Content Outline (3rd Edition)",
    "tags": [
      "A",
      "Easy"
    ],
    "certification": "RBT",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "mq-rbt-freq-020",
    "code": "mq-rbt-freq-020",
    "domainId": "A",
    "domainName": "A — Data Collection and Graphing",
    "topicId": "Continuous",
    "topicName": "Continuous Measurement (A-01)",
    "difficulty": "Easy",
    "content": "Before using frequency to measure a behavior, what should the RBT confirm from the behavior plan?",
    "options": [
      "That the client's parents approve of the measurement",
      "That the behavior occurs at least once per second",
      "That the behavior can be filmed for permanent product recording",
      "That the target behavior has a clear operational definition with an identifiable beginning and end"
    ],
    "correctAnswer": 3,
    "explanation": "A clear, agreed-upon operational definition ensures that everyone recording the behavior can reliably identify each occurrence, which is essential for accurate counting.\n\n[Clinical Context]: If an RBT is ever unsure whether a specific instance counts as an occurrence, the operational definition in the plan should guide the decision.",
    "referenceSource": "BACB — RBT Test Content Outline (3rd Edition)",
    "tags": [
      "A",
      "Easy"
    ],
    "certification": "RBT",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "mq-rbt-freq-021",
    "code": "mq-rbt-freq-021",
    "domainId": "A",
    "domainName": "A — Data Collection and Graphing",
    "topicId": "Continuous",
    "topicName": "Continuous Measurement (A-01)",
    "difficulty": "Medium",
    "content": "How does frequency differ from rate?",
    "options": [
      "Rate is frequency divided by the amount of time observed, allowing comparison across unequal session lengths",
      "Frequency and rate are calculated the same way",
      "Rate only applies to duration-based behaviors",
      "Frequency requires dividing by time, while rate does not"
    ],
    "correctAnswer": 0,
    "explanation": "Rate standardizes a count by time (e.g., occurrences per minute), which allows meaningful comparisons even when sessions are different lengths, unlike raw frequency alone.\n\n[Clinical Context]: An RBT might report '5 tantrums' as frequency, but if session lengths vary day to day, converting to rate gives the supervisor a clearer trend.",
    "referenceSource": "BACB — RBT Test Content Outline (3rd Edition)",
    "tags": [
      "A",
      "Medium"
    ],
    "certification": "RBT",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "mq-rbt-freq-022",
    "code": "mq-rbt-freq-022",
    "domainId": "A",
    "domainName": "A — Data Collection and Graphing",
    "topicId": "Continuous",
    "topicName": "Continuous Measurement (A-01)",
    "difficulty": "Medium",
    "content": "[Scenario]: The raw frequency count was identical both days.\n\nOn Monday, an RBT observed a client for 30 minutes and counted 9 instances of a target behavior. On Tuesday, the RBT observed the same client for 60 minutes and counted 9 instances. What is the most accurate conclusion?",
    "options": [
      "The behavior increased on Tuesday because the session was longer",
      "The behavior likely occurred less often relative to observation time on Tuesday, so rate should be examined rather than raw counts alone",
      "The data cannot be compared under any circumstances",
      "The RBT should have recorded duration instead of frequency"
    ],
    "correctAnswer": 1,
    "explanation": "Because the observation periods differ, comparing raw counts directly is misleading; calculating rate (occurrences per minute) shows the behavior actually occurred less often relative to time on Tuesday.\n\n[Clinical Context]: This is a common reason supervisors ask RBTs to convert frequency data to rate whenever session lengths are inconsistent across days.",
    "referenceSource": "BACB — RBT Test Content Outline (3rd Edition)",
    "tags": [
      "A",
      "Medium"
    ],
    "certification": "RBT",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "mq-rbt-freq-023",
    "code": "mq-rbt-freq-023",
    "domainId": "A",
    "domainName": "A — Data Collection and Graphing",
    "topicId": "Continuous",
    "topicName": "Continuous Measurement (A-01)",
    "difficulty": "Medium",
    "content": "Why might a BCBA ask an RBT to convert frequency data to rate before graphing it?",
    "options": [
      "Because rate is easier to write on a data sheet than frequency",
      "Because graphs cannot display whole numbers",
      "Because session lengths vary from day to day, and rate accounts for that difference",
      "Because rate eliminates the need for an operational definition"
    ],
    "correctAnswer": 2,
    "explanation": "Rate corrects for varying observation times, so trends on the graph reflect true changes in behavior rather than differences in how long each session lasted.\n\n[Clinical Context]: RBTs should let their supervisor know if session length is inconsistent so the team can decide whether rate conversion is needed.",
    "referenceSource": "BACB — RBT Test Content Outline (3rd Edition)",
    "tags": [
      "A",
      "Medium"
    ],
    "certification": "RBT",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "mq-rbt-freq-024",
    "code": "mq-rbt-freq-024",
    "domainId": "A",
    "domainName": "A — Data Collection and Graphing",
    "topicId": "Continuous",
    "topicName": "Continuous Measurement (A-01)",
    "difficulty": "Medium",
    "content": "An RBT is measuring 'time spent engaging in vocal stereotypy,' a behavior that varies widely in how long each episode lasts. The RBT decides to simply tally each time it starts, ignoring how long it lasts. What is the concern with this approach?",
    "options": [
      "Frequency cannot be used for vocal behavior under any circumstances",
      "Tallying vocal stereotypy is not permitted for RBTs",
      "The RBT should be measuring latency instead",
      "A simple frequency count does not capture the varying duration of each episode, which could understate the actual impact of the behavior"
    ],
    "correctAnswer": 3,
    "explanation": "Since episodes vary in length, two days with the same count could reflect very different amounts of actual behavior, so duration recording would likely give more clinically useful information.\n\n[Clinical Context]: This illustrates why RBTs must think about whether frequency truly captures what matters about a specific behavior before defaulting to a simple count.",
    "referenceSource": "BACB — RBT Test Content Outline (3rd Edition)",
    "tags": [
      "A",
      "Medium"
    ],
    "certification": "RBT",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "mq-rbt-freq-025",
    "code": "mq-rbt-freq-025",
    "domainId": "A",
    "domainName": "A — Data Collection and Graphing",
    "topicId": "Continuous",
    "topicName": "Continuous Measurement (A-01)",
    "difficulty": "Medium",
    "content": "[Scenario]: The RBT steps out of the room for 15 minutes during the session.\n\nAn RBT collects frequency data on 'independent mands' during a 2-hour session but is called away for 15 minutes to assist another therapist. What should the RBT do regarding the frequency count?",
    "options": [
      "Note the gap in observation on the data sheet, since frequency cannot be accurately recorded during a period when the behavior was not observed",
      "Estimate how many mands likely occurred during the gap and add them to the count",
      "Ignore the gap since it was a short period",
      "Stop collecting data for the rest of the session"
    ],
    "correctAnswer": 0,
    "explanation": "Because frequency requires continuous observation, any occurrences during an unobserved period cannot be reliably counted, so the gap should be documented rather than estimated or ignored.\n\n[Clinical Context]: Accurately noting gaps in observation helps the supervising BCBA interpret the data correctly rather than assuming full session coverage.",
    "referenceSource": "BACB — RBT Test Content Outline (3rd Edition)",
    "tags": [
      "A",
      "Medium"
    ],
    "certification": "RBT",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "mq-rbt-freq-026",
    "code": "mq-rbt-freq-026",
    "domainId": "A",
    "domainName": "A — Data Collection and Graphing",
    "topicId": "Continuous",
    "topicName": "Continuous Measurement (A-01)",
    "difficulty": "Medium",
    "content": "When documenting frequency data in session notes, which of the following is most important for an RBT to include alongside the raw count?",
    "options": [
      "The RBT's personal opinion about why the behavior occurred",
      "The length of the observation period",
      "A diagnosis for the client",
      "A recommendation to change the behavior plan"
    ],
    "correctAnswer": 1,
    "explanation": "Including the observation period allows anyone reviewing the data later to interpret the count accurately or convert it to rate if needed.\n\n[Clinical Context]: RBTs document objective information, such as session length and count, and leave clinical interpretation and plan changes to the supervising BCBA.",
    "referenceSource": "BACB — RBT Test Content Outline (3rd Edition)",
    "tags": [
      "A",
      "Medium"
    ],
    "certification": "RBT",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "mq-rbt-freq-027",
    "code": "mq-rbt-freq-027",
    "domainId": "A",
    "domainName": "A — Data Collection and Graphing",
    "topicId": "Continuous",
    "topicName": "Continuous Measurement (A-01)",
    "difficulty": "Medium",
    "content": "An RBT notices that a client's frequency of self-injurious behavior has increased sharply over the past three sessions. What is the most appropriate action for the RBT to take?",
    "options": [
      "Independently increase the intensity of the current intervention",
      "Stop implementing the behavior plan until the trend improves",
      "Report the observed increase in frequency data to the supervising BCBA promptly",
      "Adjust the target behavior definition to make the count appear lower"
    ],
    "correctAnswer": 2,
    "explanation": "RBTs collect and communicate data but do not independently make clinical decisions, so reporting the trend to the supervisor is the appropriate scope-respecting action.\n\n[Clinical Context]: Prompt, accurate reporting of concerning trends allows the BCBA to review the plan and make any necessary clinical adjustments.",
    "referenceSource": "BACB — RBT Test Content Outline (3rd Edition)",
    "tags": [
      "A",
      "Medium"
    ],
    "certification": "RBT",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "mq-rbt-freq-028",
    "code": "mq-rbt-freq-028",
    "domainId": "A",
    "domainName": "A — Data Collection and Graphing",
    "topicId": "Continuous",
    "topicName": "Continuous Measurement (A-01)",
    "difficulty": "Medium",
    "content": "A graph shows a client's daily frequency count of tantrums decreasing from 10 to 2 over three weeks, with session length remaining constant each day. What can be reasonably concluded from this pattern?",
    "options": [
      "The intervention has been proven to be the sole cause of the decrease",
      "The client no longer requires behavior support",
      "The data collection method must be changed to duration",
      "The frequency of tantrums has decreased over time under consistent observation conditions"
    ],
    "correctAnswer": 3,
    "explanation": "Since session length was constant, the downward trend in raw counts reasonably reflects a real decrease in how often tantrums occurred, without overstating causation.\n\n[Clinical Context]: RBTs should describe what the data shows without claiming the intervention definitively caused the change, since that interpretation is a BCBA-level judgment.",
    "referenceSource": "BACB — RBT Test Content Outline (3rd Edition)",
    "tags": [
      "A",
      "Medium"
    ],
    "certification": "RBT",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "mq-rbt-freq-029",
    "code": "mq-rbt-freq-029",
    "domainId": "A",
    "domainName": "A — Data Collection and Graphing",
    "topicId": "Continuous",
    "topicName": "Continuous Measurement (A-01)",
    "difficulty": "Medium",
    "content": "How does frequency recording differ from interval recording?",
    "options": [
      "Frequency records every occurrence of a behavior; interval recording only notes whether the behavior occurred during set time segments",
      "Frequency and interval recording produce identical data",
      "Interval recording tracks every occurrence, while frequency samples only part of the session",
      "Frequency is only used in academic settings"
    ],
    "correctAnswer": 0,
    "explanation": "Frequency captures a full count of every occurrence, while interval recording divides the session into intervals and records only presence or absence within each, potentially missing exact counts.\n\n[Clinical Context]: An RBT might choose interval recording over frequency for very high-rate behaviors that are difficult to count precisely one at a time.",
    "referenceSource": "BACB — RBT Test Content Outline (3rd Edition)",
    "tags": [
      "A",
      "Medium"
    ],
    "certification": "RBT",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "mq-rbt-freq-030",
    "code": "mq-rbt-freq-030",
    "domainId": "A",
    "domainName": "A — Data Collection and Graphing",
    "topicId": "Continuous",
    "topicName": "Continuous Measurement (A-01)",
    "difficulty": "Medium",
    "content": "A client engages in hand-raising behavior at a rate that is easy to count, occurring only occasionally throughout a class period. Which measurement procedure is most appropriate?",
    "options": [
      "Duration recording",
      "Frequency recording",
      "Momentary time sampling",
      "Partial interval recording"
    ],
    "correctAnswer": 1,
    "explanation": "Since the behavior is discrete and occurs infrequently enough to count each instance reliably, frequency recording is the most direct and appropriate choice.\n\n[Clinical Context]: Choosing frequency here gives an exact, easily interpretable count rather than an estimate, which is well suited for low- to moderate-rate discrete behaviors.",
    "referenceSource": "BACB — RBT Test Content Outline (3rd Edition)",
    "tags": [
      "A",
      "Medium"
    ],
    "certification": "RBT",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "mq-rbt-freq-031",
    "code": "mq-rbt-freq-031",
    "domainId": "A",
    "domainName": "A — Data Collection and Graphing",
    "topicId": "Continuous",
    "topicName": "Continuous Measurement (A-01)",
    "difficulty": "Medium",
    "content": "[Scenario]: The plan defines an episode of hitting as continuous contact attempts within a 3-second window as a single event.\n\nAn RBT collecting frequency data marks two tally marks for a single instance of hitting because the client hit the same peer twice in rapid succession during what the plan defines as 'one episode.' What is the issue with this recording?",
    "options": [
      "The RBT should have recorded duration instead",
      "Frequency should never be used for aggressive behavior",
      "The RBT did not follow the operational definition, which could inflate the frequency count",
      "The RBT correctly followed standard frequency procedures"
    ],
    "correctAnswer": 2,
    "explanation": "Following the operational definition exactly is essential; deviating from it, as in counting two tallies for what the plan defines as one episode, inflates the data and reduces its accuracy.\n\n[Clinical Context]: Consistent application of the operational definition across all observers is what keeps frequency data reliable and comparable over time.",
    "referenceSource": "BACB — RBT Test Content Outline (3rd Edition)",
    "tags": [
      "A",
      "Medium"
    ],
    "certification": "RBT",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "mq-rbt-freq-032",
    "code": "mq-rbt-freq-032",
    "domainId": "A",
    "domainName": "A — Data Collection and Graphing",
    "topicId": "Continuous",
    "topicName": "Continuous Measurement (A-01)",
    "difficulty": "Medium",
    "content": "Why is it important for all RBTs working with a client to use the same operational definition when collecting frequency data?",
    "options": [
      "Operational definitions are only needed for duration recording",
      "Frequency data does not require an operational definition",
      "Each RBT may define the behavior differently without affecting the data",
      "Inconsistent definitions across observers reduce the reliability and comparability of the data"
    ],
    "correctAnswer": 3,
    "explanation": "If different RBTs count different things as 'the behavior,' the resulting frequency counts cannot be reliably compared across sessions or staff.\n\n[Clinical Context]: This is one reason interobserver agreement checks are periodically conducted on frequency data collection.",
    "referenceSource": "BACB — RBT Test Content Outline (3rd Edition)",
    "tags": [
      "A",
      "Medium"
    ],
    "certification": "RBT",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "mq-rbt-freq-033",
    "code": "mq-rbt-freq-033",
    "domainId": "A",
    "domainName": "A — Data Collection and Graphing",
    "topicId": "Continuous",
    "topicName": "Continuous Measurement (A-01)",
    "difficulty": "Medium",
    "content": "An RBT's frequency graph shows the number of correct independent responses increasing from 3 to 15 over two weeks, with session length held constant. How should the RBT describe this pattern when reporting to the supervisor?",
    "options": [
      "Describe the observed increase in the count of correct independent responses across sessions",
      "State that the client has fully mastered the skill and no longer needs instruction",
      "State that the intervention is definitely the cause of the improvement",
      "Recommend discontinuing data collection since progress is evident"
    ],
    "correctAnswer": 0,
    "explanation": "The RBT's role is to objectively describe what the data shows; broader conclusions about mastery or causation are clinical judgments made by the supervising BCBA.\n\n[Clinical Context]: Objective, descriptive reporting keeps the RBT within scope while still providing the supervisor with useful information.",
    "referenceSource": "BACB — RBT Test Content Outline (3rd Edition)",
    "tags": [
      "A",
      "Medium"
    ],
    "certification": "RBT",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "mq-rbt-freq-034",
    "code": "mq-rbt-freq-034",
    "domainId": "A",
    "domainName": "A — Data Collection and Graphing",
    "topicId": "Continuous",
    "topicName": "Continuous Measurement (A-01)",
    "difficulty": "Medium",
    "content": "A BCBA is deciding between frequency and duration recording for a behavior described as 'client leaves the assigned area,' which happens a variable number of times per session and can last anywhere from a few seconds to several minutes. Which additional measure, beyond frequency, would likely give the most complete picture?",
    "options": [
      "Latency, to capture how quickly the behavior begins",
      "Duration, to capture how long each instance of leaving the area lasts",
      "Interresponse time, to capture the time between school days",
      "Percentage of trials, since this is a discrete-trial behavior"
    ],
    "correctAnswer": 1,
    "explanation": "Since the behavior varies significantly in length, tracking duration alongside frequency provides information that a simple count alone would miss.\n\n[Clinical Context]: RBTs often collect more than one dimension of behavior, such as frequency and duration together, when a single measure would not tell the full story.",
    "referenceSource": "BACB — RBT Test Content Outline (3rd Edition)",
    "tags": [
      "A",
      "Medium"
    ],
    "certification": "RBT",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "mq-rbt-freq-035",
    "code": "mq-rbt-freq-035",
    "domainId": "A",
    "domainName": "A — Data Collection and Graphing",
    "topicId": "Continuous",
    "topicName": "Continuous Measurement (A-01)",
    "difficulty": "Medium",
    "content": "[Scenario]: The behavior plan specifies that only fully independent, correct responses count as an occurrence.\n\nAn RBT is asked to record the frequency of a client's correct responses during a series of discrete trials. During one trial, the client provides a partially correct response. What should the RBT do?",
    "options": [
      "Count it as correct because the client attempted a response",
      "Skip recording data for that trial entirely",
      "Refer to the operational definition and only tally the response if it meets the specified criteria for 'correct'",
      "Ask the client to repeat the trial until it is correct before recording anything"
    ],
    "correctAnswer": 2,
    "explanation": "The operational definition determines what counts as an occurrence, so the RBT should apply that definition consistently rather than making an independent judgment call.\n\n[Clinical Context]: Sticking closely to the plan's criteria, even for borderline responses, keeps the frequency data accurate and consistent across sessions and staff.",
    "referenceSource": "BACB — RBT Test Content Outline (3rd Edition)",
    "tags": [
      "A",
      "Medium"
    ],
    "certification": "RBT",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "mq-rbt-freq-036",
    "code": "mq-rbt-freq-036",
    "domainId": "A",
    "domainName": "A — Data Collection and Graphing",
    "topicId": "Continuous",
    "topicName": "Continuous Measurement (A-01)",
    "difficulty": "Medium",
    "content": "An RBT's data sheet for frequency recording should, at minimum, include which of the following?",
    "options": [
      "Only the client's name and today's date",
      "A narrative story about the session with no numerical data",
      "The RBT's personal predictions about future behavior",
      "The date, session start and end time, the operationally defined behavior, and the tally of occurrences"
    ],
    "correctAnswer": 3,
    "explanation": "These elements allow anyone reviewing the sheet later to understand exactly what was measured, when, for how long, and how many times it occurred.\n\n[Clinical Context]: Complete documentation supports accurate rate calculations and trend analysis by the supervising BCBA.",
    "referenceSource": "BACB — RBT Test Content Outline (3rd Edition)",
    "tags": [
      "A",
      "Medium"
    ],
    "certification": "RBT",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "mq-rbt-freq-037",
    "code": "mq-rbt-freq-037",
    "domainId": "A",
    "domainName": "A — Data Collection and Graphing",
    "topicId": "Continuous",
    "topicName": "Continuous Measurement (A-01)",
    "difficulty": "Medium",
    "content": "A client's frequency of asking for help is being tracked across settings: 20 minutes at home and 50 minutes at the clinic. Why might comparing the raw frequency counts between these two settings be misleading?",
    "options": [
      "The unequal observation times mean the counts are not directly comparable without converting to rate",
      "Frequency data cannot be collected in more than one setting",
      "Only duration data can be compared across settings",
      "The behavior definition automatically changes between settings"
    ],
    "correctAnswer": 0,
    "explanation": "Without adjusting for the different lengths of time observed in each setting, comparing raw counts could create a misleading impression of where the behavior occurs more often.\n\n[Clinical Context]: Converting each count to a rate (per minute) would allow a fairer comparison between the two settings.",
    "referenceSource": "BACB — RBT Test Content Outline (3rd Edition)",
    "tags": [
      "A",
      "Medium"
    ],
    "certification": "RBT",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "mq-rbt-freq-038",
    "code": "mq-rbt-freq-038",
    "domainId": "A",
    "domainName": "A — Data Collection and Graphing",
    "topicId": "Continuous",
    "topicName": "Continuous Measurement (A-01)",
    "difficulty": "Medium",
    "content": "A BCBA reviews frequency data and calculates rate for two sessions of different lengths before comparing them. What clinical benefit does this provide over comparing raw frequency counts alone?",
    "options": [
      "It removes the need for an operational definition",
      "It controls for differences in observation time, allowing a more accurate comparison of how often the behavior truly occurred",
      "It converts frequency data into duration data",
      "It automatically identifies the function of the behavior"
    ],
    "correctAnswer": 1,
    "explanation": "Calculating rate standardizes the data for time, which is necessary whenever sessions are not the same length, so trends reflect actual behavior change rather than session-length differences.\n\n[Clinical Context]: This is a common step RBTs may be asked to help with under supervision when preparing data summaries.",
    "referenceSource": "BACB — RBT Test Content Outline (3rd Edition)",
    "tags": [
      "A",
      "Medium"
    ],
    "certification": "RBT",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "mq-rbt-freq-039",
    "code": "mq-rbt-freq-039",
    "domainId": "A",
    "domainName": "A — Data Collection and Graphing",
    "topicId": "Continuous",
    "topicName": "Continuous Measurement (A-01)",
    "difficulty": "Medium",
    "content": "An RBT counts a client's hand flapping using frequency, tallying each time the hands move up and down, even though the behavior is continuous and repetitive throughout most of the session. What is the concern with this method?",
    "options": [
      "Frequency should never be measured with a tally counter",
      "Hand flapping cannot be measured under any circumstances",
      "Continuous, repetitive motor movements are difficult to count discretely, and frequency may not accurately represent the behavior",
      "The RBT should be using latency to measure hand flapping"
    ],
    "correctAnswer": 2,
    "explanation": "Repetitive motor behaviors without a clear beginning and end for each 'unit' are difficult to count reliably, so a different measure like duration is often more appropriate.\n\n[Clinical Context]: This is a common consideration when a BCBA selects the measurement procedure written into the behavior plan.",
    "referenceSource": "BACB — RBT Test Content Outline (3rd Edition)",
    "tags": [
      "A",
      "Medium"
    ],
    "certification": "RBT",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "mq-rbt-freq-040",
    "code": "mq-rbt-freq-040",
    "domainId": "A",
    "domainName": "A — Data Collection and Graphing",
    "topicId": "Continuous",
    "topicName": "Continuous Measurement (A-01)",
    "difficulty": "Medium",
    "content": "Which factor is most important when a BCBA decides that frequency, rather than duration, is the appropriate measurement for a target behavior?",
    "options": [
      "Whether the client prefers frequency data",
      "Whether the session is longer than 30 minutes",
      "Whether the behavior occurs in a clinic versus a home setting",
      "Whether the behavior has a consistent, discrete duration each time it occurs"
    ],
    "correctAnswer": 3,
    "explanation": "When each occurrence takes roughly the same amount of time, a simple count meaningfully represents the behavior, making frequency the appropriate choice.\n\n[Clinical Context]: If duration varies widely between occurrences, a count alone may not capture the true impact of the behavior on the client's day.",
    "referenceSource": "BACB — RBT Test Content Outline (3rd Edition)",
    "tags": [
      "A",
      "Medium"
    ],
    "certification": "RBT",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "mq-rbt-freq-041",
    "code": "mq-rbt-freq-041",
    "domainId": "A",
    "domainName": "A — Data Collection and Graphing",
    "topicId": "Continuous",
    "topicName": "Continuous Measurement (A-01)",
    "difficulty": "Medium",
    "content": "[Scenario]: A fire drill occurred partway through the session, temporarily halting data collection.\n\nAn RBT collected frequency data across a 40-minute session but the session was interrupted for 10 minutes due to a fire drill. How should this be documented?",
    "options": [
      "Note the interruption and the actual observed time, rather than reporting the count as if a full 40 minutes were observed",
      "Report the count as if it occurred across the full 40 minutes without noting the interruption",
      "Discard the entire session's data because of the interruption",
      "Estimate additional occurrences that might have happened during the drill"
    ],
    "correctAnswer": 0,
    "explanation": "Accurately noting the interruption preserves the integrity of the data and prevents a misleading rate calculation later.\n\n[Clinical Context]: This kind of careful documentation helps the BCBA correctly interpret the data and account for any gaps.",
    "referenceSource": "BACB — RBT Test Content Outline (3rd Edition)",
    "tags": [
      "A",
      "Medium"
    ],
    "certification": "RBT",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "mq-rbt-freq-042",
    "code": "mq-rbt-freq-042",
    "domainId": "A",
    "domainName": "A — Data Collection and Graphing",
    "topicId": "Continuous",
    "topicName": "Continuous Measurement (A-01)",
    "difficulty": "Medium",
    "content": "A frequency graph shows high day-to-day variability, with counts ranging from 2 to 14 occurrences with no clear upward or downward trend over four weeks. How should an RBT describe this pattern to the supervisor?",
    "options": [
      "State that the intervention has failed and should be discontinued",
      "Describe the data as variable with no clear trend, without speculating on the cause",
      "State that the client is intentionally being inconsistent",
      "Average the numbers and report only the average without noting the variability"
    ],
    "correctAnswer": 1,
    "explanation": "Objectively describing the pattern, including its variability, gives the supervisor accurate information without the RBT overstepping into clinical interpretation.\n\n[Clinical Context]: Recognizing and reporting variability, rather than smoothing it over, helps the BCBA decide whether the plan needs adjustment.",
    "referenceSource": "BACB — RBT Test Content Outline (3rd Edition)",
    "tags": [
      "A",
      "Medium"
    ],
    "certification": "RBT",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "mq-rbt-freq-043",
    "code": "mq-rbt-freq-043",
    "domainId": "A",
    "domainName": "A — Data Collection and Graphing",
    "topicId": "Continuous",
    "topicName": "Continuous Measurement (A-01)",
    "difficulty": "Medium",
    "content": "How does frequency recording differ from permanent product recording when both are used to count how many worksheet problems a client completes correctly?",
    "options": [
      "Permanent product recording requires the RBT to be present continuously during the task",
      "Frequency and permanent product recording are identical procedures",
      "Frequency requires the RBT to observe and tally in real time, while permanent product recording counts the completed work after the fact",
      "Permanent product recording cannot be used to count correct responses"
    ],
    "correctAnswer": 2,
    "explanation": "Frequency recording happens in real time as the RBT observes behavior directly, whereas permanent product recording involves reviewing a tangible outcome, such as a completed worksheet, after the session.\n\n[Clinical Context]: For some tasks, permanent product recording can be more practical than live frequency counting, especially when a tangible output is available.",
    "referenceSource": "BACB — RBT Test Content Outline (3rd Edition)",
    "tags": [
      "A",
      "Medium"
    ],
    "certification": "RBT",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "mq-rbt-freq-044",
    "code": "mq-rbt-freq-044",
    "domainId": "A",
    "domainName": "A — Data Collection and Graphing",
    "topicId": "Continuous",
    "topicName": "Continuous Measurement (A-01)",
    "difficulty": "Medium",
    "content": "A client's target behavior is 'independently requesting a preferred item using a full sentence.' Why would frequency be an appropriate measurement choice for this behavior?",
    "options": [
      "Because requesting always takes the same number of minutes",
      "Because frequency automatically accounts for correctness of grammar",
      "Because this behavior cannot be measured with any other procedure",
      "Because each request is a discrete, identifiable event with a clear beginning and end"
    ],
    "correctAnswer": 3,
    "explanation": "Each request is a distinct, countable event, making it a good match for frequency recording, which counts how many times a discrete behavior occurs.\n\n[Clinical Context]: This kind of frequency data helps the team track how often the client is using the target communication skill across sessions.",
    "referenceSource": "BACB — RBT Test Content Outline (3rd Edition)",
    "tags": [
      "A",
      "Medium"
    ],
    "certification": "RBT",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "mq-rbt-freq-045",
    "code": "mq-rbt-freq-045",
    "domainId": "A",
    "domainName": "A — Data Collection and Graphing",
    "topicId": "Continuous",
    "topicName": "Continuous Measurement (A-01)",
    "difficulty": "Hard",
    "content": "An RBT observed a client for 25 minutes and recorded 15 occurrences of a target behavior. What is the rate of the behavior per minute?",
    "options": [
      "0.6 occurrences per minute",
      "1.5 occurrences per minute",
      "6 occurrences per minute",
      "375 occurrences per minute"
    ],
    "correctAnswer": 0,
    "explanation": "Rate is calculated by dividing the frequency count by the observation time: 15 occurrences divided by 25 minutes equals 0.6 occurrences per minute.\n\n[Clinical Context]: Converting frequency to rate like this allows the team to compare this session to others of different lengths.",
    "referenceSource": "BACB — RBT Test Content Outline (3rd Edition)",
    "tags": [
      "A",
      "Hard"
    ],
    "certification": "RBT",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "mq-rbt-freq-046",
    "code": "mq-rbt-freq-046",
    "domainId": "A",
    "domainName": "A — Data Collection and Graphing",
    "topicId": "Continuous",
    "topicName": "Continuous Measurement (A-01)",
    "difficulty": "Hard",
    "content": "A client was observed for 45 minutes on Monday with 18 occurrences of a behavior, and for 30 minutes on Wednesday with 15 occurrences. Which day had the higher rate of behavior?",
    "options": [
      "Monday, because it had more total occurrences",
      "Wednesday, since its rate (0.5 per minute) is higher than Monday's rate (0.4 per minute)",
      "Both days had the same rate",
      "The rate cannot be determined from this information"
    ],
    "correctAnswer": 1,
    "explanation": "Monday's rate is 18 divided by 45, which equals 0.4 per minute; Wednesday's rate is 15 divided by 30, which equals 0.5 per minute, so Wednesday has the higher rate despite having fewer total occurrences.\n\n[Clinical Context]: This example shows why comparing raw frequency counts alone, without considering session length, can lead to an incorrect conclusion about which day had 'more' behavior.",
    "referenceSource": "BACB — RBT Test Content Outline (3rd Edition)",
    "tags": [
      "A",
      "Hard"
    ],
    "certification": "RBT",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "mq-rbt-freq-047",
    "code": "mq-rbt-freq-047",
    "domainId": "A",
    "domainName": "A — Data Collection and Graphing",
    "topicId": "Continuous",
    "topicName": "Continuous Measurement (A-01)",
    "difficulty": "Hard",
    "content": "Over a 5-day school week, an RBT records the following frequency counts of a target behavior, each during a 60-minute session: 4, 6, 5, 9, 6. What is the average rate per minute across the week?",
    "options": [
      "6 occurrences per minute",
      "1 occurrence per minute",
      "0.1 occurrences per minute",
      "30 occurrences per minute"
    ],
    "correctAnswer": 2,
    "explanation": "The total occurrences (4+6+5+9+6=30) divided by the total minutes observed (5 sessions × 60 minutes = 300 minutes) equals 30/300, or 0.1 occurrences per minute.\n\n[Clinical Context]: Averaging rate across multiple equal-length sessions like this gives a stable summary statistic for reporting weekly trends to the supervisor.",
    "referenceSource": "BACB — RBT Test Content Outline (3rd Edition)",
    "tags": [
      "A",
      "Hard"
    ],
    "certification": "RBT",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "mq-rbt-freq-048",
    "code": "mq-rbt-freq-048",
    "domainId": "A",
    "domainName": "A — Data Collection and Graphing",
    "topicId": "Continuous",
    "topicName": "Continuous Measurement (A-01)",
    "difficulty": "Hard",
    "content": "A cumulative frequency graph for a target behavior shows a steadily increasing line with a consistently steep slope over three weeks. What does the steepness of the slope represent?",
    "options": [
      "The total number of sessions conducted",
      "The exact time of day the behavior occurred",
      "A decrease in behavior over time",
      "A relatively high and consistent rate of occurrence during that period"
    ],
    "correctAnswer": 3,
    "explanation": "On a cumulative graph, the steeper the slope, the more occurrences are being added per unit of time, indicating a higher rate of behavior during that period.\n\n[Clinical Context]: A flattening slope on a cumulative graph would instead suggest the behavior is occurring less often, which is a pattern RBTs may notice and report.",
    "referenceSource": "BACB — RBT Test Content Outline (3rd Edition)",
    "tags": [
      "A",
      "Hard"
    ],
    "certification": "RBT",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "mq-rbt-freq-049",
    "code": "mq-rbt-freq-049",
    "domainId": "A",
    "domainName": "A — Data Collection and Graphing",
    "topicId": "Continuous",
    "topicName": "Continuous Measurement (A-01)",
    "difficulty": "Hard",
    "content": "A BCBA is choosing between frequency and interresponse time (IRT) to better understand a self-injurious behavior that occurs at a high rate throughout the day. If the clinical question is 'how much time typically passes between each instance,' which measure directly answers that question, and why is frequency alone insufficient?",
    "options": [
      "IRT directly measures the time between successive responses, while frequency only provides a total count without information about spacing between occurrences",
      "Frequency directly measures time between responses, making IRT unnecessary",
      "Both measures answer the same clinical question equally well",
      "Neither measure can answer this clinical question"
    ],
    "correctAnswer": 0,
    "explanation": "Frequency tells you how many times something happened, but not how the occurrences were spaced out, while IRT specifically captures the time gaps between consecutive responses.\n\n[Clinical Context]: A BCBA might request IRT data specifically to evaluate patterns like whether responses cluster together or are evenly spaced, which frequency alone cannot reveal.",
    "referenceSource": "BACB — RBT Test Content Outline (3rd Edition)",
    "tags": [
      "A",
      "Hard"
    ],
    "certification": "RBT",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "mq-rbt-freq-050",
    "code": "mq-rbt-freq-050",
    "domainId": "A",
    "domainName": "A — Data Collection and Graphing",
    "topicId": "Continuous",
    "topicName": "Continuous Measurement (A-01)",
    "difficulty": "Hard",
    "content": "[Scenario]: The caregiver is comparing the two raw counts directly.\n\nAn RBT collects frequency data across two settings for the same behavior: 30 minutes at school with 12 occurrences, and 45 minutes at home with 12 occurrences. A caregiver states the behavior is 'exactly the same' in both places because the counts match. Why is this conclusion inaccurate?",
    "options": [
      "The counts prove the behavior is identical in both settings",
      "The rates differ (0.4 per minute at school versus 0.27 per minute at home), showing the behavior actually occurred less often relative to time at home",
      "Frequency data cannot be collected in a home setting",
      "The RBT should have used duration instead of frequency in both settings"
    ],
    "correctAnswer": 1,
    "explanation": "Because the observation periods differ, equal raw counts do not mean equal rates; calculating rate reveals the behavior actually occurred less frequently relative to time at home.\n\n[Clinical Context]: This is a common misunderstanding that RBTs may need to gently clarify, referring the caregiver's clinical question to the supervising BCBA if needed.",
    "referenceSource": "BACB — RBT Test Content Outline (3rd Edition)",
    "tags": [
      "A",
      "Hard"
    ],
    "certification": "RBT",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "mq-rbt-freq-051",
    "code": "mq-rbt-freq-051",
    "domainId": "A",
    "domainName": "A — Data Collection and Graphing",
    "topicId": "Continuous",
    "topicName": "Continuous Measurement (A-01)",
    "difficulty": "Hard",
    "content": "A client's frequency of correct academic responses was 8 out of a 20-minute session on Monday and 20 out of a 50-minute session on Friday. Which statement correctly compares the two sessions using rate?",
    "options": [
      "Friday's rate was higher because the total count was higher",
      "Monday's rate was higher because the session was shorter",
      "The rate was the same both days, at 0.4 correct responses per minute",
      "The rate cannot be calculated because the sessions were different lengths"
    ],
    "correctAnswer": 2,
    "explanation": "Monday's rate is 8 divided by 20, which equals 0.4 per minute; Friday's rate is 20 divided by 50, which also equals 0.4 per minute, so the rates are actually equal despite the different raw counts.\n\n[Clinical Context]: This example highlights how rate can reveal that performance was actually consistent across two sessions that looked different when only raw counts were compared.",
    "referenceSource": "BACB — RBT Test Content Outline (3rd Edition)",
    "tags": [
      "A",
      "Hard"
    ],
    "certification": "RBT",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "mq-rbt-freq-052",
    "code": "mq-rbt-freq-052",
    "domainId": "A",
    "domainName": "A — Data Collection and Graphing",
    "topicId": "Continuous",
    "topicName": "Continuous Measurement (A-01)",
    "difficulty": "Hard",
    "content": "Two RBTs independently collect frequency data on the same client during the same 30-minute session. RBT A records 10 occurrences; RBT B records 16 occurrences. What does this discrepancy most likely indicate?",
    "options": [
      "That the client's behavior changed mid-session",
      "That frequency recording cannot be used with two observers",
      "That one RBT should double their count to match the other",
      "A possible interobserver agreement problem, such as inconsistent application of the operational definition"
    ],
    "correctAnswer": 3,
    "explanation": "A large discrepancy between two observers counting the same behavior during the same session usually points to inconsistent application of the operational definition rather than an actual change in behavior.\n\n[Clinical Context]: When this kind of discrepancy is noticed, the RBT should report it to the supervisor so operational definitions can be reviewed or clarified.",
    "referenceSource": "BACB — RBT Test Content Outline (3rd Edition)",
    "tags": [
      "A",
      "Hard"
    ],
    "certification": "RBT",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "mq-rbt-freq-053",
    "code": "mq-rbt-freq-053",
    "domainId": "A",
    "domainName": "A — Data Collection and Graphing",
    "topicId": "Continuous",
    "topicName": "Continuous Measurement (A-01)",
    "difficulty": "Hard",
    "content": "An RBT records frequency data showing 24 occurrences of a behavior across a 3-hour school day, with sessions broken into four 45-minute blocks. What is the overall rate of the behavior per minute across the full day?",
    "options": [
      "Approximately 0.13 occurrences per minute",
      "8 occurrences per minute",
      "24 occurrences per minute",
      "0.03 occurrences per minute"
    ],
    "correctAnswer": 0,
    "explanation": "Four 45-minute blocks total 180 minutes; 24 occurrences divided by 180 minutes equals approximately 0.133 occurrences per minute.\n\n[Clinical Context]: Calculating an overall daily rate like this can help the team see the bigger picture beyond any single session's data.",
    "referenceSource": "BACB — RBT Test Content Outline (3rd Edition)",
    "tags": [
      "A",
      "Hard"
    ],
    "certification": "RBT",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "mq-rbt-freq-054",
    "code": "mq-rbt-freq-054",
    "domainId": "A",
    "domainName": "A — Data Collection and Graphing",
    "topicId": "Continuous",
    "topicName": "Continuous Measurement (A-01)",
    "difficulty": "Hard",
    "content": "A BCBA is designing a data collection system for a behavior that occurs extremely frequently, sometimes dozens of times per minute, making it difficult for an RBT to tally each instance accurately. Which adjustment to measurement is most appropriate?",
    "options": [
      "Continue using frequency exactly as written, regardless of feasibility",
      "Consider a sampling procedure, such as partial interval or momentary time sampling, since exhaustive frequency counting may not be feasible",
      "Switch to measuring only the client's mood",
      "Discontinue data collection entirely"
    ],
    "correctAnswer": 1,
    "explanation": "When a behavior occurs so rapidly that accurate real-time counting becomes impractical, an interval-based sampling procedure can provide a more feasible and still useful estimate of behavior occurrence.\n\n[Clinical Context]: An RBT who finds a specified procedure difficult to implement accurately should communicate this to the supervisor rather than silently under- or over-counting.",
    "referenceSource": "BACB — RBT Test Content Outline (3rd Edition)",
    "tags": [
      "A",
      "Hard"
    ],
    "certification": "RBT",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "mq-rbt-freq-055",
    "code": "mq-rbt-freq-055",
    "domainId": "A",
    "domainName": "A — Data Collection and Graphing",
    "topicId": "Continuous",
    "topicName": "Continuous Measurement (A-01)",
    "difficulty": "Hard",
    "content": "[Scenario]: The RBT was absent for one week, and a substitute unfamiliar with the plan covered sessions.\n\nA frequency graph shows a target behavior that was decreasing steadily for four weeks, followed by a sudden spike in the fifth week that coincides with a documented interruption in service due to the RBT's absence. How should this data point be interpreted by the RBT when reporting to the supervisor?",
    "options": [
      "Remove the data point from the graph so it does not affect the trend",
      "Conclude definitively that the substitute caused the increase without further discussion",
      "Report the spike along with the context of the staffing change, without independently concluding what caused it",
      "Change the target behavior definition to make the spike disappear"
    ],
    "correctAnswer": 2,
    "explanation": "The RBT's role is to report relevant contextual information, such as a staffing change, alongside the data, while leaving the clinical interpretation of causation to the supervising BCBA.\n\n[Clinical Context]: Providing context without asserting a definitive cause helps the BCBA make a well-informed decision about the plan.",
    "referenceSource": "BACB — RBT Test Content Outline (3rd Edition)",
    "tags": [
      "A",
      "Hard"
    ],
    "certification": "RBT",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "mq-rbt-freq-056",
    "code": "mq-rbt-freq-056",
    "domainId": "A",
    "domainName": "A — Data Collection and Graphing",
    "topicId": "Continuous",
    "topicName": "Continuous Measurement (A-01)",
    "difficulty": "Hard",
    "content": "A client engaged in a target behavior 6 times during a 15-minute observation. If the RBT wanted to express this as occurrences per hour instead of per minute, what would the rate be?",
    "options": [
      "6 occurrences per hour",
      "90 occurrences per hour",
      "0.4 occurrences per hour",
      "24 occurrences per hour"
    ],
    "correctAnswer": 3,
    "explanation": "The rate per minute is 6 divided by 15, which equals 0.4 per minute; multiplying by 60 minutes gives 24 occurrences per hour.\n\n[Clinical Context]: Expressing rate in different time units, such as per hour instead of per minute, can make data easier to communicate depending on the audience.",
    "referenceSource": "BACB — RBT Test Content Outline (3rd Edition)",
    "tags": [
      "A",
      "Hard"
    ],
    "certification": "RBT",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "mq-rbt-freq-057",
    "code": "mq-rbt-freq-057",
    "domainId": "A",
    "domainName": "A — Data Collection and Graphing",
    "topicId": "Continuous",
    "topicName": "Continuous Measurement (A-01)",
    "difficulty": "Hard",
    "content": "A behavior plan initially specified frequency recording for 'instances of elopement,' but the BCBA later adds duration recording as well, tracking how long the client remains away from the assigned area each time. Why might combining these two measures give a more complete clinical picture than frequency alone?",
    "options": [
      "Frequency shows how often elopement occurs, while duration shows how long each episode lasts, together capturing both how often and how much the behavior impacts safety and instruction time",
      "Duration recording replaces the need for an operational definition",
      "Frequency and duration always produce identical information",
      "Combining measures is not permitted under BACB guidelines"
    ],
    "correctAnswer": 0,
    "explanation": "Frequency alone tells the team how many times elopement happened, but not how disruptive or risky each episode was, so adding duration provides additional clinically relevant information.\n\n[Clinical Context]: RBTs are often asked to collect multiple dimensions of the same behavior when a single measure would not capture the full clinical picture.",
    "referenceSource": "BACB — RBT Test Content Outline (3rd Edition)",
    "tags": [
      "A",
      "Hard"
    ],
    "certification": "RBT",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "mq-rbt-freq-058",
    "code": "mq-rbt-freq-058",
    "domainId": "A",
    "domainName": "A — Data Collection and Graphing",
    "topicId": "Continuous",
    "topicName": "Continuous Measurement (A-01)",
    "difficulty": "Hard",
    "content": "[Scenario]: Session lengths differed between the two weeks.\n\nAn RBT is reviewing two weeks of frequency data for 'aggression toward peers.' Week 1 averaged 0.3 occurrences per minute across five 40-minute sessions. Week 2 averaged 0.5 occurrences per minute across five 25-minute sessions. Which statement most accurately reflects what the RBT should report?",
    "options": [
      "Aggression decreased because Week 2 had shorter sessions",
      "The rate of aggression increased from Week 1 to Week 2, even though total session time was shorter in Week 2",
      "The data cannot be compared because different children were involved",
      "The RBT should discard Week 2's data since sessions were shorter"
    ],
    "correctAnswer": 1,
    "explanation": "Since rate already accounts for the different session lengths, comparing the two calculated rates directly and accurately shows that the behavior increased in Week 2 despite the shorter sessions.\n\n[Clinical Context]: This kind of rate-based comparison is exactly why converting frequency to rate is valuable when session lengths are inconsistent across a reporting period.",
    "referenceSource": "BACB — RBT Test Content Outline (3rd Edition)",
    "tags": [
      "A",
      "Hard"
    ],
    "certification": "RBT",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "mq-rbt-freq-059",
    "code": "mq-rbt-freq-059",
    "domainId": "A",
    "domainName": "A — Data Collection and Graphing",
    "topicId": "Continuous",
    "topicName": "Continuous Measurement (A-01)",
    "difficulty": "Hard",
    "content": "A supervisor asks an RBT to summarize four weeks of frequency data collected across sessions of varying lengths (30 to 60 minutes). What is the most appropriate way for the RBT to present this data to allow for accurate trend analysis?",
    "options": [
      "Report only the raw counts without any reference to session length",
      "Average the raw counts without adjusting for session length",
      "Convert each session's frequency count to a rate per minute before summarizing or graphing trends across weeks",
      "Report only the longest session's data as representative of the month"
    ],
    "correctAnswer": 2,
    "explanation": "Because session lengths vary, converting each count to a rate allows for a fair, accurate comparison and trend analysis across all four weeks.\n\n[Clinical Context]: This reflects a broader RBT skill: recognizing when raw frequency data needs to be standardized before it can be meaningfully summarized or graphed.",
    "referenceSource": "BACB — RBT Test Content Outline (3rd Edition)",
    "tags": [
      "A",
      "Hard"
    ],
    "certification": "RBT",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "mq-rbt-freq-060",
    "code": "mq-rbt-freq-060",
    "domainId": "A",
    "domainName": "A — Data Collection and Graphing",
    "topicId": "Continuous",
    "topicName": "Continuous Measurement (A-01)",
    "difficulty": "Medium",
    "content": "A client's frequency of independently putting away toys is measured across two 20-minute play sessions in the same day, both under identical conditions. Why is this comparison more valid than comparing two sessions of different lengths?",
    "options": [
      "Because frequency data can never be compared across two sessions in the same day",
      "Because only duration data can be compared within the same day",
      "Because the operational definition changes between equal-length sessions",
      "Because equal observation periods allow the raw counts to be compared directly without needing to convert to rate"
    ],
    "correctAnswer": 3,
    "explanation": "When both sessions are the same length, the raw frequency counts already reflect a fair comparison, since the amount of opportunity for the behavior to occur was identical.\n\n[Clinical Context]: This is the simplest case for comparing frequency data: matched session lengths mean no rate conversion is necessary for a valid comparison.",
    "referenceSource": "BACB — RBT Test Content Outline (3rd Edition)",
    "tags": [
      "A",
      "Medium"
    ],
    "certification": "RBT",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "bacb-prac-001",
    "code": "BACB-DOM-B-001",
    "domainId": "B",
    "domainName": "B — Assessment and Preference Testing",
    "topicId": "Preference",
    "topicName": "Preference Assessments (B-01)",
    "difficulty": "Medium",
    "content": "An assessor conducts a preference assessment where 6 stimuli are presented simultaneously. Once the client selects an item, they are allowed 30 seconds of access, and the item is NOT returned to the array for subsequent trials. Which assessment is this?",
    "options": [
      "Paired Stimulus (Forced Choice) Assessment",
      "Multiple Stimulus Without Replacement (MSWO)",
      "Multiple Stimulus With Replacement (MSW)",
      "Free Operant Observation"
    ],
    "correctAnswer": 1,
    "explanation": "In Multiple Stimulus Without Replacement (MSWO), all items are presented together; when one item is chosen, it is permanently removed from the remaining array for the remaining trials.",
    "referenceSource": "BACB Task List Specification",
    "tags": ["BACB", "Assessment", "Medium", "MSWO"],
    "certification": "BACB",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "bacb-prac-002",
    "code": "BACB-DOM-A-002",
    "domainId": "A",
    "domainName": "A — Data Collection and Graphing",
    "topicId": "Discontinuous",
    "topicName": "Discontinuous Measurement (A-02)",
    "difficulty": "Medium",
    "content": "Which discontinuous measurement system is known to systematically overestimate the overall occurrence of the target behavior?",
    "options": [
      "Whole Interval Recording",
      "Partial Interval Recording",
      "Momentary Time Sampling",
      "Duration Recording"
    ],
    "correctAnswer": 1,
    "explanation": "Partial Interval Recording scores an occurrence if the behavior happens at any time during the interval, leading to a systematic overestimation of total duration/percentage.",
    "referenceSource": "BACB Task List Specification",
    "tags": ["BACB", "Measurement", "Medium"],
    "certification": "BACB",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "bacb-prac-003",
    "code": "BACB-DOM-C-003",
    "domainId": "C",
    "domainName": "C — Skill Acquisition",
    "topicId": "Prompting",
    "topicName": "Prompting & Prompt Fading (C-02)",
    "difficulty": "Medium",
    "content": "During discrete trial teaching, a practitioner begins with a full physical prompt and gradually fades to a partial physical prompt, model, and then gestural prompt across sessions. What prompting strategy is being applied?",
    "options": [
      "Least-to-Most Prompting",
      "Most-to-Least Prompting",
      "Graduated Guidance",
      "Stimulus Shaping"
    ],
    "correctAnswer": 1,
    "explanation": "Most-to-Least prompting starts with the most intrusive prompt (e.g. full physical) to ensure errorless responding and fades toward less intrusive prompts over time.",
    "referenceSource": "BACB Task List Specification",
    "tags": ["BACB", "Skill Acquisition", "Medium"],
    "certification": "BACB",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "bacb-prac-004",
    "code": "BACB-DOM-D-004",
    "domainId": "D",
    "domainName": "D — Behavior Reduction",
    "topicId": "Differential",
    "topicName": "Differential Reinforcement (DRA/DRO/DRI)",
    "difficulty": "Medium",
    "content": "A clinician implements a procedure where reinforcement is delivered strictly if the client does NOT engage in skin-picking for a continuous 10-minute interval. Which procedure is this?",
    "options": [
      "DRA (Alternative Behavior)",
      "DRI (Incompatible Behavior)",
      "DRO (Other/Zero Behavior)",
      "DRL (Low Rates)"
    ],
    "correctAnswer": 2,
    "explanation": "Differential Reinforcement of Other Behavior (DRO) delivers reinforcement contingent on the zero occurrence of the target behavior throughout a specified time interval.",
    "referenceSource": "BACB Task List Specification",
    "tags": ["BACB", "Behavior Reduction", "Medium", "DRO"],
    "certification": "BACB",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "bacb-prac-005",
    "code": "BACB-DOM-F-005",
    "domainId": "F",
    "domainName": "F — Professional Conduct",
    "topicId": "Ethics",
    "topicName": "Professional Boundaries & Dual Relationships",
    "difficulty": "Easy",
    "content": "A client's parent invites the behavior technician to attend the child's weekend birthday party as a guest and offers a $50 gift card. According to BACB ethical compliance guidelines, what should the technician do?",
    "options": [
      "Accept both the invitation and gift card since building rapport with families is essential",
      "Politely decline the gift card and party invitation to prevent a multiple/dual relationship, and notify the supervising BCBA",
      "Accept only the party invitation but decline the gift card",
      "Accept the gift card on behalf of the company clinic"
    ],
    "correctAnswer": 1,
    "explanation": "BACB ethical codes strictly prohibit behavior technicians from entering into multiple relationships and accepting gifts above nominal limits. Practitioners must politely decline and inform their supervisor.",
    "referenceSource": "BACB Ethics Code for Behavior Technicians",
    "tags": ["BACB", "Ethics", "Easy"],
    "certification": "BACB",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "bacb-prac-006",
    "code": "BACB-DOM-A-006",
    "domainId": "A",
    "domainName": "A — Data Collection and Graphing",
    "topicId": "Continuous",
    "topicName": "Continuous Measurement (A-01)",
    "difficulty": "Easy",
    "content": "A clinician wants to measure the time elapsed from the end of one math problem to the beginning of the next math problem. Which metric should they record?",
    "options": [
      "Duration",
      "Interresponse Time (IRT)",
      "Latency",
      "Trials to Criterion"
    ],
    "correctAnswer": 1,
    "explanation": "Interresponse Time (IRT) is the amount of time that elapses between two consecutive instances of a response.",
    "referenceSource": "BACB Task List Specification",
    "tags": ["BACB", "Measurement", "IRT"],
    "certification": "BACB",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "bacb-prac-007",
    "code": "BACB-DOM-A-007",
    "domainId": "A",
    "domainName": "A — Data Collection and Graphing",
    "topicId": "Discontinuous",
    "topicName": "Discontinuous Measurement (A-02)",
    "difficulty": "Medium",
    "content": "When using Momentary Time Sampling with 1-minute intervals, when does the observer look up and record the behavior?",
    "options": [
      "Continuously throughout the 1 minute",
      "At the exact moment the 1-minute interval ends",
      "At any time during the first 30 seconds",
      "Only if the behavior lasts the full minute"
    ],
    "correctAnswer": 1,
    "explanation": "Momentary Time Sampling requires recording the presence or absence of the target behavior precisely at the end of the specified time interval.",
    "referenceSource": "BACB Task List Specification",
    "tags": ["BACB", "Measurement", "Momentary"],
    "certification": "BACB",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "bacb-prac-008",
    "code": "BACB-DOM-B-008",
    "domainId": "B",
    "domainName": "B — Assessment and Preference Testing",
    "topicId": "Preference",
    "topicName": "Preference Assessments (B-01)",
    "difficulty": "Easy",
    "content": "In a Paired Stimulus preference assessment (Forced Choice), how many items are presented to the learner simultaneously on each trial?",
    "options": [
      "One item at a time",
      "Two items at a time",
      "Four to six items at a time",
      "As many items as the child chooses"
    ],
    "correctAnswer": 1,
    "explanation": "A Paired Stimulus (forced choice) preference assessment presents items two at a time in randomized pairs until every item has been paired with every other item.",
    "referenceSource": "BACB Task List Specification",
    "tags": ["BACB", "Assessment", "Preference"],
    "certification": "BACB",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "bacb-prac-009",
    "code": "BACB-DOM-B-009",
    "domainId": "B",
    "domainName": "B — Assessment and Preference Testing",
    "topicId": "Functional",
    "topicName": "Functional Assessment Assistance (B-02)",
    "difficulty": "Medium",
    "content": "An RBT is asked to assist with descriptive functional assessments by recording what happens immediately before and immediately after a client's tantrum. What type of data is the RBT recording?",
    "options": [
      "Scatterplot data",
      "ABC (Antecedent-Behavior-Consequence) Continuous Recording",
      "Standard Celeration Charting",
      "Experimental Functional Analysis"
    ],
    "correctAnswer": 1,
    "explanation": "ABC data collection records the antecedent events preceding the target behavior and the consequence events immediately following the behavior in the natural environment.",
    "referenceSource": "BACB Task List Specification",
    "tags": ["BACB", "Assessment", "ABC Data"],
    "certification": "BACB",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "bacb-prac-010",
    "code": "BACB-DOM-C-010",
    "domainId": "C",
    "domainName": "C — Skill Acquisition",
    "topicId": "DTT",
    "topicName": "Discrete Trial Teaching (DTT) (C-01)",
    "difficulty": "Easy",
    "content": "What are the three core components of a discrete trial in ABA teaching?",
    "options": [
      "Antecedent (SD) -> Behavior (Response) -> Consequence (Reinforcement/Feedback)",
      "Introduction -> Body -> Conclusion",
      "Prompt -> Reinforcer -> Extinction",
      "Baseline -> Intervention -> Generalization"
    ],
    "correctAnswer": 0,
    "explanation": "Discrete trial teaching relies on a clear 3-term contingency: Discriminative Stimulus (SD), Learner Response, and Consequence (Reinforcer or Error Correction).",
    "referenceSource": "BACB Task List Specification",
    "tags": ["BACB", "Skill Acquisition", "DTT"],
    "certification": "BACB",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "bacb-prac-011",
    "code": "BACB-DOM-C-011",
    "domainId": "C",
    "domainName": "C — Skill Acquisition",
    "topicId": "Chaining",
    "topicName": "Task Analysis and Chaining",
    "difficulty": "Medium",
    "content": "A technician teaches handwashing by prompting the client through all steps except the final step (drying hands with a towel), which the client completes independently for reinforcement. Which chaining method is this?",
    "options": [
      "Forward Chaining",
      "Backward Chaining",
      "Total Task Chaining",
      "Global Chaining"
    ],
    "correctAnswer": 1,
    "explanation": "Backward Chaining teaches all initial steps with instructor assistance and requires the learner to perform the final step independently to access terminal reinforcement.",
    "referenceSource": "BACB Task List Specification",
    "tags": ["BACB", "Skill Acquisition", "Chaining"],
    "certification": "BACB",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "bacb-prac-012",
    "code": "BACB-DOM-D-012",
    "domainId": "D",
    "domainName": "D — Behavior Reduction",
    "topicId": "Functions",
    "topicName": "Functions of Behavior (D-01)",
    "difficulty": "Easy",
    "content": "A child screams when handed a difficult math worksheet, and the teacher immediately removes the worksheet. What is the most likely maintaining function of the screaming behavior?",
    "options": [
      "Sensory / Automatic",
      "Escape / Avoidance",
      "Tangible Access",
      "Attention"
    ],
    "correctAnswer": 1,
    "explanation": "The consequence of removing the task constitutes negative reinforcement via Escape/Avoidance of an aversive demand.",
    "referenceSource": "BACB Task List Specification",
    "tags": ["BACB", "Behavior Reduction", "Escape"],
    "certification": "BACB",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "bacb-prac-013",
    "code": "BACB-DOM-D-013",
    "domainId": "D",
    "domainName": "D — Behavior Reduction",
    "topicId": "Extinction",
    "topicName": "Extinction Procedures",
    "difficulty": "Medium",
    "content": "During the first two days of implementing an attention-extinction protocol for screaming, the child screams twice as loudly and throws chairs. What phenomenon is occurring?",
    "options": [
      "Spontaneous Recovery",
      "Extinction Burst",
      "Behavior Contrast",
      "Faulty Stimulus Control"
    ],
    "correctAnswer": 1,
    "explanation": "An Extinction Burst is a temporary, predictable increase in the frequency, duration, or intensity of the target behavior when reinforcement is first withheld.",
    "referenceSource": "BACB Task List Specification",
    "tags": ["BACB", "Behavior Reduction", "Extinction"],
    "certification": "BACB",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "bacb-prac-014",
    "code": "BACB-DOM-E-014",
    "domainId": "E",
    "domainName": "E — Documentation and Reporting",
    "topicId": "Notes",
    "topicName": "Objective Session Notes (E-01)",
    "difficulty": "Easy",
    "content": "Which of the following statements represents an objective, measurable clinical session note?",
    "options": [
      "Client was in a bad mood and felt angry at everyone today.",
      "Client engaged in 4 instances of hitting peers across the 2-hour session.",
      "Client tried really hard to be good today.",
      "Client had an attitude during transitions."
    ],
    "correctAnswer": 1,
    "explanation": "Objective clinical notes must state observable facts and exact behavioral counts rather than subjective mentalistic assumptions.",
    "referenceSource": "BACB Task List Specification",
    "tags": ["BACB", "Documentation", "Notes"],
    "certification": "BACB",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "bacb-prac-015",
    "code": "BACB-DOM-F-015",
    "domainId": "F",
    "domainName": "F — Professional Conduct",
    "topicId": "Supervision",
    "topicName": "BACB Supervision Requirements",
    "difficulty": "Medium",
    "content": "According to the BACB maintenance requirements, what minimum percentage of a behavior technician's monthly ABA service hours must be directly supervised by a qualified BCBA or BCaBA?",
    "options": [
      "2%",
      "5%",
      "10%",
      "20%"
    ],
    "correctAnswer": 1,
    "explanation": "The BACB mandates that a minimum of 5% of a behavior technician's monthly hours delivering behavior-analytic services must be supervised.",
    "referenceSource": "BACB RBT Maintenance Standards",
    "tags": ["BACB", "Ethics", "Supervision"],
    "certification": "BACB",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "bacb-prac-016",
    "code": "BACB-DOM-A-016",
    "domainId": "A",
    "domainName": "A — Data Collection and Graphing",
    "topicId": "Continuous",
    "topicName": "Continuous Measurement (A-01)",
    "difficulty": "Medium",
    "content": "An observer starts a timer when the teacher gives the instruction 'Open your books' and stops the timer as soon as the student turns to page 1. What measurement was recorded?",
    "options": [
      "Interresponse Time (IRT)",
      "Response Latency",
      "Total Duration",
      "Continuous Rate"
    ],
    "correctAnswer": 1,
    "explanation": "Response Latency measures the time from the delivery of an antecedent stimulus (instruction) until the initial initiation of the target response.",
    "referenceSource": "BACB Task List Specification",
    "tags": ["BACB", "Measurement", "Latency"],
    "certification": "BACB",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "bacb-prac-017",
    "code": "BACB-DOM-C-017",
    "domainId": "C",
    "domainName": "C — Skill Acquisition",
    "topicId": "Generalization",
    "topicName": "Generalization and Maintenance",
    "difficulty": "Hard",
    "content": "A client learns to identify coins with their RBT in the clinic. The client is now able to identify real coins with their mother at the grocery store. What type of generalization is this?",
    "options": [
      "Stimulus Generalization",
      "Response Generalization",
      "Response Maintenance",
      "Stimulus Discrimination"
    ],
    "correctAnswer": 0,
    "explanation": "Stimulus Generalization occurs when the same trained response is emitted in the presence of novel, untrained antecedent stimuli, people, or settings.",
    "referenceSource": "BACB Task List Specification",
    "tags": ["BACB", "Skill Acquisition", "Generalization"],
    "certification": "BACB",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "bacb-prac-018",
    "code": "BACB-DOM-D-018",
    "domainId": "D",
    "domainName": "D — Behavior Reduction",
    "topicId": "Differential",
    "topicName": "Differential Reinforcement (DRA/DRO/DRI)",
    "difficulty": "Medium",
    "content": "A technician provides praise and tokens when a student raises their hand to speak instead of shouting out. Hand-raising and shouting out can technically occur at the same time. Which reinforcement schedule is being used?",
    "options": [
      "DRA (Alternative Behavior)",
      "DRI (Incompatible Behavior)",
      "DRO (Other Behavior)",
      "DRL (Low Rates)"
    ],
    "correctAnswer": 0,
    "explanation": "DRA reinforces a functional alternative behavior that serves the same function as the target behavior, even if the two behaviors are not topographically incompatible.",
    "referenceSource": "BACB Task List Specification",
    "tags": ["BACB", "Behavior Reduction", "DRA"],
    "certification": "BACB",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "bacb-prac-019",
    "code": "BACB-DOM-F-019",
    "domainId": "F",
    "domainName": "F — Professional Conduct",
    "topicId": "Ethics",
    "topicName": "Client Dignity and Confidentiality",
    "difficulty": "Easy",
    "content": "An RBT discusses a client's specific behavioral challenges in a crowded coffee shop with a fellow staff member, mentioning the client by full name. Which ethical guideline is violated?",
    "options": [
      "Prompt fading compliance",
      "Maintaining client confidentiality (HIPAA / BACB Ethics Code)",
      "Differential reinforcement fidelity",
      "Supervision hourly quota"
    ],
    "correctAnswer": 1,
    "explanation": "Technicians must protect client confidentiality and private health information at all times, avoiding public discussions where identifying details could be overheard.",
    "referenceSource": "BACB Ethics Code for Behavior Technicians",
    "tags": ["BACB", "Ethics", "Confidentiality"],
    "certification": "BACB",
    "certificationVersion": "6th Edition"
  },
  {
    "id": "bacb-prac-020",
    "code": "BACB-DOM-B-020",
    "domainId": "B",
    "domainName": "B — Assessment and Preference Testing",
    "topicId": "Preference",
    "topicName": "Preference Assessments (B-01)",
    "difficulty": "Medium",
    "content": "In a Free Operant preference assessment, how does the observer determine preference hierarchies?",
    "options": [
      "By forcing the client to choose between pairs of items on every trial",
      "By observing the client in an enriched environment and recording the total duration spent with each available item",
      "By removing chosen items until none remain",
      "By asking the parents to fill out a questionnaire"
    ],
    "correctAnswer": 1,
    "explanation": "Free Operant preference assessments measure the total engagement time allocated to various stimuli freely available without practitioner restriction.",
    "referenceSource": "BACB Task List Specification",
    "tags": ["BACB", "Assessment", "Free Operant"],
    "certification": "BACB",
    "certificationVersion": "6th Edition"
  }
];

export const INITIAL_FLASHCARDS: Flashcard[] = [
  {
    id: 'fc_001',
    certification: 'RBT',
    certificationVersion: '6th Edition',
    domain: 'A: Measurement',
    topic: 'Continuous Measurement',
    front: 'What is Latency in behavior measurement?',
    back: 'The elapsed time from the onset of a stimulus (SD) to the initiation of the response.',
    explanation: 'Example: 3 seconds from "Touch nose" to finger movement.',
  },
  {
    id: 'fc_002',
    certification: 'RBT',
    certificationVersion: '6th Edition',
    domain: 'A: Measurement',
    topic: 'Continuous Measurement',
    front: 'What is Inter-Response Time (IRT)?',
    back: 'The elapsed time between two successive responses (from the end of one instance to the start of the next).',
    explanation: 'Example: 15 seconds between consecutive sips of water.',
  },
  {
    id: 'fc_003',
    certification: 'RBT',
    certificationVersion: '6th Edition',
    domain: 'B: Assessment',
    topic: 'Preference Assessments',
    front: 'How does an MSWO (Multiple Stimulus Without Replacement) work?',
    back: 'Items are presented in an array; once chosen, the item is removed permanently and remaining items are rearranged.',
    explanation: 'Produces a ranked hierarchy of preferences.',
  },
  {
    id: 'fc_004',
    certification: 'RBT',
    certificationVersion: '6th Edition',
    domain: 'C: Skill Acquisition',
    topic: 'Discrete Trial Teaching (DTT)',
    front: 'What are the 5 parts of a Discrete Trial?',
    back: '1. Antecedent (SD)\n2. Prompt (if needed)\n3. Learner Response\n4. Consequence (SR+ or correction)\n5. Inter-Trial Interval (ITI)',
    explanation: 'A structured, fast-paced teaching technique.',
  },
  {
    id: 'fc_005',
    certification: 'RBT',
    certificationVersion: '6th Edition',
    domain: 'D: Behavior Reduction',
    topic: 'Functions of Behavior',
    front: 'What does the SEAT acronym stand for in ABA?',
    back: '1. Sensory (Automatic)\n2. Escape / Avoidance\n3. Attention\n4. Tangible',
    explanation: 'The four universal maintaining functions of behavior.',
  },
];

export const INITIAL_MOCK_EXAMS: MockExam[] = [
  {
    id: 'test_measurement_drill',
    code: 'DRILL-MEASURE-A',
    certification: 'RBT',
    certificationVersion: '6th Edition',
    title: 'Domain A: Measurement Mastery Drill',
    description: '10-question high-yield drill covering continuous measurement (rate, duration, latency, IRT) and discontinuous time sampling.',
    domain: 'A: Measurement',
    durationMinutes: 15,
    passingScorePercent: 80,
    totalQuestions: 10,
    questionIds: INITIAL_QUESTIONS.filter((q) => q.domainName.includes('Measurement') || q.domainName.includes('Data Collection')).slice(0, 10).map((q) => q.id),
  },
  {
    id: 'test_assessment_drill',
    code: 'DRILL-ASSESS-B',
    certification: 'RBT',
    certificationVersion: '6th Edition',
    title: 'Domain B: Assessment & Data Collection',
    description: '10-question drill focusing on preference assessments (MSWO, MSW, Paired) and ABC narrative data collection.',
    domain: 'B: Assessment',
    durationMinutes: 15,
    passingScorePercent: 80,
    totalQuestions: 10,
    questionIds: INITIAL_QUESTIONS.filter((q) => q.domainName.includes('Assessment')).slice(0, 10).map((q) => q.id),
  },
  {
    id: 'test_skill_acq_drill',
    code: 'DRILL-SKILL-C',
    certification: 'RBT',
    certificationVersion: '6th Edition',
    title: 'Domain C: Skill Acquisition Protocols',
    description: '10-question drill on DTT prompting hierarchies, shaping, chaining, and token economy implementation.',
    domain: 'C: Skill Acquisition',
    durationMinutes: 15,
    passingScorePercent: 80,
    totalQuestions: 10,
    questionIds: INITIAL_QUESTIONS.filter((q) => q.domainName.includes('Skill')).slice(0, 10).map((q) => q.id),
  },
  {
    id: 'test_behavior_reduc_drill',
    code: 'DRILL-REDUC-D',
    certification: 'RBT',
    certificationVersion: '6th Edition',
    title: 'Domain D: Behavior Reduction & DRI/DRA',
    description: '10-question drill covering functional extinction, differential reinforcement (DRA, DRI, DRO), and crisis emergency plans.',
    domain: 'D: Behavior Reduction',
    durationMinutes: 15,
    passingScorePercent: 80,
    totalQuestions: 10,
    questionIds: INITIAL_QUESTIONS.filter((q) => q.domainName.includes('Behavior')).slice(0, 10).map((q) => q.id),
  },
  {
    id: 'test_ethics_drill',
    code: 'DRILL-ETHICS-F',
    certification: 'RBT',
    certificationVersion: '6th Edition',
    title: 'Domain F: Ethics 2.0 & Professional Conduct',
    description: '10-question scenario drill on gifts, dual relationships, social media, and mandatory reporting.',
    domain: 'F: Professional Conduct',
    durationMinutes: 12,
    passingScorePercent: 80,
    totalQuestions: 10,
    questionIds: INITIAL_QUESTIONS.filter((q) => q.domainName.includes('Ethics') || q.domainName.includes('Professional')).slice(0, 10).map((q) => q.id),
  },
  {
    id: 'mock_exam_full_01',
    code: 'MOCK-6TH-01',
    certification: 'RBT',
    certificationVersion: '6th Edition',
    title: 'RBT 6th Edition Full Practice Examination 1',
    description: 'Comprehensive 85-question simulation modeled strictly after the BACB Registered Behavior Technician 6th Edition blueprint.',
    domain: 'Comprehensive',
    durationMinutes: 90,
    passingScorePercent: 80,
    totalQuestions: 85,
    questionIds: INITIAL_QUESTIONS.map((q) => q.id),
  },
  {
    id: 'mock_exam_diagnostic_02',
    code: 'MOCK-6TH-DIAG',
    certification: 'RBT',
    certificationVersion: '6th Edition',
    title: 'RBT 6th Edition Rapid Diagnostic Assessment (45 Questions)',
    description: 'Focused mid-length 6th Edition assessment to identify weak domain areas before your scheduled testing window.',
    domain: 'Diagnostic',
    durationMinutes: 45,
    passingScorePercent: 80,
    totalQuestions: 45,
    questionIds: INITIAL_QUESTIONS.slice(0, 45).map((q) => q.id),
  },
];

export const INITIAL_STUDY_GUIDES: StudyGuide[] = [
  {
    id: 'guide_measurement',
    slug: 'measurement-guide',
    certification: 'RBT',
    certificationVersion: '6th Edition',
    title: 'Domain A: Measurement — RBT 6th Edition Comprehensive Review',
    summary: 'Master continuous and discontinuous measurement methods, data graphing, and inter-response time.',
    domain: 'A: Measurement',
    readTimeMinutes: 12,
    sections: [
      {
        title: 'Continuous vs. Discontinuous Measurement',
        content: 'Continuous measurement records every instance of behavior (Frequency, Rate, Duration, Latency, IRT). Discontinuous measurement captures samples during intervals (Whole Interval, Partial Interval, Momentary Time Sampling).',
        keyFormulasOrPoints: [
          'Rate = Count / Total Observation Time',
          'Latency = Time from SD onset to behavior initiation',
          'Whole Interval = Behavior must occur during 100% of the interval (underestimates duration)',
          'Partial Interval = Behavior occurs at ANY point in the interval (overestimates frequency)',
        ],
      },
      {
        title: 'Permanent Product Recording',
        content: 'Measuring behavior after it has occurred by observing the physical effects or outcomes the behavior produced in the environment.',
        keyFormulasOrPoints: [
          'Does not require direct real-time observation of the client',
          'Examples: Number of math problems completed, widgets assembled',
        ],
      },
    ],
  },
  {
    id: 'guide_behavior_reduction',
    slug: 'behavior-reduction-guide',
    certification: 'RBT',
    certificationVersion: '6th Edition',
    title: 'Domain D: Behavior Reduction & Intervention Plans — 6th Edition',
    summary: 'Essential strategies for identifying behavioral functions, implementing extinction, and applying differential reinforcement.',
    domain: 'D: Behavior Reduction',
    readTimeMinutes: 15,
    sections: [
      {
        title: 'The Four Functions of Behavior (SEAT)',
        content: 'Every operant behavior is maintained by one or more environmental functions: Sensory (automatic), Escape/Avoidance, Attention, and Tangible/Access.',
        keyFormulasOrPoints: [
          'Sensory: Behavior itself feels good / relieves physical discomfort',
          'Escape: Behavior results in avoiding or removing a demand/task',
          'Attention: Behavior results in social feedback (positive or reprimands)',
          'Tangible: Behavior results in obtaining a preferred item or activity',
        ],
      },
      {
        title: 'Differential Reinforcement Procedures',
        content: 'DRA (Alternative), DRI (Incompatible), and DRO (Other). Reinforcing desired behaviors while withholding reinforcement for maladaptive behaviors.',
        keyFormulasOrPoints: [
          'DRA: Reinforce a functionally equivalent alternative (e.g. asking politely instead of screaming)',
          'DRI: Reinforce a behavior that physically cannot occur at the same time (e.g. hands in pockets instead of hand flapping)',
          'DRO: Reinforce the client whenever the problem behavior has NOT occurred for a specified duration',
        ],
      },
    ],
  },
];
