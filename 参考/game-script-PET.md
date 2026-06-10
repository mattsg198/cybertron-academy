# AutoBot Academy — PET Sprint Story Bible
### 《Operation: Restore Cybertron 修复赛博坦》游戏剧本圣经 v1

> **目标**：P3–P4 起步，P4–P5 冲刺剑桥 **PET（B1 Preliminary for Schools）**，同步服务新加坡 **AEIS** 入学英文水平。
> **对齐**：Cambridge A1→A2(KET)→B1(PET) 阶梯 ＋ 新加坡 MOE《English Language Syllabus 2020 / STELLAR》。
> **玩法**：多邻国式微关卡 + 螺旋复习 + 剧情驱动。
> **设计原作参考**：`autobot-academy-stories.md`（世界观/角色素材库，已保留）。

---

## 0. 设计原则（含护眼/大字规范）

**儿童心理（8–10岁）**
- 单节 3–4 分钟、即时反馈、错误"修复机器人"而非惩罚。
- 高频小成就（小 Boss）+ 阶段大目标（晋级考核），节奏张弛。
- 角色养成 + 剧情救援，给"为什么学"一个理由。

**护眼 / 大字（写入 UI 规范，后续编码遵循）**
- 深色护眼底（#0A0F2C 系），正文用柔白 **#EAF2FF**，避免纯白 #FFFFFF 刺眼。
- 字号下限：正文 ≥ **20px**，题干 ≥ **24px**，选项/按钮文字 ≥ **20px**，主标题 ≥ 28px。
- 每屏文字极简（≤ 2 行说明）、行距 ≥ 1.5、留白充足、触控热区 ≥ 56px。
- 关键内容**配 TTS 朗读**，降低长时间盯屏；连续学习 15 分钟提示"护眼休息"。
- 动画柔和，避免高频闪烁与强对比频闪。

**教学法**
- 每节点锚定一条 **Can-do**（剑桥 can-do 描述）+ 明确**目标词汇/语法**。
- **螺旋式**：新知必复用旧知（如学 past simple 时复用 Rank 2 的食物/地点词）。
- 四技能滚动：Listening / Speaking / Reading / Writing 按 Rank 递增占比。

---

## 1. 关卡分级架构（核心机制）

三层结构，正好对应你的需求：

| 层级 | 名称 | 作用 | 机制 |
|---|---|---|---|
| **微关卡** | Node 节点（小关卡） | 学一个 can-do | 5–7 个微回合，3–4 分钟；答错扣"能量核心🔋"，错题进螺旋重练，必可通关 |
| **小 Boss** | Sector Boss（小boss） | 扇区即时复盘，控节奏 | 一个扇区所有节点后解锁；8–10 道**混合题**，狂派单位 HP 条随答对而清空；奖励扇区徽章 |
| **大关卡** | Rank-Up Exam（分等级考核突破） | 晋级闸门 | 一个 Rank 全部扇区+小Boss后解锁；**PET 题型限时测评**，评级 🥉Bronze/🥈Silver/🥇Gold；达标才"突破晋级"，可补考刷分 |

**晋级 = 看得见的成长**：通过大关卡 → 学员军衔提升（徽章+变形动画）+ **唤醒一名主力汽车人** + 收复一片区域。

---

## 2. 季主线剧情

威震天用病毒打乱了汽车人的**通讯矩阵（Comm-Matrix）**，全部任务数据被**英文密码**锁死，主力队员陷入沉睡。
玩家是新学员 **Cadet（你的孩子）**，搭档向导机器人 **汽车人探长**。
**每解锁一个英文扇区 = 唤醒一名队员 + 收复一区**；每 Rank 末击退一名狂派将领并晋级；终局决战 **Megatron**，修复矩阵、点亮赛博坦。

**军衔晋级线（玩家成长）**：Cadet 学员 → Scout 侦察兵 → Warrior 战士 → Commander 指挥官 → **Prime 候选**

---

## 3. 难度阶梯总览（Rank × CEFR × 年级带 × 角色）

| Rank | 军衔 | CEFR | 年级带 | 区域 | 新登场角色 | 大关卡 Boss |
|---|---|---|---|---|---|---|
| 1 | Cadet 学员 | A1 基础 | ~P1–P2 | Boot-up Sector 启动区 | 🤖汽车人探长 · 🐝Bumblebee · 🚛Optimus | 🟣Rumble's Scramble |
| 2 | Scout 侦察兵 | A2 (KET) | ~P3 | Iacon Streets 伊阿空街区 | 🎷Jazz · 🩺Ratchet | 🐆Ravage's Hunt |
| 3 | Warrior 战士 | A2+→B1 桥接 | ~P4 | Earth Frontier 地球前线 | 🔫Ironhide · 🏍️Arcee | ✈️Starscream's Trial |
| 4 | Commander 指挥官 | B1 (PET) | ~P5 | Ark Command 方舟指挥部 | 🔬Wheeljack · 🔵Ultra Magnus · 💜Elita-1 | 📡Soundwave's Cipher |
| ★ | Prime 候选 | B1 综合 | P5 冲刺 | Cybertron Core 核心 | 全员 | 👾**Megatron's Last Stand** |

**题型随 Rank 解锁（复杂度递增）**
- Rank 1–2：看图识词 / 听音选择 / 拼词 / 排句 / 填空 / 跟读
- Rank 3：+ 看图说话 / 短文排序 / 听力理解 / 比较句改写
- Rank 4 (PET)：+ 开放完形(open cloze) / 阅读多选 / 句型转换(sentence transformation) / 短文写作(email & story) / 角色扮演口语

### 3.1 起点与定级（不从零开始 · 逐级递增）

孩子已在 P3–P4，A1（问候/颜色/数字）过于简单，主线不应从零起步：

- **主线默认从 Rank 2（Scout · A2/KET）开始**，难度逐级递增直到 Rank 4（PET/B1）。
- **Rank 1（Cadet · A1）降级为可选「新兵训练营 Boot Camp」**：不在主线关键路径上，仅用于查漏补缺/找回信心，随时可玩、可整段跳过。
- 首次进入做一次 **定级扫描 Placement Scan**（多邻国式快速诊断，~10 题，2 分钟）：
  - 表现强 → 直接落在 Rank 3 起跑；中等 → Rank 2；基础薄弱 → 提示先玩 Boot Camp。
  - 之后只能靠通过**大关卡**逐级解锁更高 Rank，保持"逐步提升"的节奏。

---

## 4. 完整课程脊柱（Curriculum Spine）

> 每个 Node 字段：**Can-do** ｜ 目标词汇 ｜ 目标语法 ｜ 题型流 ｜ 螺旋回炉 ｜ 剧情/奖励

---

### ⭐ RANK 1 · CADET（A1 · 启动区）— 全文剧本（生产模板）

**Rank 剧情开场**
> 🤖 **汽车人探长:** "Cadet, wake up! Cybertron is dark. Megatron locked our words. Only YOU can decode them."
> 🚛 **Optimus (远程信号):** "Begin your training, young one. Learn our language. Bring us back."

#### Sector 1.1 · First Signals（问候与自我介绍）
- 🟢 **1.1.1 Hello, Autobot** — *Can greet people and say hello/goodbye.*
  词汇：hello, hi, goodbye, bye, yes, no｜语法：—（固定表达）
  题型流：听音选择 → 看图识词 → 跟读 "Hello!" → 排句 "Hello, I am 汽车人探长."
  剧情：🐝 "Every Autobot starts with a friendly signal. Say hello!"
- 🟢 **1.1.2 I am a Cadet** — *Can say my name and who I am.*
  词汇：I, am, you, are, name, robot, friend｜语法：**be**(I am / you are), 主格代词
  题型流：填空 "I ___ a cadet."(am) → 排句 → 跟读 "My name is ___."
  螺旋：复用 hello
- 🟢 **1.1.3 How are you?** — *Can ask and answer how someone feels.*
  词汇：how, fine, happy, sad, tired, OK｜语法：How are you? / I'm fine.
  题型流：听力理解(选表情) → 填空 → 跟读对话
- 🟢 **1.1.4 Nice to meet you** — *Can do a short introduction.*
  词汇：meet, this, is｜语法：This is… / Nice to meet you.
  题型流：排句对话 → 看图说话 → 跟读
  剧情：🐝 "Good. Now you can talk to any Autobot. Roll out!"
- 🟣 **Sector Boss 1.1 — Static Glitch**：混合 8 题（问候/be/代词），击退信号干扰兽，奖励：🎖️ Signal Badge + 30⚡

#### Sector 1.2 · My Squad（家庭与人）
- 🟢 **1.2.1 My Family** — *Can name family members.*
  词汇：mother, father, sister, brother, baby, family｜语法：my / your(物主)
  题型流：看图识词 → 听音选择 → 拼词
- 🟢 **1.2.2 I have got** — *Can say what family/things I have.*
  词汇：have got, a, an｜语法：**have got** (I have got a…)
  题型流：填空 a/an → 排句 "I have got a sister."
  螺旋：复用 family 词
- 🟢 **1.2.3 Who is this?** — *Can ask and answer about people.*
  词汇：who, he, she｜语法：he is / she is, Who is this?
  题型流：听力理解 → 填空 he/she → 跟读
- 🟢 **1.2.4 My Friends** — *Can introduce a friend.*
  词汇：boy, girl, friend, kind, funny｜语法：This is my friend. He/She is…
  题型流：看图说话 → 排句 → 跟读
- 🟣 **Sector Boss 1.2 — Frenzy's Echo**：混合（family/have got/he-she），奖励：🎖️ Squad Badge + 30⚡

#### Sector 1.3 · Color & Count Bay（颜色 · 数字 · 教室）
- 🟢 **1.3.1 Colours** — *Can name basic colours.*
  词汇：red, blue, yellow, green, black, white｜语法：It is + colour
- 🟢 **1.3.2 Numbers 1–20** — *Can count to twenty.*
  词汇：one…twenty｜语法：数词
- 🟢 **1.3.3 In the Classroom** — *Can name classroom objects.*
  词汇：pen, book, bag, desk, chair, ruler｜语法：复数 -s, a/an
  螺旋：复用颜色 "a red pen"
- 🟢 **1.3.4 How many?** — *Can ask and answer about quantity.*
  词汇：how many, this, that, these, those｜语法：**How many…? / There are…**
  题型流：排句问句 → 看图数数填空 → 跟读
- 🟣 **Sector Boss 1.3 — Laserbeak Scan**：混合（颜色/数字/复数/How many），奖励：🎖️ Optics Badge + 30⚡

#### 🥉🥈🥇 RANK-UP EXAM 1 — “Rumble's Scramble”（A1 大关卡 · 分级考核）
- 形式：限时 15 题，PET 雏形（Reading-match / Listening-pick / 1 句口语跟读）。
- 评级：Bronze 60% / Silver 80% / Gold 95%。达 Bronze 即"突破"。
- 突破奖励：军衔升 **Scout 侦察兵**；唤醒 🩺 **Ratchet**；解锁 Iacon Streets。
- 剧情：
> 🟣 **Rumble:** "You think you can read? Try my scramble!"
> （通过后）🤖 **汽车人探长:** "We did it, Cadet! Ratchet is waking up. On to Iacon!"

---

### ⭐ RANK 2 · SCOUT（A2 / KET · 伊阿空街区）— 节点脊柱

**Rank 剧情**：🩺Ratchet 苏醒，但街区仍断电；🎷Jazz 加入提供情报。

#### Sector 2.1 · Daily Drive（日常作息 · 时间）
- **2.1.1 My Day** — *Can talk about my daily routine.*｜get up, go to school, eat, sleep｜**present simple (I/you/we)**
- **2.1.2 What time?** — *Can ask and tell the time.*｜o'clock, half past, morning/afternoon/night｜prepositions of time (at/in)
- **2.1.3 Always & Sometimes** — *Can say how often I do things.*｜always, usually, sometimes, never｜**adverbs of frequency**
- **2.1.4 He gets up early** — *Can describe others' routines.*｜works, plays, watches｜**3rd person -s**（螺旋：he/she from R1）
- 🐆 **Boss 2.1 — Insecticon Swarm**

#### Sector 2.2 · Energon Market（食物 · 购物）— 【已写样章·完整范例见 §5】
- **2.2.1 At the Market** — food vocab｜countable/uncountable
- **2.2.2 Some & Any** — *Can talk about quantities.*｜some/any
- **2.2.3 How much / How many** — *Can ask prices & amounts.*｜How much/many, 货币
- **2.2.4 Can I have…?** — *Can order food politely.*｜Can I have…?, please/thanks
- 🐆 **Boss 2.2 — The Hungry Insecticon**（唤醒进度：补全 Ratchet 能量）

#### Sector 2.3 · Sector Map（城镇地点 · 方位）
- **2.3.1 Places in Town** — park, shop, school, hospital, station｜there is/are
- **2.3.2 Where is it?** — *Can say where things are.*｜in/on/under/next to/between｜prepositions of place
- **2.3.3 Go straight!** — *Can give simple directions.*｜turn left/right, go straight｜**imperatives**
- **2.3.4 Is there a…?** — *Can ask about places.*｜Is there…? Yes there is.
- 🐆 **Boss 2.3 — Ravage Recon**

#### Sector 2.4 · Free-Time Frequencies（爱好 · 现在进行时）
- **2.4.1 My Hobbies** — play football, read, draw, swim｜like + -ing
- **2.4.2 Right Now** — *Can say what is happening now.*｜**present continuous** (am/is/are + -ing)
- **2.4.3 Now vs Usually** — *Can contrast now and routine.*｜present simple vs continuous（螺旋：2.1）
- **2.4.4 Let's play!** — *Can make and respond to suggestions.*｜Let's…, Why don't we…?
- 🐆 **Boss 2.4 — Soundwave Signal**

#### 🥉🥈🥇 RANK-UP EXAM 2 — “Ravage's Hunt”（KET A2 大关卡）
- 形式：KET 题型迷你卷 = Reading&Writing（看图选词/选句/完形）+ Listening（选图/选答）+ 1 项 Speaking 角色扮演。
- 突破：军衔升 **Warrior 战士**；唤醒 🔫**Ironhide** + 🏍️**Arcee**；解锁 Earth Frontier。

---

### ⭐ RANK 3 · WARRIOR（A2+→B1 桥接 · 地球前线）— 节点脊柱

**Rank 剧情**：汽车人随方舟坠落地球，🔫Ironhide/🏍️Arcee 带队适应新世界（引入更长叙事文本）。

#### Sector 3.1 · Battle Logs（过去的冒险）
- **3.1.1 Yesterday** — *Can talk about the past.*｜**past simple regular** (-ed)｜yesterday, last…
- **3.1.2 Irregular Heroes** — *Can use common irregular verbs.*｜went, saw, had, did, made, took
- **3.1.3 While we fought** — *Can describe past actions in progress.*｜**past continuous** (was/were + -ing)
- **3.1.4 First, then, finally** — *Can sequence a story.*｜time linkers; 螺旋：地点/食物词入叙事
- ✈️ **Boss 3.1 — Skywarp Ambush**

#### Sector 3.2 · Storm Sector（天气 · 旅行交通）
- **3.2.1 Weather Report** — sunny, rainy, windy, cloudy, snowy｜It is + weather
- **3.2.2 Seasons & Plans** — *Can predict weather.*｜**will** for predictions
- **3.2.3 Travel & Transport** — by bus/train/plane, ticket, trip｜how do you go…?
- **3.2.4 Faster, Stronger** — *Can compare two things.*｜**comparatives** (-er / more)
- ✈️ **Boss 3.2 — Thundercracker Storm**

#### Sector 3.3 · Compare & Conquer（比较 · 观点）
- **3.3.1 The Best Autobot** — *Can compare many things.*｜**superlatives** (-est / most)
- **3.3.2 Too & Enough** — *Can express degree.*｜too + adj / adj + enough
- **3.3.3 I think that…** — *Can give and ask opinions.*｜I think/agree/disagree, because
- **3.3.4 Describe a Hero** — *Can describe a character in detail.*｜adjective order, personality words
- ✈️ **Boss 3.3 — Starscream Feint**

#### Sector 3.4 · Signal Stories（阅读叙事 · 连接词）
- **3.4.1 Story Decode** — *Can understand a short narrative.*｜阅读理解（who/what/why）
- **3.4.2 Because & So** — *Can show cause and effect.*｜because, so
- **3.4.3 But & Although** — *Can show contrast.*｜but, although
- **3.4.4 What happens next?** — *Can predict & infer.*｜inference questions（PET Reading 雏形）
- ✈️ **Boss 3.4 — Decepticon Cipher**

#### 🥉🥈🥇 RANK-UP EXAM 3 — “Starscream's Trial”（B1-approach 大关卡）
- 形式：past/future/比较 综合；首次出现**短答写作**(写 2–3 句小故事)与**听力细节题**。
- 突破：军衔升 **Commander 指挥官**；唤醒 🔬Wheeljack；解锁 Ark Command。

---

### ⭐ RANK 4 · COMMANDER（B1 / PET · 方舟指挥部）— 节点脊柱（冲刺 PET）

**Rank 剧情**：指挥级权限开放，🔵Ultra Magnus/💜Elita-1 训练正式英语与高阶读写，直指通讯矩阵核心。

#### Sector 4.1 · Mission Memory（现在完成时）
- **4.1.1 Have you ever…?** — *Can talk about life experiences.*｜**present perfect** + ever/never
- **4.1.2 Just, Already, Yet** — *Can talk about recent actions.*｜just/already/yet
- **4.1.3 For & Since** — *Can say how long.*｜for/since + present perfect
- **4.1.4 Perfect vs Past** — *Can choose the right past form.*｜present perfect vs past simple（螺旋：R3）
- 📡 **Boss 4.1 — Rumble Returns (Elite)**

#### Sector 4.2 · Future Protocols（计划 · 条件句）
- **4.2.1 Plans & Intentions** — *Can talk about plans.*｜**be going to** vs will
- **4.2.2 If it rains…** — *Can talk about real conditions.*｜**first conditional**
- **4.2.3 Facts & Truths** — *Can state general truths.*｜**zero conditional**
- **4.2.4 Might & Should** — *Can express possibility & advice.*｜might / should
- 📡 **Boss 4.2 — Shockwave Logic**

#### Sector 4.3 · Voice of Command（被动 · 关系从句 · 转述）
- **4.3.1 It was built** — *Can use the passive.*｜**passive** (present/past simple)
- **4.3.2 The Autobot who…** — *Can add information with clauses.*｜**relative clauses** (who/which/that)
- **4.3.3 He said that…** — *Can report what others say.*｜basic reported speech
- **4.3.4 Polite Command** — *Can speak/write formally.*｜formal vs informal register
- 📡 **Boss 4.3 — Soundwave Intercept**

#### Sector 4.4 · The Writer's Forge（PET 写作 · 口语）
- **4.4.1 Write an Email** — *Can write a short informal email (PET W Part).*｜opening/closing, 35+ words
- **4.4.2 Tell a Story** — *Can write a short story from a prompt.*｜past tenses + linkers, 100 words
- **4.4.3 Sentence Transformer** — *Can rephrase keeping meaning (PET R&W).*｜句型转换
- **4.4.4 Speak Up** — *Can do a PET-style picture description & discussion.*｜口语长输出 + 角色扮演
- 📡 **Boss 4.4 — Soundwave's Cipher (Final Lieutenant)**

#### 🥉🥈🥇 RANK-UP EXAM 4 — “Soundwave's Cipher”（**完整 PET 模考 大关卡**）
- 形式：四卷迷你模考 = Reading & Writing / Listening / Speaking，按 PET 计分换算评级。
- 突破：军衔升 **Prime 候选**；解锁核心决战。

---

### ★ FINAL BOSS — “Megatron's Last Stand”（综合 PET 决战）
- 形式：跨 Rank 全技能综合 Boss 战（Megatron HP 巨大，分三阶段：Reading→Listening→Speaking/Writing）。
- 通关：通讯矩阵修复，全体汽车人重启，赛博坦点亮；玩家获 **Prime 认证徽章**。
- 剧情收束：
> 👾 **Megatron:** "Impossible! A cadet… reading like a Prime?!"
> 🚛 **Optimus:** "Knowledge is the greatest power, Megatron. And this cadet has earned it. Autobots — we are home."

---

## 5. 范例节点（完整生产规格 · 供编码直接落地）

**SECTOR 2.2 · The Energon Market — Node 2.2.3 “How much / How many”**
- **CEFR / 年级带**：A2 (KET) / ~P3
- **PET 技能**：Listening + Speaking + Reading｜**MOE strand**：Grammar, Vocabulary, Listening, Speaking
- **Can-do**：*Can ask and answer about prices and quantities of food.*
- **目标词汇**：apple(s), banana(s), bread, milk, egg(s), water, rice, juice, dollar, much, many
- **目标语法**：可数/不可数；**How many + 复数？/ How much + 不可数？**
- **螺旋回炉**：Sector 1.3 数字 + R1 颜色 → "How many **red** apples?"

**剧情开场（配 TTS，大字短行）：**
> 🤖 **汽车人探长:** "Cadet! The market data is scrambled. Help Ratchet count the supplies!"
> 🩺 **Ratchet (微弱):** "How many… eggs… do we have…?"

**关卡流程（6 微回合 · 3–4 分钟）：**
1. 🔊 **Listen & Tap**：听 "How many apples?" → 点正确数量图（听力）
2. 🖼️ **Sort**：把 apple/egg/banana 归"可数"，milk/rice/water 归"不可数"（语法概念）
3. 🧩 **Fill**：`How ___ milk?`→ much；`How ___ eggs?`→ many（语法）
4. 🔢 **Build Question**：词块排 "How many bananas do you want?"（语序）
5. 🗣️ **Speak**：跟读 "I want three apples, please."（口语 STT 评分）
6. 📖 **Mini-Dialogue**：4 行购物对话 + 1 理解题 "How much is the bread?"（阅读）

**奖励**：+40⚡｜补全 🩺 Ratchet 能量条｜点亮市场灯
**Boss 钩子**：本节 How much/many 进入 Boss 2.2「The Hungry Insecticon」混合复习

---

## 6. 专项练习中心（Training Bay · 多邻国式加练）

主线之外的**独立入口**（与星图地图并列的 Tab），随时可练、按弱项自适应。
所有题目**复用主线内容池**，按技能/主题筛选，不重复造内容。

| 专项 | 主题包装 | 练什么 | 对标多邻国 |
|---|---|---|---|
| **错题修复站** | 🔧 Repair Bay | **连续错 3 次自动入册的错题** + 间隔重复(SRS)复练易错词 | Personalized Practice / Mistakes |
| **听力专项** | 📡 Audio Array | 辨音、听写、听选，纯听力 | Listening practice |
| **口语专项** | 🎙️ Voice Comm | 跟读、最小对立对、句子复述（STT 评分） | Speaking practice |
| **词汇专项** | ⚡ Energon Word Bank | PET 词表闪卡 / 配对，按主题刷 | Word practice |
| **语法专项** | ⚙️ Grammar Forge | 单点语法集中刷（时态/条件句/被动…） | Grammar lessons |
| **阅读故事** | 📖 Story Decode | 短篇互动故事 + 理解题 | Duolingo Stories |
| **PET 题型专项** | 🎯 Exam Sim | 开放完形 / 句型转换 / 读写专项 | （PET 应试，多邻国没有） |
| **限时挑战** | ⏱️ Speed Run | 限时配对冲刺，练反应、巩固高频词 | Match Madness |

**机制**
- **错题本自动收集（核心规则）**：每道题/词记一个**连续答错计数 `wrongStreak`**——答错 +1，**答对清零**。
  - `wrongStreak` 达到 **3**（连续错 3 次）→ **自动收进错题本**，标记为「顽固故障 🔴」重点项。
  - 设计意图：错 1–2 次多为手滑，不打扰；连续 3 次=真不会，才正式立案，避免错题本噪声过多。
  - **毕业条件**：在错题修复站把该项**连续答对 2 次** → 标记「已修复 ✅」移出错题本（仍留在 SRS 低频回顾）。
  - 主题包装：连续错 3 次的题=「严重受损机器人」自动送进 Repair Bay 维修。
- **自适应**：错题修复站优先推送错题本里的顽固项，其次是最近/高频错误与"将遗忘"的词（弱项优先）。
- **每日任务 Daily Quests**：每天 3 个小目标（如"做 1 次听力专项""修复 5 个错词""连对 10 题"），完成得额外 Energon，呼应现有每日目标条。
- **加练不卡进度**：专项是"补强"，不解锁主线；但专项表现**反哺主线掌握度**与定级。
- **护眼**：单次专项默认 ≤ 10 题（约 3 分钟），与主线一致的大字/居中/TTS 规范。

**与主线的关系**：主线 = 剧情推进、解锁角色与区域（"学新东西"）；专项 = 多邻国式"刷熟 + 补弱 + 应试"（"练扎实"）。两者共用同一内容与掌握度数据。

---

## 7. 与现有 App 的衔接（实现提示，留待你下令再编码）

- 现 `src/data/curriculum.ts` 的 7 题型已可覆盖 Rank 1–2；Rank 3–4 需新增题型组件（cloze / reading-MCQ / transformation / writing / picture-talk）。
- 本脊柱可直接转成 `curriculum.ts` 的 `Unit→Lesson→Exercise` 数据；Rank=大单元，Sector=单元，Node=Lesson，小Boss/大关卡=特殊 Lesson 类型。
- 军衔/晋级 → 扩展 `useGameStore`（rank 字段 + 大关卡评级 + placement 起点）。
- **专项练习** → 新增并列 Tab（地图 / 专项 / 收藏）；`useGameStore` 记录每题 `mistakes[]` 与词汇掌握度(SRS：last seen / strength)，专项从中筛题。
- **错题本** → 每个练习项存 `{ id, wrongStreak, collected, fixedStreak }`：答错 `wrongStreak++`、答对清零；`wrongStreak>=3` 置 `collected=true` 入册；在 Repair Bay `fixedStreak>=2` 置 `collected=false` 毕业。
- **定级扫描** → 一个特殊的 10 题 Lesson，结果写入 `rank` 起点。
- **每日任务** → 在现有 `dailyGoal` 基础上加 `quests[]`（每日刷新）。
- 角色立绘走 `public/robots/<id>.png` 插槽（布鲁可素材）。

---

## 8. 真实奖励：布鲁可变形金刚盲盒（端盒制 / 可多套）

**核心理念**：一段完整旅程 = 集齐**一整套端盒**；只要愿意多学 → 解锁**更多套**。开放、可持续。

**端盒映射（推荐）**
- 一个学习阶段（≈一套 KET/PET 课程）对应布鲁可**一个端盒（整套）**。
- 阶段内每通过 1 个**大关卡**（晋级，🥈银牌+）→ **开 1 个盲盒**（端盒里的一款）。
- 阶段**终极决战**通关 → **隐藏款 / 旗舰款**（端盒压轴）。
- 全部开完 = 完成整个阶段 → **整端盒到手**。

**两阶段计划（对应两套端盒）**

| 阶段 | 学习内容 | 真实奖励 | 时间目标 |
|---|---|---|---|
| 端盒①「KET 之路」| 热身营 + Rank 2（A2/KET） | 每晋级开 1 盒；**KET 模考(Rank-Up Exam 2)金牌 = 隐藏款** | **2026 年 8–9 月前拿下 KET（理想）** |
| 端盒②「PET 远征」| Rank 3–4（B1/PET）+ 终极决战 | 每晋级开 1 盒；**击败威震天 = 旗舰隐藏款** | KET 后接力冲 PET |
| 端盒③+ … | 全金牌 / 专项全清 / 新系列内容 | 愿意多学 → 解锁**新一套端盒** | 开放 |

**冲刺节奏（8–9 月拿 KET · 从 2026-06 起约 10–14 周）**
- KET-ready = 通过 **Rank-Up Exam 2（KET A2 模考）银牌+**；起点先做**定级扫描**确认真实水平。
- 建议每天 **15–20 分钟**：1–2 个主线 Node + 1 次专项/错题修复。
- 周计划参考：W1 定级 + 热身查漏 → W2–5 攻 Rank 2 全部 16 节点 + 4 小Boss → W6–9 KET 题型专项 + 错题清册 + 全真模考刷到银/金 → W10+ 缓冲 & Rank 3 词汇预热。
- **可行性**：孩子已在 P3–P4，多数应落在 A1+/A2，目标进取但**只要每天坚持即可达成**；定级结果会进一步校准。

**护栏与可配置**
- **质量门槛**：盲盒需对应大关卡达 **🥈银牌(≥80%)** 才兑现；擦边过关只"突破晋级"、不开盒，防止为奖励糊弄。
- **家长设置**：端盒款数与触发门槛可调，匹配实际购买的布鲁可套系（端盒款数各异，常见 6/8/12 款）。
- **款数对齐**：若端盒款数 > 大关卡数，用「某 Rank 的 4 个小Boss 全金 = 加开 1 盒」补足；若 < 则合并触发。
- **虚实呼应**：游戏内晋级会唤醒一名汽车人，现实**同步开一个盲盒**——双重收集，动机翻倍。

**实现挂钩**：`useGameStore` 加 `realRewards`（端盒定义 + 每盒 claimed 状态 + 银牌判定）；家长页展示"待开/已开/进度"，孩子达标时弹"开盒"庆祝动画（复用收藏馆动效）。

---

*v1 — 待你确认 Rank 1 全文质量与整体脊柱后，可继续：①把 Rank 2–4 也写成全文对白；②直接落数据到 curriculum.ts；③补全大关卡测评题库。*
