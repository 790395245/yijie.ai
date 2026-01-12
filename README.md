# 周易AI - 古老智慧与现代科技的结合

一个基于AI的周易占卜与解读工具，融合了传统中国玄学与现代人工智能技术，为用户提供专业的命理分析和解读服务。

## DEMO
[DEMO (https://yijie.ruogg.cn)](https://yijie.ruogg.cn)
![1768183070383.png](https://lsky.rz15.cn/i/2026/01/12/6964552123ed7.png)

## ✨ 功能特性

### 四大核心模块

1. **六爻占卜** 🎲
   - 随机起卦：使用随机算法模拟传统摇卦过程
   - 时间起卦：根据当前时间进行起卦
   - 本卦与变卦分析
   - AI智能解读卦象含义

2. **奇门遁甲** 🧭
   - 时间起局：根据时间自动排盘
   - 九宫格局展示
   - 天干地支、八门、九星、八神完整信息
   - AI分析格局吉凶

3. **大六壬** 📊
   - 时间起课：自动生成课式
   - 四课三传详细展示
   - 天将配置
   - AI解读课式含义

4. **紫微斗数** ⭐
   - 时间排盘：生成完整命盘
   - 十二宫位展示
   - 主星配置
   - AI分析命理特征

### AI解读功能

- **Markdown渲染**：AI回复支持完整的Markdown语法，包括标题、列表、粗体、斜体等格式
- **连续对话**：支持与AI进行多轮对话，可以针对解读结果继续提问
- **自定义问题**：在获取解读前可以输入自己的问题，AI会针对性地回答
- **流式输出**：实时显示AI生成的内容，提供更好的用户体验

## 🛠️ 技术栈

- **前端框架**：React 18 + TypeScript
- **构建工具**：Vite
- **UI框架**：Tailwind CSS
- **动画库**：Framer Motion
- **路由**：React Router DOM
- **状态管理**：Zustand
- **Markdown渲染**：react-markdown + remark-gfm
- **AI集成**：支持OpenAI兼容API和Claude API

## 📦 安装和运行

### 环境要求

- Node.js >= 16
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 配置环境变量

在项目根目录创建 `.env` 文件：

```env
# 默认API配置（可选）
VITE_DEFAULT_API_KEY=your_api_key_here
VITE_DEFAULT_API_URL=https://api.example.com/v1
VITE_DEFAULT_API_TYPE=openai
```

**注意**：如果不配置环境变量，用户需要在应用的设置面板中手动输入API配置。

### 运行开发服务器

```bash
npm run dev
```

应用将在 `http://localhost:5173` 启动。

### 构建生产版本

```bash
npm run build
```

**构建过程：**
1. TypeScript 编译检查（tsc）
2. Vite 打包优化
3. 生成生产环境代码

**输出目录：** `dist/`

构建完成后，`dist` 目录包含：
- `index.html` - 入口HTML文件
- `assets/` - 优化后的JS、CSS和静态资源
- 其他静态文件

**部署：**
将 `dist` 目录的内容部署到任何静态文件服务器即可，如：
- Nginx
- Apache
- Vercel
- Netlify
- GitHub Pages

### 预览生产版本

```bash
npm run preview
```

在本地预览构建后的生产版本，默认运行在 `http://localhost:4173`

## 📖 使用说明

### 1. 配置AI服务

首次使用需要配置AI服务：

1. 点击页面右上角的设置按钮
2. 选择API类型（OpenAI或Claude）
3. 输入API URL（OpenAI兼容接口）
4. 输入API密钥
5. 点击保存

**推荐配置**：
- 模型：Qwen/Qwen3-8B（免费）
- URL：https://api.siliconflow.cn/v1
- API Key：需要自行注册获取

### 2. 选择占卜模块

在主页选择四个模块之一：
- 六爻
- 奇门遁甲
- 大六壬
- 紫微斗数

### 3. 起卦/排盘

根据选择的模块，点击相应的按钮：
- 六爻：随机起卦或时间起卦
- 奇门遁甲：时间起局
- 大六壬：时间起课
- 紫微斗数：时间排盘

### 4. 获取AI解读

1. （可选）在输入框中输入您的问题
2. 点击"🔮 获取解读"按钮
3. 等待AI生成解读结果

### 5. 连续对话

在获得初次解读后：
1. 在输入框中输入追问的问题
2. 点击"💬 发送"按钮
3. AI会基于之前的对话历史继续回答

## 🎨 界面特色

- **神秘深色主题**：营造神秘玄学氛围
- **流畅动画效果**：使用Framer Motion实现丝滑的过渡动画
- **响应式设计**：适配各种屏幕尺寸
- **开场动画**：精美的全屏开场动画
- **卡片式布局**：清晰的信息层次

## 📁 项目结构

```
zhouyi.ai/
├── src/
│   ├── components/          # 公共组件
│   │   ├── OpeningAnimation.tsx
│   │   └── SettingsPanel.tsx
│   ├── features/            # 功能模块
│   │   ├── liuyao/         # 六爻模块
│   │   ├── qimen/          # 奇门遁甲模块
│   │   ├── daliuren/       # 大六壬模块
│   │   └── ziwei/          # 紫微斗数模块
│   ├── lib/                # 工具库
│   │   └── ai/             # AI服务
│   ├── App.tsx             # 主应用组件
│   └── main.tsx            # 应用入口
├── public/                 # 静态资源
├── .env                    # 环境变量（需自行创建）
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

## 🔒 隐私和安全

- API密钥仅存储在浏览器本地，不会上传到服务器
- 所有占卜数据仅在本地处理
- AI解读通过您配置的API服务进行，请确保使用可信的API提供商

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

### 开发流程

1. Fork本仓库
2. 创建特性分支：`git checkout -b feature/your-feature`
3. 提交更改：`git commit -m 'Add some feature'`
4. 推送到分支：`git push origin feature/your-feature`
5. 提交Pull Request

## 📄 许可证

MIT License

## 🙏 致谢

感谢所有为中国传统文化传承做出贡献的人们。

---

**免责声明**：本应用仅供娱乐和文化学习使用，不构成任何专业建议。请理性对待占卜结果。
