const fs = require('fs');
const path = require('path');

/**
 * formatJSONString
 * 格式化 JSON 字符串
 * @param str
 * @returns {string}
 */
function formatJSONString(str) {
  let res = '';

  for (let i = 0, j = 0, k = 0, ii, ele; i < str.length; i++) {
    ele = str.charAt(i);
    if (j % 2 === 0 && ele === '}') {
      k--;
      for (ii = 0; ii < k; ii++) ele = `  ${ele}`;
      ele = `\n${ele}`;
    } else if (j % 2 === 0 && ele === '{') {
      ele += '\n';
      k++;
      for (ii = 0; ii < k; ii++) ele += '  ';
    } else if (j % 2 === 0 && ele === ',') {
      ele += '\n';
      for (ii = 0; ii < k; ii++) ele += '  ';
    } else if (ele === '"') j++;
    res += ele;
  }

  return res;
}

/**
 * 列表化 JSON
 * @param obj {Object}
 * @return {Object}
 */
function listJSON(obj) {
  let keys = [];
  let lists = [];

  for (const i in obj) {
    if ({}.hasOwnProperty.call(obj, i)) {
      keys.push(i);
      lists.push(`[${i}]: ${obj[i]}`);
    }
  }

  return {
    key: keys.join('|'),
    list: lists.join('\n ')
  };
}

/**
 * 删除文件夹（非空文件夹）
 * @param folderPath
 */
function deleteFolder(folderPath) {
  let files = fs.readdirSync(folderPath);

  for (let i = 0; i < files.length; i++) {
    let curPath = path.resolve(folderPath, files[i]);
    let stats = fs.statSync(curPath);

    if (stats.isFile()) {
      fs.unlinkSync(curPath);
    } else {
      deleteFolder(curPath);
    }
  }

  fs.rmdirSync(folderPath);
}

module.exports = {
  formatJSONString,
  listJSON,
  deleteFolder,
};
