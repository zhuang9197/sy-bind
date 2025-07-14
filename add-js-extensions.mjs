// add-js-extensions.mjs (注意扩展名改为 .mjs)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function addJsExtensions(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      addJsExtensions(filePath);
    } else if (file.endsWith('.js')) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // 匹配相对路径的 import/export 语句
      content = content.replace(
        /(import\s+.*?\s+from\s+['"])(\.\.?\/[^'"]*?)(['"])/g,
        (match, prefix, importPath, suffix) => {
          if (!importPath.endsWith('.js') && !importPath.includes('node_modules')) {
            return prefix + importPath + '.js' + suffix;
          }
          return match;
        }
      );
      
      content = content.replace(
        /(export\s+.*?\s+from\s+['"])(\.\.?\/[^'"]*?)(['"])/g,
        (match, prefix, exportPath, suffix) => {
          if (!exportPath.endsWith('.js') && !exportPath.includes('node_modules')) {
            return prefix + exportPath + '.js' + suffix;
          }
          return match;
        }
      );
      
      fs.writeFileSync(filePath, content);
    }
  });
}

addJsExtensions('./dist');
