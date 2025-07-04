# Pixel - 像素艺术交互体验

一个基于 Next.js 15 和 React 19 构建的现代化像素艺术交互体验项目，融合了游戏化元素、终端模拟器和图片展示功能。

## ✨ 功能特性

### 🎮 主页面 - 像素弹球游戏
- **像素艺术文字**: 使用像素点阵显示 "MAGICYAN IS ALL YOU NEED"
- **弹球物理**: 真实的弹球物理效果，包含碰撞检测和反弹
- **交互式游戏**: 鼠标控制挡板，保护像素文字不被球击中
- **动态缩放**: 响应式设计，适配不同屏幕尺寸

### 💻 终端模拟器
- **命令行界面**: 完整的终端体验，支持多种命令
- **3D 机器人**: 集成 Spline 3D 模型展示
- **特殊效果**: 
  - `matrix` 命令：Matrix 数字雨效果
  - `ipcard` 命令：显示 IP 签名档
- **命令历史**: 完整的命令执行历史记录

### 🖼️ 图片展示器
- **无限滚动**: 基于 Canvas 的流畅图片滚动体验
- **Pixabay 集成**: 实时获取高质量艺术图片
- **图片预览**: 点击图片查看大图预览
- **触摸支持**: 完整的移动端触摸交互
- **性能优化**: 图片懒加载和缓存机制

### 🎨 其他功能
- **黑洞按钮**: 独特的交互式按钮组件
- **手部加载动画**: Lottie 动画效果
- **响应式设计**: 完美适配桌面和移动设备

## 🛠️ 技术栈

- **框架**: Next.js 15 (App Router)
- **前端**: React 19, TypeScript
- **样式**: Tailwind CSS 4
- **动画**: GSAP, Framer Motion
- **3D 渲染**: Spline Tool
- **动画文件**: Lottie Files
- **图标**: Lucide React
- **工具**: clsx, tailwind-merge

## 🚀 快速开始

### 环境要求
- Node.js 18+ 
- npm 或 yarn

### 安装依赖
```bash
npm install
# 或
yarn install
```

### 开发模式
```bash
npm run dev
# 或
yarn dev
```

项目将在 `http://localhost:9527` 启动

### 构建生产版本
```bash
npm run build
npm start
```

## 📁 项目结构

```
pixel/
├── app/                    # Next.js App Router 页面
│   ├── home/              # 主页面 - 像素弹球游戏
│   ├── terminal/          # 终端模拟器页面
│   ├── photo/             # 图片展示器页面
│   └── discussions/       # 讨论页面
├── components/            # React 组件
│   ├── BlackHoleButton.tsx
│   ├── HandLoading.tsx
│   ├── Terminal.tsx
│   └── Robot/            # 3D 机器人组件
├── lib/                   # 工具库
│   ├── commands.ts       # 终端命令实现
│   ├── types.ts          # TypeScript 类型定义
│   └── utils.ts          # 工具函数
└── public/               # 静态资源
```

## 🎯 核心功能详解

### 像素弹球游戏
- 使用 Canvas API 实现高性能渲染
- 像素点阵文字系统，支持自定义字符映射
- 物理引擎实现真实的弹球运动
- 响应式设计，自动适配屏幕尺寸

### 终端模拟器
- 完整的命令行界面模拟
- 支持多种内置命令
- 3D 机器人展示（Spline 集成）
- 特殊视觉效果（Matrix 数字雨）

### 图片展示器
- Canvas 2D 渲染引擎
- 无限滚动图片网格
- Pixabay API 集成
- 触摸手势支持
- 图片预览功能

## 🔧 开发说明

### 添加新命令
在 `lib/commands.ts` 中添加新的命令处理逻辑：

```typescript
export function executeCommand(command: string): string {
  const cmd = command.trim().toLowerCase();
  
  switch (cmd) {
    case 'your-command':
      return 'Your command response';
    // ... 其他命令
  }
}
```

### 自定义像素文字
在 `app/home/page.tsx` 中的 `PIXEL_MAP` 对象中定义新的字符：

```typescript
const PIXEL_MAP = {
  // ... 现有字符
  'Y': [
    [1, 0, 0, 0, 1],
    [0, 1, 0, 1, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
  ],
};
```

## 📱 浏览器支持

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [Pixabay](https://pixabay.com/) - 提供高质量图片 API
- [Spline](https://spline.design/) - 3D 设计工具
- [Lottie Files](https://lottiefiles.com/) - 动画资源
- [GSAP](https://greensock.com/gsap/) - 高性能动画库

---

**Made with ❤️ by MagicYan418**
