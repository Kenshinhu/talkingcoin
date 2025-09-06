#!/usr/bin/env node

const OSS = require('ali-oss');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// 配置OSS客户端
function createOSSClient() {
  const config = require('../oss-config.json');

  return new OSS({
    region: config.region,
    accessKeyId: config.accessKeyId,
    accessKeySecret: config.accessKeySecret,
    bucket: config.bucket,
    endpoint: config.endpoint || undefined
  });
}

// 删除文件或目录
function deletePath(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        fs.rmSync(filePath, { recursive: true, force: true });
        console.log(`已删除目录: ${filePath}`);
      } else {
        fs.unlinkSync(filePath);
        console.log(`已删除文件: ${filePath}`);
      }
    }
  } catch (error) {
    console.error(`删除失败 ${filePath}:`, error.message);
  }
}

// 递归获取目录中的所有文件
function getAllFiles(dirPath, arrayOfFiles = []) {
  try {
    const files = fs.readdirSync(dirPath);

    files.forEach(file => {
      const fullPath = path.join(dirPath, file);
      if (fs.statSync(fullPath).isDirectory()) {
        arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
      } else {
        arrayOfFiles.push(fullPath);
      }
    });
  } catch (error) {
    console.error(`读取目录失败 ${dirPath}:`, error.message);
  }

  return arrayOfFiles;
}

// 上传文件到OSS
async function uploadFile(client, filePath, baseDir) {
  try {
    const relativePath = path.relative(baseDir, filePath).replace(/\\/g, '/');
    const objectName = relativePath;

    // 计算文件MD5用于缓存控制
    const fileContent = fs.readFileSync(filePath);
    const md5 = crypto.createHash('md5').update(fileContent).digest('base64');

    console.log(`正在上传: ${relativePath}`);

    const result = await client.put(objectName, filePath, {
      headers: {
        'Content-MD5': md5,
        'Cache-Control': 'max-age=31536000', // 1年缓存
      }
    });

    console.log(`上传成功: ${relativePath} -> ${result.url}`);
    return result;
  } catch (error) {
    console.error(`上传失败 ${filePath}:`, error.message);
    throw error;
  }
}

// 主上传函数
async function uploadToOSS() {
  try {
    console.log('开始OSS上传流程...\n');

    const distDir = path.join(__dirname, '..', 'dist');

    // 检查dist目录是否存在
    if (!fs.existsSync(distDir)) {
      throw new Error('dist目录不存在，请先运行npm run build');
    }

    // 1. 初始化OSS客户端
    console.log('步骤1: 初始化OSS客户端...');
    const client = createOSSClient();

    // 2. 获取所有待上传文件
    console.log('步骤2: 获取待上传文件列表...');
    const allFiles = getAllFiles(distDir);

    if (allFiles.length === 0) {
      console.log('没有找到需要上传的文件');
      return;
    }

    console.log(`找到 ${allFiles.length} 个文件待上传:\n`);
    allFiles.forEach(file => {
      const relativePath = path.relative(distDir, file);
      console.log(`  - ${relativePath}`);
    });
    console.log('');

    // 3. 上传文件
    console.log('步骤3: 开始上传文件...\n');
    let successCount = 0;
    let failCount = 0;

    for (const file of allFiles) {
      try {
        await uploadFile(client, file, distDir);
        successCount++;
      } catch (error) {
        failCount++;
        console.error(`文件上传失败: ${path.relative(distDir, file)}`);
      }
    }

    // 4. 输出结果统计
    console.log('\n上传完成!');
    console.log(`成功: ${successCount} 个文件`);
    console.log(`失败: ${failCount} 个文件`);

    if (failCount > 0) {
      throw new Error(`${failCount} 个文件上传失败`);
    }

    // 5. 只有在所有文件都上传成功后，才删除本地文件
    console.log('步骤5: 删除指定文件和目录...');
    deletePath(path.join(distDir, 'index.html'));
    deletePath(path.join(distDir, 'assets'));

    console.log('\n🎉 所有文件上传成功，本地文件已清理!');

  } catch (error) {
    console.error('\n❌ 上传失败:', error.message);
    process.exit(1);
  }
}

uploadToOSS();