// 题库自检:跑 validateCurriculum() + 基本统计。CI/本地都可 `npm run validate`。
import { validateCurriculum, allItems, CURRICULUM, lessonOrder } from '../src/data/curriculum'
import { totalWords } from '../src/data/wordbank'

const errs = validateCurriculum()
if (errs.length) {
  console.error(`❌ 题库校验失败 (${errs.length}):\n` + errs.map((e) => '  - ' + e).join('\n'))
  process.exit(1)
}

const units = CURRICULUM.length
const lessons = lessonOrder.length
const items = allItems().length
console.log(`✅ 题库校验通过`)
console.log(`   扇区 ${units} · 关卡 ${lessons} · 练习 ${items} · 词库 ${totalWords} 词`)
