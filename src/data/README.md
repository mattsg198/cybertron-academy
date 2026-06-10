# 题库结构与扩展指南 · Question Bank

题库**内容与引擎分离**：加题只改数据文件，不碰组件。

## 文件结构

```
src/data/
├─ sectors/          ← 内容，一个扇区一个文件（小而专注）
│   ├─ dailyDrive.ts     (u1 日常作息)
│   ├─ energonMarket.ts  (u2 食物购物)
│   ├─ sectorMap.ts      (u3 地点问路)
│   ├─ freeTime.ts       (u4 爱好进行时)
│   └─ ketMock.ts        (u5 KET 模考 · kind:'exam')
├─ curriculum.ts     ← 索引：组合扇区 + 查询 + 题池 + 校验
├─ robots.ts         ← 可收集机器人
└─ README.md         ← 本文件
```

## 怎么加内容

- **加一道题**：在对应 `sectors/*.ts` 的 `exercises[]` 里追加一个对象。**往后追加、不要重排**（题目 id = `lessonId#index`，重排会打乱错题历史）。
- **加一课/一个扇区**：复制现有结构，给唯一 `id`，在 `curriculum.ts` 的 `CURRICULUM` 数组里登记新扇区。
- **题型**：见 `src/types.ts` 的 `Exercise` 联合类型（8 种）。

## 标签（供专项练习 / 错题本筛题）

每个 **Lesson** 可带 `topic` / `grammar` / `cefr`，其下的题自动继承。例：
```ts
{ id:'u1l2', topic:'routine', grammar:'present-simple', cefr:'A2', skills:['grammar'], ... }
```
用 `itemsBy({ grammar:'present-simple' })` 等即可取出对应题池。

## 校验

`curriculum.ts` 在 **dev 模式**自动跑 `validateCurriculum()`：检查 id 唯一、答案在选项内、spell 分段拼接等于单词、wordMatch 配对数等。
控制台会打印 `✓ N items valid` 或具体错误，**加题时若写错会立刻报出**。

## 题池 API（`curriculum.ts`）

- `allItems()` → 全部题（带 id 与标签）
- `itemsBy({ skill, topic, grammar, type })` → 按维度筛
- `itemKey(lessonId, index)` → 稳定 id
