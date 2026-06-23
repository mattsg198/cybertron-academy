import type { Unit } from '../../types'

// SECTOR 11 · KET Mock 2 — final comprehensive paper (大关卡, reading-heavy)
// 原创 KET 真题风:标志/告示、听力、混合语法完形、长短文阅读、email。
export const ketMock2: Unit = {
  id: 'u11',
  name: 'KET Mock 2: Final Exam',
  zh: 'KET 模考二 · 综合冲刺（Boss）',
  color: '#a01f8f',
  rewardRobotId: 'ultramagnus',
  kind: 'exam',
  lessons: [
    {
      id: 'u11l1',
      title: 'KET Final Paper',
      emoji: '🏁',
      tier: 3,
      skills: ['read', 'listen', 'grammar'],
      topic: 'mixed',
      grammar: 'mixed',
      cefr: 'A2',
      exercises: [
        // —— 标志/告示 ——
        {
          type: 'read',
          passage: 'NO PARKING',
          question: "What can't you do here?",
          answer: 'Park a car',
          options: ['Park a car', 'Walk', 'Take photos'],
        },
        {
          type: 'read',
          passage: 'SALE\nEVERYTHING 50% OFF TODAY',
          question: 'What does the sign tell us?',
          answer: 'Things are cheaper',
          options: ['Things are cheaper', 'The shop is shut', 'Prices went up'],
        },
        {
          type: 'read',
          passage: 'SWIMMING POOL\nCLOSED FOR CLEANING',
          question: 'Can you swim here today?',
          answer: 'No',
          options: ['Yes', 'No', 'Only in the morning'],
        },
        // —— 听力 ——
        {
          type: 'listen',
          audio: 'The bus leaves at half past eight.',
          question: 'What time does the bus leave?',
          answer: '8:30',
          options: ['8:30', '8:15', '7:30'],
        },
        {
          type: 'listen',
          audio: 'The party is on Friday evening.',
          question: 'When is the party?',
          answer: 'Friday',
          options: ['Monday', 'Friday', 'Sunday'],
        },
        // —— 混合语法完形 ——
        {
          type: 'fillBlank',
          before: 'Last summer we ',
          after: ' to Spain.',
          options: ['go', 'went', 'going'],
          answer: 'went',
          zh: '过去时 went',
        },
        {
          type: 'fillBlank',
          before: 'She has ',
          after: ' to Japan twice.',
          options: ['be', 'been', 'was'],
          answer: 'been',
          zh: 'have been to',
        },
        {
          type: 'fillBlank',
          before: "Don't worry, I ",
          after: ' call you tonight.',
          options: ['will', 'am', 'did'],
          answer: 'will',
          zh: 'will 将来',
        },
        {
          type: 'fillBlank',
          before: 'You ',
          after: ' be quiet in the library.',
          options: ['must', 'musts', 'are'],
          answer: 'must',
          zh: 'must + 原形',
        },
        {
          type: 'fillBlank',
          before: 'This box is ',
          after: ' than that one.',
          options: ['heavy', 'heavier', 'heaviest'],
          answer: 'heavier',
          zh: '比较级 heavier than',
        },
        {
          type: 'fillBlank',
          before: "There aren't ",
          after: ' apples left.',
          options: ['some', 'any', 'much'],
          answer: 'any',
          zh: '否定句用 any',
        },
        // —— 语序 ——
        {
          type: 'sentenceBuild',
          audio: 'Where did you go yesterday?',
          zh: '你昨天去哪了?',
          words: ['Where', 'did', 'you', 'go', 'yesterday'],
        },
        {
          type: 'sentenceBuild',
          audio: 'I am going to study tonight.',
          zh: '我今晚要学习。',
          words: ['I', 'am', 'going', 'to', 'study', 'tonight'],
        },
        // —— 长短文阅读(同一短文两问) ——
        {
          type: 'read',
          passage:
            'Tom is twelve. He lives in a small town near the sea. Every morning he walks to school with his sister. Last weekend they went to the beach and built a big sandcastle. Next summer they are going to visit their grandparents in the city.',
          question: 'How does Tom get to school?',
          answer: 'He walks',
          options: ['By bus', 'He walks', 'By car'],
        },
        {
          type: 'read',
          passage:
            'Tom is twelve. He lives in a small town near the sea. Every morning he walks to school with his sister. Last weekend they went to the beach and built a big sandcastle. Next summer they are going to visit their grandparents in the city.',
          question: 'What did they do last weekend?',
          answer: 'Went to the beach',
          options: ['Visited grandparents', 'Went to the beach', 'Stayed home'],
        },
        // —— email ——
        {
          type: 'read',
          passage: 'Hi Sam,\nThe film starts at 3 pm. Let’s meet outside the cinema at 2:45.\nBen',
          question: 'Where will they meet?',
          answer: 'Outside the cinema',
          options: ["At Ben's house", 'Outside the cinema', 'At school'],
        },
      ],
    },
  ],
}
