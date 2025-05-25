<template>
  <div class="grid-test">
    <h2>Grid 布局测试</h2>
    
    <div class="test-section">
      <h3>测试配置:</h3>
      <p>mediaLayout: {{ testConfig.mediaLayout }}</p>
      <p>mediaPerRow: {{ testConfig.mediaPerRow }}</p>
      <p>gridGap: {{ testConfig.gridGap }}</p>
      <p>mediaAspectRatio: {{ testConfig.mediaAspectRatio }}</p>
    </div>
    
    <div class="test-section">
      <h3>生成的样式:</h3>
      <pre>{{ JSON.stringify(computedGridStyle, null, 2) }}</pre>
    </div>
    
    <div class="test-section">
      <h3>实际效果:</h3>
      <div 
        class="test-media-grid"
        :style="computedGridStyle">
        <div 
          v-for="i in 12" 
          :key="i" 
          class="test-media-item"
          :style="computedItemStyle">
          项目 {{ i }}
        </div>
      </div>
    </div>
    
    <div class="test-section">
      <h3>控制面板:</h3>
      <div class="controls">
        <label>
          布局模式:
          <select v-model="testConfig.mediaLayout">
            <option value="grid">Grid</option>
            <option value="flex">Flex</option>
            <option value="masonry">Masonry</option>
          </select>
        </label>
        
        <label>
          每行列数:
          <select v-model="testConfig.mediaPerRow">
            <option :value="1">1列</option>
            <option :value="2">2列</option>
            <option :value="3">3列</option>
            <option :value="4">4列</option>
            <option :value="5">5列</option>
            <option :value="6">6列</option>
          </select>
        </label>
        
        <label>
          间距:
          <select v-model="testConfig.gridGap">
            <option value="10px">10px</option>
            <option value="15px">15px</option>
            <option value="20px">20px</option>
            <option value="25px">25px</option>
            <option value="30px">30px</option>
          </select>
        </label>
        
        <label>
          宽高比:
          <select v-model="testConfig.mediaAspectRatio">
            <option :value="1">1:1</option>
            <option :value="1.5">3:2</option>
            <option :value="16/9">16:9</option>
            <option :value="4/3">4:3</option>
          </select>
        </label>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'GridTest',
  setup() {
    const testConfig = ref({
      mediaLayout: 'grid',
      mediaPerRow: 3,
      gridGap: '20px',
      mediaAspectRatio: 1
    })
    
    const computedGridStyle = computed(() => {
      const layout = testConfig.value.mediaLayout
      const perRow = parseInt(testConfig.value.mediaPerRow)
      const gap = testConfig.value.gridGap
      
      const baseStyle = {
        width: '100%',
        boxSizing: 'border-box'
      }
      
      if (layout === 'grid') {
        return {
          ...baseStyle,
          display: 'grid',
          gridTemplateColumns: `repeat(${perRow}, 1fr)`,
          gap: gap,
          alignItems: 'start'
        }
      } else if (layout === 'flex') {
        return {
          ...baseStyle,
          display: 'flex',
          flexWrap: 'wrap',
          gap: gap,
          justifyContent: 'flex-start',
          alignItems: 'stretch'
        }
      } else if (layout === 'masonry') {
        return {
          ...baseStyle,
          display: 'grid',
          gridTemplateColumns: `repeat(${perRow}, 1fr)`,
          gap: gap,
          gridAutoRows: 'min-content',
          alignItems: 'start'
        }
      }
      
      return baseStyle
    })
    
    const computedItemStyle = computed(() => {
      const aspectRatio = parseFloat(testConfig.value.mediaAspectRatio)
      const layout = testConfig.value.mediaLayout
      const perRow = parseInt(testConfig.value.mediaPerRow)
      const gap = testConfig.value.gridGap
      
      const baseStyle = {
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '8px',
        boxSizing: 'border-box',
        backgroundColor: '#f0f0f0',
        border: '1px solid #ccc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        color: '#666'
      }
      
      if (layout === 'flex') {
        const gapValue = parseFloat(gap.replace(/[^\d.]/g, '')) || 20
        const gapUnit = gap.replace(/[\d.]/g, '') || 'px'
        const totalGapWidth = `${(perRow - 1) * gapValue}${gapUnit}`
        const flexBasis = `calc(${100 / perRow}% - ${totalGapWidth} / ${perRow})`
        
        return {
          ...baseStyle,
          flexBasis: flexBasis,
          flexShrink: 0,
          flexGrow: 0,
          aspectRatio: aspectRatio.toString(),
          minWidth: 0
        }
      } else if (layout === 'grid') {
        return {
          ...baseStyle,
          aspectRatio: aspectRatio.toString(),
          width: '100%',
          minWidth: 0
        }
      } else if (layout === 'masonry') {
        return {
          ...baseStyle,
          width: '100%',
          minWidth: 0,
          minHeight: '200px'
        }
      }
      
      return {
        ...baseStyle,
        aspectRatio: aspectRatio.toString()
      }
    })
    
    return {
      testConfig,
      computedGridStyle,
      computedItemStyle
    }
  }
}
</script>

<style scoped>
.grid-test {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.test-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.test-section h3 {
  margin-top: 0;
  color: #333;
}

.test-media-grid {
  border: 2px dashed #007bff;
  padding: 10px;
  background-color: white;
}

.test-media-item {
  /* 样式通过 :style 动态应用 */
}

.controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.controls label {
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-weight: bold;
}

.controls select {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

pre {
  background-color: #f4f4f4;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 12px;
}
</style> 