# 机器人素材插槽 · Robot Asset Slots

把官方/正版图片（如**布鲁可 BlooKo** 积木产品图、授权变形金刚美术）放进这个文件夹即可自动生效，**无需改代码**。

## 命名规范

文件名 = 机器人 `id` + `.png`（也支持透明背景 PNG，效果最好）：

| 文件名 | 机器人 | 角色 |
|---|---|---|
| `tr3.png` | 汽车人探长 | 训练伙伴 |
| `bumblebee.png` | Bumblebee 大黄蜂 | Unit 1 奖励 |
| `optimus.png` | Optimus Prime 擎天柱 | Unit 2 奖励 |
| `ratchet.png` | Ratchet 救护车 | Unit 3 奖励 |
| `grimlock.png` | Grimlock 钢锁 | Boss 战奖励 |
| `megatron.png` | Megatron 威震天 | 狂派 Boss |

## 工作原理

- 放了图 → `RobotAvatar` 自动用图片渲染。
- 没放图 → 自动回退到 emoji 占位，App 照常运行。
- 建议正方形、透明背景、≥ 256×256，便于在 iPad 上清晰显示。

## 版权说明

本项目为**本地自用原型**，便于后续向布鲁可创始人演示并商谈正版授权合作。
请仅使用你有权使用的图片；公开发布前需取得相应授权。
