# 重定向页面 (REDIRECT) 后端接口文档

## 📋 概述

重定向页面类型用于实现页面的重定向功能，支持立即重定向和延迟重定向两种模式。该功能完全兼容现有页面系统架构。

## 🚀 接口说明

### 支持的页面类型
- **REDIRECT**: 重定向页面类型

### 功能特性
1. **立即重定向** (`redirectType: "immediate"`)
   - 页面加载后立即跳转
   - 不显示任何UI元素

2. **延迟重定向** (`redirectType: "delayed"`)
   - 显示倒计时和提示信息
   - 用户可以选择跳过等待

## 📊 数据结构定义

### 基础字段（通用字段）
```json
{
  "id": "string",                    // 页面唯一ID (UUID格式)
  "userId": "string",                // 用户ID (UUID格式)
  "name": "string",                  // 页面名称
  "description": "string",           // 页面描述
  "pageType": "REDIRECT",            // 页面类型，固定为"REDIRECT"
  "createdAt": "string",             // 创建时间 (ISO 8601格式)
  "updatedAt": "string",             // 更新时间 (ISO 8601格式)
  "isActive": "boolean",             // 是否激活
  "status": "PUBLISHED",             // 状态
  "accessCount": "number",           // 访问次数
  "expiresAt": "string",             // 过期时间 (可选)
  "miniprogramLink": "string",       // 小程序链接 (可选)
  "contentLink": "string"            // 内容链接
}
```

### 样式配置字段
```json
{
  "headerSettings": {
    "backgroundColor": "string",     // 头部背景色 (hex格式，如: "#ffffff")
    "text": "string",                // 头部文本
    "textColor": "string",           // 头部文字颜色 (hex格式)
    "textAlign": "string",           // 文字对齐方式 ("left"|"center"|"right")
    "height": "string"               // 头部高度
  },
  "footerSettings": {
    "backgroundColor": "string",     // 底部背景色 (hex格式)
    "copyrightText": "string",       // 版权文字
    "showSocialLinks": "boolean"     // 是否显示社交链接
  },
  "styleSettings": {
    "theme": "string",               // 主题 ("light"|"dark")
    "fontFamily": "string",          // 字体族
    "primaryColor": "string"         // 主色调 (hex格式)
  }
}
```

### 重定向专用配置 (contentData)
```json
{
  "targetUrl": "string",             // 目标URL (必需)
  "redirectType": "string",          // 重定向类型: "immediate" | "delayed"
  "delaySeconds": "number",          // 延迟秒数 (仅delayed类型使用)
  "redirectMessage": {               // 重定向提示信息
    "title": "string",               // 提示标题
    "description": "string",         // 提示描述
    "textColor": "string"            // 文字颜色 (hex格式)
  },
  "showCountdown": "boolean",        // 是否显示倒计时 (仅delayed类型使用)
  "allowSkip": "boolean",            // 是否允许跳过 (仅delayed类型使用)
  "skipButton": {                    // 跳过按钮配置 (仅delayed类型使用)
    "text": "string",                // 按钮文字
    "backgroundColor": "string",     // 按钮背景色 (hex格式)
    "textColor": "string"            // 按钮文字颜色 (hex格式)
  },
  "backgroundColor": "string"        // 页面背景色 (hex格式)
}
```

## 🔧 接口规范

### 创建重定向页面
**接口**: `POST /api/pages`

**请求示例**:
```json
{
  "success": true,
  "data": {
    "id": "redirect-001-uuid-here",
    "userId": "620f3bcb-1f89-4563-961e-f732ab688a93",
    "name": "页面跳转中",
    "description": "正在跳转到目标页面，请稍候...",
    "miniprogramLink": "",
    "contentLink": "redirect-link-001",
    "pageType": "REDIRECT",
    "headerSettings": {
      "backgroundColor": "#ffffff",
      "text": "页面跳转",
      "textColor": "#333333",
      "textAlign": "center",
      "height": "60px"
    },
    "footerSettings": {
      "backgroundColor": "#f8f8f8",
      "copyrightText": "© 2025 公司名称",
      "showSocialLinks": false
    },
    "contentData": {
      "targetUrl": "https://baidu.com",
      "redirectType": "delayed",
      "delaySeconds": 3,
      "redirectMessage": {
        "title": "即将跳转",
        "description": "页面将在3秒后自动跳转，请稍候...",
        "textColor": "#666666"
      },
      "showCountdown": true,
      "allowSkip": true,
      "skipButton": {
        "text": "立即跳转",
        "backgroundColor": "#007bff",
        "textColor": "#ffffff"
      },
      "backgroundColor": "#f5f5f5"
    },
    "styleSettings": {
      "theme": "light",
      "fontFamily": "Arial, sans-serif",
      "primaryColor": "#007bff"
    },
    "expiresAt": "",
    "isActive": true,
    "accessCount": 0,
    "status": "PUBLISHED",
    "createdAt": "2025-01-15T10:00:00.000Z",
    "updatedAt": "2025-01-15T10:00:00.000Z"
  }
}
```

### 更新重定向页面
**接口**: `PUT /api/pages/{pageId}`

**请求体**: 同创建接口，使用更新后的字段值

### 获取重定向页面
**接口**: `GET /api/pages/{pageId}`

**响应**: 返回完整的页面数据结构

## 📝 字段验证规则

### 必需字段
- `pageType`: 必须为 "REDIRECT"
- `contentData.targetUrl`: 必须是有效的URL格式
- `contentData.redirectType`: 必须是 "immediate" 或 "delayed"

### 条件必需字段
- 当 `redirectType` 为 "delayed" 时：
  - `contentData.delaySeconds`: 必须是正整数
  - `contentData.redirectMessage`: 必需

### 默认值建议
- `redirectType`: "delayed"
- `delaySeconds`: 3
- `showCountdown`: true
- `allowSkip`: true
- `backgroundColor`: "#f5f5f5"

### 字段约束
- `delaySeconds`: 建议范围 1-30 秒
- `backgroundColor`: 必须是有效的hex颜色代码
- `textColor`: 必须是有效的hex颜色代码
- `targetUrl`: 必须包含协议头 (http:// 或 https://)

## ⚠️ 业务规则

### 重定向逻辑
1. **立即重定向**: 页面渲染后立即执行 `window.location.href = targetUrl`
2. **延迟重定向**:
   - 显示倒计时UI
   - 倒计时结束后自动跳转
   - 用户可通过跳过按钮立即跳转

### 错误处理
- 无效的 `targetUrl`: 应返回400错误
- 无效的 `redirectType`: 应返回400错误
- 无效的颜色值: 应返回400错误

### 安全考虑
- `targetUrl` 应验证域名白名单
- 防止开放重定向漏洞
- 对用户输入进行XSS防护

## 🔄 兼容性说明

- ✅ 与现有页面系统完全兼容
- ✅ 支持现有的header/footer样式配置
- ✅ 保持统一的props传递机制
- ✅ 不影响其他页面类型的功能

## 📱 前端集成说明

### 组件依赖
- `RedirectPage.vue`: 重定向页面专用组件
- 需要在主页面路由中注册REDIRECT类型支持

### Props传递
```javascript
{
  pageData: {
    // 完整的页面数据结构
  },
  headerSettings: {
    // 头部配置
  },
  footerSettings: {
    // 底部配置
  }
}
```

## 🧪 测试建议

### 单元测试
- 测试立即重定向功能
- 测试延迟重定向倒计时
- 测试跳过按钮功能
- 测试无效URL处理

### 集成测试
- 测试完整的页面渲染流程
- 测试与现有页面的兼容性
- 测试响应式布局

### 验收测试
- 验证不同浏览器的兼容性
- 测试移动端和桌面端显示效果
- 验证无障碍访问支持

## 🔍 调试和监控

### 日志记录
- 记录重定向操作
- 记录跳过操作
- 记录错误情况

### 监控指标
- 重定向成功率
- 平均停留时间
- 跳过按钮点击率

---

*文档版本: 1.0*
*更新日期: 2025-01-15*
*维护人员: 后端开发团队*
