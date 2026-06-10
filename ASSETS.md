# 版权素材清单（用于布鲁可正版授权对接）

本应用为本地自用原型，所有**变形金刚 / 布鲁可 IP 相关素材目前均为占位**
（emoji 或自动生成的通用图形），**未使用任何受版权保护的图像**。
取得授权后，按下表把正版文件放进对应路径即可自动替换，**无需改动代码**
（文件不存在时 UI 自动回退到占位 emoji）。

登记表代码见 `src/data/assets.ts`，加载逻辑见 `src/components/AssetImage.tsx` 与 `RobotAvatar.tsx`。

## 一、角色头像（汽车人 / 探长）
放置路径：`public/robots/<key>.png`

| key | 角色 | 用途 | 占位 |
|---|---|---|---|
| tr3 | 汽车人探长 | 主向导 / 探长店店主 / 答题反馈头像 | 🕵️ |
| bumblebee | 大黄蜂 | 伙伴收藏 / 课文角色 | 🐝 |
| optimus | 擎天柱 | 伙伴收藏 / 课文角色 | 🚛 |
| ratchet | 救护车 | 伙伴收藏 | 🚑 |
| grimlock | 钢锁 | 伙伴收藏 | 🦖 |
| megatron | 威震天 | 最终 Boss / 收藏 | 👾 |

## 二、关底 Boss 立绘（狂派）
放置路径：`public/bosses/<key>.png`（出现在 Boss 战横幅、开战剧情页、地图 Boss 节点）

| key | 角色 | 关卡 | 占位 |
|---|---|---|---|
| soundwave | 声波 | Sector 1 | 🎧 |
| starscream | 红蜘蛛 | Sector 2 | ✈️ |
| shockwave | 震荡波 | Sector 3 | 👁️ |
| skywarp | 天猫 | Sector 4 | 🌀 |
| megatron | 威震天 | KET 大关卡 | 👾 |

## 三、品牌 / 应用图标
| 文件 | 用途 | 占位 |
|---|---|---|
| `public/brand/logo.png` | 应用 LOGO（预留） | ⚡文字 |
| `public/pwa-192.png` | PWA 图标 192 | 自动生成·能量闪电 |
| `public/pwa-512.png` | PWA 图标 512 | 自动生成·能量闪电 |
| `public/pwa-maskable-512.png` | PWA 可遮罩图标 | 自动生成·能量闪电 |
| `public/apple-touch-icon.png` | iOS 主屏图标 | 自动生成·能量闪电 |

## 规格建议
- 头像 / 立绘：**512×512 PNG，透明背景**，主体居中（圆形裁切也好看）。
- 文字 / 配音、关卡剧情等文案为原创，不涉及 IP 图像版权。
- 替换后无需重新编译逻辑；改图标后重新 `npm run build` 即可。

## 授权范围沟通要点（建议向布鲁可确认）
1. 角色形象（上述 11 个角色立绘 / 头像）在 App 内的使用授权。
2. “变形金刚 / Transformers”“赛博坦”等名称、LOGO 的使用。
3. 是否可用布鲁可**积木产品照**作为头像（产品实拍 vs 角色原画）。
4. 实体盲盒作为学习奖励的联名 / 渠道合作可能性。
