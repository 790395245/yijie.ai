# 部署指南

本文档说明如何在测试环境和生产环境之间进行开发、测试和部署。

## 环境说明

项目配置了两个独立的环境：

- **测试环境（Development）**：使用免费公益API，用于开发和测试
- **生产环境（Production）**：使用正式API配置，用于生产部署

## 环境配置文件

- `.env.development` - 测试环境配置（已配置免费API）
- `.env.production` - 生产环境配置（需要配置您的正式API）
- `.env.example` - 配置示例文件

**重要提示**：`.env.development` 和 `.env.production` 文件已被 git 忽略，不会被提交到代码仓库。

## 配置生产环境

首次使用前，需要配置生产环境的API信息：

1. 打开 `.env.production` 文件
2. 填写您的正式API配置：

```env
VITE_DEFAULT_API_URL=your_production_api_url
VITE_DEFAULT_API_KEY=your_production_api_key
VITE_DEFAULT_API_TYPE=openai
VITE_DEFAULT_MODEL=your_production_model
```

## 开发流程

### 1. 本地开发（测试环境）

```bash
# 启动开发服务器（自动使用测试环境配置）
npm run dev
```

开发服务器会自动使用 `.env.development` 中的配置。

### 2. 构建测试版本

```bash
# 构建测试环境版本
npm run build:dev
```

构建产物会输出到 `dist` 目录。

### 3. 预览测试版本

```bash
# 预览测试环境构建结果
npm run preview:dev
```

### 4. 测试验证

在测试环境中完成以下验证：
- [ ] 功能测试：所有功能正常工作
- [ ] UI测试：界面显示正常
- [ ] API测试：API调用正常
- [ ] 兼容性测试：不同浏览器和设备测试

## 生产部署流程

**重要**：只有在测试环境验证通过后，才能部署到生产环境。

### 1. 构建生产版本

```bash
# 构建生产环境版本
npm run build:prod
# 或者使用简写
npm run build
```

### 2. 预览生产版本（可选）

```bash
# 预览生产环境构建结果
npm run preview:prod
# 或者使用简写
npm run preview
```

### 3. 部署到生产服务器

将 `dist` 目录中的文件部署到您的生产服务器。

## 常用命令总结

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器（测试环境） |
| `npm run build:dev` | 构建测试环境版本 |
| `npm run build:prod` | 构建生产环境版本 |
| `npm run build` | 构建生产环境版本（简写） |
| `npm run preview:dev` | 预览测试环境构建 |
| `npm run preview:prod` | 预览生产环境构建 |
| `npm run preview` | 预览生产环境构建（简写） |

## 环境变量说明

| 变量名 | 说明 |
|--------|------|
| `VITE_DEFAULT_API_URL` | API基础URL |
| `VITE_DEFAULT_API_KEY` | API密钥 |
| `VITE_DEFAULT_API_TYPE` | API类型（openai/anthropic） |
| `VITE_DEFAULT_MODEL` | 使用的AI模型 |

## 注意事项

1. **安全性**：
   - 永远不要将 `.env.development` 或 `.env.production` 提交到代码仓库
   - 生产环境的API密钥要妥善保管
   - 定期更换API密钥

2. **测试流程**：
   - 所有修改必须先在测试环境验证
   - 测试通过后才能部署到生产环境
   - 建议保留测试环境的构建版本用于回滚

3. **版本管理**：
   - 每次生产部署前建议打tag
   - 记录每次部署的版本和时间
   - 保留上一个稳定版本用于紧急回滚

## 故障排查

### 问题：环境变量未生效

**解决方案**：
1. 确认环境配置文件存在且格式正确
2. 重启开发服务器
3. 清除构建缓存：`rm -rf dist node_modules/.vite`

### 问题：API调用失败

**解决方案**：
1. 检查环境配置文件中的API配置是否正确
2. 确认API密钥是否有效
3. 检查网络连接和API服务状态

## 紧急回滚

如果生产环境出现问题，需要紧急回滚：

1. 找到上一个稳定版本的构建产物
2. 将其重新部署到生产服务器
3. 验证回滚后的功能正常
4. 分析问题原因，在测试环境修复后再次部署
