// ============================================================
// 版权素材登记表(Asset Registry)
// 这里集中登记所有"需要正版授权(布鲁可 / 变形金刚 IP)"的占位素材。
// 替换方式:把正版文件按 `slot` 路径丢进 public/ 对应位置即可,无需改代码;
// 文件不存在时,UI 自动回退到 emoji 占位。
// 清单文档见项目根目录 ASSETS.md。
// ============================================================

/** 给 public 下的相对路径加上部署 base(GitHub Pages 子路径也能正确取到)。 */
export const assetUrl = (path: string) =>
  `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`

export type AssetKind = 'character' | 'boss' | 'brand'

export interface BrandedAsset {
  key: string
  slot: string // public 下的相对路径,丢正版文件到这里
  role: string // 用途
  placeholder: string // 当前占位(emoji 或自动生成图)
  size: string // 建议尺寸 / 格式
  kind: AssetKind
}

// —— 角色头像(汽车人 / 探长)——
export const CHARACTER_ASSETS: BrandedAsset[] = [
  { key: 'tr3', slot: 'robots/tr3.png', role: '汽车人探长(主向导 / 店主 / 反馈头像)', placeholder: '🕵️', size: '512×512 PNG 透明', kind: 'character' },
  { key: 'bumblebee', slot: 'robots/bumblebee.png', role: '伙伴:大黄蜂', placeholder: '🐝', size: '512×512 PNG 透明', kind: 'character' },
  { key: 'optimus', slot: 'robots/optimus.png', role: '伙伴:擎天柱', placeholder: '🚛', size: '512×512 PNG 透明', kind: 'character' },
  { key: 'ratchet', slot: 'robots/ratchet.png', role: '伙伴:救护车', placeholder: '🚑', size: '512×512 PNG 透明', kind: 'character' },
  { key: 'grimlock', slot: 'robots/grimlock.png', role: '伙伴:钢锁', placeholder: '🦖', size: '512×512 PNG 透明', kind: 'character' },
  { key: 'megatron', slot: 'robots/megatron.png', role: '最终 Boss / 收藏:威震天', placeholder: '👾', size: '512×512 PNG 透明', kind: 'character' },
]

// —— 扇区关底 Boss(狂派)——
export const BOSS_ASSETS: BrandedAsset[] = [
  { key: 'soundwave', slot: 'bosses/soundwave.png', role: 'Sector 1 Boss:声波', placeholder: '🎧', size: '512×512 PNG 透明', kind: 'boss' },
  { key: 'starscream', slot: 'bosses/starscream.png', role: 'Sector 2 Boss:红蜘蛛', placeholder: '✈️', size: '512×512 PNG 透明', kind: 'boss' },
  { key: 'shockwave', slot: 'bosses/shockwave.png', role: 'Sector 3 Boss:震荡波', placeholder: '👁️', size: '512×512 PNG 透明', kind: 'boss' },
  { key: 'skywarp', slot: 'bosses/skywarp.png', role: 'Sector 4 Boss:天猫', placeholder: '🌀', size: '512×512 PNG 透明', kind: 'boss' },
  { key: 'megatron', slot: 'bosses/megatron.png', role: 'KET 大关卡 Boss:威震天', placeholder: '👾', size: '512×512 PNG 透明', kind: 'boss' },
]

// —— 品牌 / 应用图标(可换成授权 LOGO)——
export const BRAND_ASSETS: BrandedAsset[] = [
  { key: 'logo', slot: 'brand/logo.png', role: '应用 LOGO(标题处,预留)', placeholder: '⚡赛博坦学院', size: '1024×256 PNG 透明', kind: 'brand' },
  { key: 'pwa-192', slot: 'pwa-192.png', role: 'PWA 图标 192', placeholder: '自动生成·能量闪电', size: '192×192 PNG', kind: 'brand' },
  { key: 'pwa-512', slot: 'pwa-512.png', role: 'PWA 图标 512', placeholder: '自动生成·能量闪电', size: '512×512 PNG', kind: 'brand' },
  { key: 'pwa-maskable', slot: 'pwa-maskable-512.png', role: 'PWA 可遮罩图标', placeholder: '自动生成·能量闪电', size: '512×512 PNG 安全区', kind: 'brand' },
  { key: 'apple-touch', slot: 'apple-touch-icon.png', role: 'iOS 主屏图标', placeholder: '自动生成·能量闪电', size: '180×180 PNG', kind: 'brand' },
]

// —— 排行榜 AI 学员(原创角色,无需授权;与机甲占位同一套风格)——
export const STUDENT_ASSETS: BrandedAsset[] = [
  { key: 'nova', slot: 'students/nova.png', role: '排行榜 AI 学员 Nova', placeholder: '🌟', size: '512×512 PNG 透明', kind: 'character' },
  { key: 'volt', slot: 'students/volt.png', role: '排行榜 AI 学员 Volt', placeholder: '⚡', size: '512×512 PNG 透明', kind: 'character' },
  { key: 'sparky', slot: 'students/sparky.png', role: '排行榜 AI 学员 Sparky', placeholder: '✨', size: '512×512 PNG 透明', kind: 'character' },
  { key: 'cog', slot: 'students/cog.png', role: '排行榜 AI 学员 Cog', placeholder: '⚙️', size: '512×512 PNG 透明', kind: 'character' },
  { key: 'rusty', slot: 'students/rusty.png', role: '排行榜 AI 学员 Rusty', placeholder: '🔩', size: '512×512 PNG 透明', kind: 'character' },
]

export const ALL_BRANDED_ASSETS = [...CHARACTER_ASSETS, ...BOSS_ASSETS, ...BRAND_ASSETS]

/** Boss 头像槽位路径(用于 BossInfo.image 兜底)。 */
export const bossSlot = (key: string) => `bosses/${key}.png`
