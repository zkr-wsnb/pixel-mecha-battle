# 像素机甲对战 - 美术资源

本目录包含游戏所有像素美术资源 (PNG 格式)。

## 目录结构

```
assets/
├── mecha_red/          # 红色机甲 P1 (6种姿态)
│   ├── idle.png        # 待机
│   ├── walk1.png       # 走路帧1
│   ├── walk2.png       # 走路帧2
│   ├── attack.png      # 攻击
│   ├── jump.png        # 跳跃
│   ├── roll.png        # 翻滚
│   ├── idle_flip.png   # 朝左版本
│   ├── attack_flip.png
│   └── walk1_flip.png
├── mecha_blue/         # 蓝色机甲 P2 (6种姿态)
│   └── ...
├── scene/              # 场景元素
│   ├── moon.png        # 月亮
│   ├── star.png        # 星星
│   ├── beam_red.png    # 能量弹
│   └── pillar.png      # 装饰柱
└── sprite_sheet.png    # 总览预览图 (所有姿态拼一张)
```

## 规格

- 原始尺寸: 16x18 像素 (机甲)
- 导出尺寸: 96x108 像素 (放大6倍)
- 格式: PNG, RGBA, 8位
- 调色板: 16色

## 在游戏中使用

游戏当前使用程序化绘制 (Canvas), 性能更好且无需网络。
这些 PNG 文件作为美术资源提供, 可用于:
- 查看实际效果
- 在图像编辑器中修改
- 导入到其他游戏引擎 (Unity/Godot 等)
- 作为参考重新绘制

重新生成: `node generate-assets.js`
