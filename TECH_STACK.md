# 周易AI应用 - 技术架构方案

## 项目概述
一个基于AI的周易科普、推理工具，提供酷炫的交互式占卜体验。

## 核心技术栈

### 前端框架
**选择：React 18 + TypeScript + Vite**

理由：
- React生态成熟，组件化开发效率高
- TypeScript提供类型安全，提升代码质量
- Vite构建速度快，开发体验好
- 易于打包为PWA或使用Tauri打包为桌面应用

### UI框架
**选择：Tailwind CSS + shadcn/ui**

理由：
- Tailwind CSS灵活度高，适合打造独特的视觉效果
- shadcn/ui提供高质量的可定制组件
- 支持暗黑模式，适合神秘主题
- 性能优秀

### 动画库
**选择：Framer Motion + Three.js**

理由：
- Framer Motion：声明式动画，易于实现复杂交互
- Three.js：3D效果，可实现卦象的立体展示
- 两者结合可打造极致的视觉体验

### AI集成
**选择：Claude API (Anthropic)**

理由：
- Claude在中文理解和文化内容方面表现优秀
- 适合解读周易这类传统文化内容
- API稳定，支持流式输出
- 可以训练专门的周易解读prompt

### 状态管理
**选择：Zustand + React Query**

理由：
- Zustand：轻量级，API简洁，适合中小型应用
- React Query：处理异步数据和缓存，适合AI API调用
- 两者配合可以高效管理应用状态

### 国际化
**选择：react-i18next**

理由：
- React生态最成熟的国际化方案
- 支持动态语言切换
- 支持命名空间，便于管理大量翻译内容
- 适合中英文双语支持

### 路由
**选择：React Router v6**

理由：
- React官方推荐的路由方案
- API简洁，支持嵌套路由
- 支持代码分割和懒加载
- 适合单页应用

### 打包方案
**选择：PWA + Tauri（可选）**

理由：
- PWA：轻量级，可安装到桌面，离线支持
- Tauri：Rust编写，体积小，性能好，可打包为原生应用
- 两种方案可以并存，满足不同用户需求

## 项目结构

```
zhouyi.ai/
├── src/
│   ├── components/        # 通用组件
│   ├── features/          # 功能模块
│   │   ├── liuyao/       # 六爻模块
│   │   ├── daliu/        # 大六壬（后期）
│   │   └── qimen/        # 奇门遁甲（后期）
│   ├── lib/              # 工具函数
│   ├── hooks/            # 自定义hooks
│   ├── store/            # 状态管理
│   ├── i18n/             # 国际化配置
│   └── App.tsx           # 应用入口
├── public/               # 静态资源
└── package.json
```

## 六爻算法实现方案

### 核心功能
1. **起卦方式**
   - 时间起卦（年月日时）
   - 手动起卦（用户输入卦象）
   - 随机起卦（模拟摇钱币）

2. **卦象计算**
   - 本卦、变卦、互卦计算
   - 六亲、六神、世应装配
   - 五行生克关系判断

3. **AI解读**
   - 基于卦象信息生成prompt
   - 调用Claude API进行解读
   - 流式输出解读结果

## 核心依赖包

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "zustand": "^4.4.0",
    "@tanstack/react-query": "^5.0.0",
    "react-i18next": "^13.5.0",
    "framer-motion": "^10.16.0",
    "three": "^0.160.0",
    "@react-three/fiber": "^8.15.0",
    "@anthropic-ai/sdk": "^0.9.0"
  }
}
```

## 实施步骤

### 第一阶段：基础搭建
1. 使用Vite创建React + TypeScript项目
2. 配置Tailwind CSS和shadcn/ui
3. 配置路由和国际化
4. 搭建基础页面结构

### 第二阶段：六爻功能实现
1. 实现六爻算法核心逻辑
2. 创建起卦交互界面
3. 实现卦象展示组件
4. 集成AI解读功能

### 第三阶段：动画和体验优化
1. 使用Framer Motion实现页面过渡动画
2. 使用Three.js实现3D卦象展示
3. 优化交互体验和视觉效果

### 第四阶段：打包和部署
1. 配置PWA支持
2. 优化性能和SEO
3. 部署到生产环境

