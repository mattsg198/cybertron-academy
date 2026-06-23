import type { Unit } from '../../types'

// SECTOR 5 · KET Mock — Ravage's Hunt (大关卡)
// KET 真题风（≥90% 中性真题格式）：标志理解 / 听力选择 / 完形语法 / 阅读 / email。
// 变形金刚主题由 Boss 血条外壳承担，题目内容保持应试迁移性。
export const ketMock: Unit = {
  id: 'u5',
  name: "KET Mock: Ravage's Hunt",
  zh: 'KET 模考 · 综合复习（Boss）',
  color: '#7a2bd6',
  rewardRobotId: 'megatron',
  kind: 'exam',
  lessons: [
    {
      id: 'u5l1',
      title: 'KET Mock Paper',
      emoji: '🐆',
      tier: 3,
      skills: ['read', 'listen', 'grammar'],
      topic: 'mixed',
      grammar: 'mixed',
      cefr: 'A2',
      exercises: [
        // —— Reading Part 1: 标志/告示理解 ——
        {
          type: 'read',
          passage: 'LIBRARY\n— PLEASE BE QUIET —',
          question: 'What must you do here?',
          answer: 'Be quiet',
          options: ['Be quiet', 'Run fast', 'Eat lunch'],
        },
        {
          type: 'read',
          passage: 'SHOP OPEN: Monday to Friday\nCLOSED on Sunday',
          question: 'When is the shop closed?',
          answer: 'Sunday',
          options: ['Monday', 'Friday', 'Sunday'],
        },
        // —— Listening: 选择 ——
        {
          type: 'listen',
          audio: 'The train leaves at quarter past four.',
          question: 'What time does the train leave?',
          answer: '4:15',
          options: ['3:15', '4:15', '4:45'],
        },
        // —— 完形/语法 ——
        {
          type: 'fillBlank',
          before: 'My brother ',
          after: ' football every Saturday.',
          options: ['play', 'plays', 'playing'],
          answer: 'plays',
          zh: '第三人称单数 plays',
        },
        {
          type: 'fillBlank',
          before: "We don't have ",
          after: ' milk.',
          options: ['some', 'any', 'much'],
          answer: 'any',
          zh: '否定句用 any',
        },
        {
          type: 'fillBlank',
          before: 'I go to school ',
          after: ' Monday.',
          options: ['on', 'in', 'at'],
          answer: 'on',
          zh: '星期几用 on',
        },
        {
          type: 'fillBlank',
          before: 'It is cold. Put on your ',
          after: '.',
          options: ['coat', 'apple', 'book'],
          answer: 'coat',
          zh: '词汇完形：coat 外套',
        },
        {
          type: 'fillBlank',
          before: 'A lion is ',
          after: ' than a rabbit.',
          options: ['big', 'bigger', 'biggest'],
          answer: 'bigger',
          zh: '比较级 bigger than',
        },
        {
          type: 'fillBlank',
          before: 'Listen! The baby ',
          after: ' now.',
          options: ['cry', 'is crying', 'cries'],
          answer: 'is crying',
          zh: 'now → 现在进行时',
        },
        // —— 过去时 ——
        {
          type: 'fillBlank',
          before: 'Yesterday we ',
          after: ' to the park.',
          options: ['go', 'went', 'going'],
          answer: 'went',
          zh: '过去时 go → went',
        },
        {
          type: 'fillBlank',
          before: 'She ',
          after: ' her homework last night.',
          options: ['finish', 'finished', 'finishes'],
          answer: 'finished',
          zh: '规则过去式 -ed',
        },
        // —— 将来时 ——
        {
          type: 'fillBlank',
          before: 'Tomorrow I am ',
          after: ' to visit my aunt.',
          options: ['going', 'go', 'went'],
          answer: 'going',
          zh: 'be going to + 原形',
        },
        {
          type: 'fillBlank',
          before: "Don't worry, I ",
          after: ' help you.',
          options: ['will', 'am', 'did'],
          answer: 'will',
          zh: 'will 表示决定',
        },
        // —— 情态动词 ——
        {
          type: 'fillBlank',
          before: 'You ',
          after: ' wear a seatbelt in the car.',
          options: ['must', 'musts', 'are'],
          answer: 'must',
          zh: 'must + 动词原形',
        },
        // —— 现在完成时 ——
        {
          type: 'fillBlank',
          before: 'I have ',
          after: ' my homework.',
          options: ['do', 'did', 'done'],
          answer: 'done',
          zh: 'have + 过去分词 done',
        },
        {
          type: 'fillBlank',
          before: 'Have you ',
          after: ' been to London?',
          options: ['ever', 'never', 'just'],
          answer: 'ever',
          zh: '疑问句用 ever',
        },
        // —— 最高级 ——
        {
          type: 'fillBlank',
          before: 'Optimus is the ',
          after: ' Autobot of all.',
          options: ['tall', 'taller', 'tallest'],
          answer: 'tallest',
          zh: '最高级 the tallest',
        },
        // —— 语序 ——
        {
          type: 'sentenceBuild',
          audio: 'What time do you get up?',
          zh: '你几点起床？',
          words: ['What', 'time', 'do', 'you', 'get', 'up'],
        },
        // —— Reading: 短文理解 ——
        {
          type: 'read',
          passage:
            'Anna has breakfast at seven. She goes to school by bus. After school she plays tennis. She does her homework in the evening.',
          question: 'How does Anna go to school?',
          answer: 'By bus',
          options: ['By car', 'By bus', 'By bike'],
        },
        // —— Reading: email/留言理解 ——
        {
          type: 'read',
          passage: 'Hi Tom,\nDo you want to come to my house on Saturday? We can play games.\nFrom Ben',
          question: 'When does Ben want to meet?',
          answer: 'On Saturday',
          options: ['On Sunday', 'On Saturday', 'On Monday'],
        },
      ],
    },
  ],
}
