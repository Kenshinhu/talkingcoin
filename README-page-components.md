# 页面组件系统说明

## 概述

本项目实现了一个基于 `pageType` 的动态页面组件系统，可以根据API返回的页面类型自动加载不同的组件。

## 支持的页面类型

### 1. VIDEO_ONLY 页面
- **页面类型**: `VIDEO_ONLY`
- **组件**: `VideoOnlyPage.vue`
- **功能**: 全屏视频播放，底部显示标题和描述
- **数据要求**: 
  - `mediaItems[0].file.filePath` - 视频文件地址
  - `mediaItems[0].title` - 视频标题（可选）
  - `mediaItems[0].description` - 视频描述（可选）

### 2. IMAGE_ONLY 页面
- **页面类型**: `IMAGE_ONLY`
- **组件**: `ImageOnlyPage.vue`
- **功能**: 全屏图片轮播，支持多张图片切换，底部显示每张图片的标题和描述
- **数据要求**: 
  - `mediaItems[].file.filePath` - 图片文件地址
  - `mediaItems[].title` - 图片标题（可选）
  - `mediaItems[].description` - 图片描述（可选）
  - `mediaItems[].displayOrder` - 显示顺序（可选）
- **特性**:
  - 自动轮播（5秒间隔）
  - 支持手势滑动和键盘控制
  - 支持图片缩放
  - 响应式设计
  - 信息覆盖层根据当前图片动态显示

### 3. 默认页面
- **页面类型**: 其他所有类型
- **组件**: `DefaultPage.vue`
- **功能**: 通用页面展示，支持多媒体内容
- **数据要求**: 标准页面数据结构

## 文件结构

```
src/
├── views/
│   ├── page.vue              # 主页面组件，负责路由和组件选择
│   └── test-page.vue         # 测试页面
├── components/
│   ├── VideoOnlyPage.vue     # 视频专用页面组件
│   ├── ImageOnlyPage.vue     # 图片轮播页面组件
│   └── DefaultPage.vue       # 默认页面组件
└── api/
    └── index.js              # API服务
```

## 使用方法

### 1. 访问页面
通过路由访问页面：
```
/page/{页面ID}
```

### 2. API数据格式
API应返回以下格式的数据：

```json
{
  "success": true,
  "data": {
    "id": "页面ID",
    "name": "页面名称",
    "description": "页面描述",
    "pageType": "VIDEO_ONLY",
    "mediaItems": [
      {
        "id": "媒体项ID",
        "mediaType": "video",
        "title": "媒体标题",
        "description": "媒体描述",
        "file": {
          "filePath": "https://example.com/video.mp4"
        }
      }
    ]
  }
}
```

### 3. 测试功能
访问 `/test` 路由可以测试不同的页面组件：
- 测试 VIDEO_ONLY 页面
- 测试 IMAGE_ONLY 页面
- 测试默认页面
- 查看组件渲染效果

## 组件特性

### VideoOnlyPage 组件
- ✅ 全屏视频播放
- ✅ 自动播放（如果浏览器允许）
- ✅ 移动端优化
- ✅ 底部信息覆盖层
- ✅ 响应式设计
- ✅ 视频控制器
- ✅ 错误处理

### ImageOnlyPage 组件
- ✅ 全屏图片轮播
- ✅ 自动播放和手动控制
- ✅ 图片缩放功能
- ✅ 键盘导航支持
- ✅ 动态信息覆盖层
- ✅ 响应式设计
- ✅ 移动端优化

### DefaultPage 组件
- ✅ 多媒体内容支持（图片、视频）
- ✅ 网格布局
- ✅ 原始数据查看
- ✅ 响应式设计
- ✅ 页面类型标识

## 扩展新页面类型

要添加新的页面类型，请按以下步骤操作：

1. **创建新组件**
   ```vue
   <!-- src/components/NewPageType.vue -->
   <template>
     <div class="new-page-type">
       <!-- 组件内容 -->
     </div>
   </template>
   
   <script>
   export default {
     name: 'NewPageType',
     props: {
       // 定义所需的props
     }
   }
   </script>
   ```

2. **在 page.vue 中注册组件**
   ```javascript
   import NewPageType from '../components/NewPageType.vue'
   
   export default {
     components: {
       VideoOnlyPage,
       DefaultPage,
       NewPageType  // 添加新组件
     }
   }
   ```

3. **添加页面类型判断**
   ```javascript
   const currentPageComponent = computed(() => {
     const pageType = pageData.value?.data?.pageType
     
     switch (pageType) {
       case 'VIDEO_ONLY':
         return 'VideoOnlyPage'
       case 'NEW_PAGE_TYPE':  // 添加新类型
         return 'NewPageType'
       default:
         return 'DefaultPage'
     }
   })
   ```

4. **配置组件props**
   ```javascript
   const pageComponentProps = computed(() => {
     // ... 现有代码
     
     switch (data.pageType) {
       case 'NEW_PAGE_TYPE':
         return {
           ...baseProps,
           // 添加特定的props
         }
       // ... 其他cases
     }
   })
   ```

## 开发和调试

### 启动开发服务器
```bash
npm run dev
```

### 构建项目
```bash
npm run build
```

### 测试组件
访问 `http://localhost:4000/test` 进行组件测试

## 注意事项

1. **视频自动播放**: 现代浏览器对自动播放有限制，可能需要用户交互才能播放
2. **移动端适配**: 所有组件都已针对移动端进行优化
3. **错误处理**: 组件包含基本的错误处理机制
4. **性能优化**: 使用了Vue 3的Composition API和响应式系统

## 示例数据

参考 `api-sample/video-only.json` 文件查看完整的API响应示例。 