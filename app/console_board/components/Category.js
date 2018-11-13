const fs = require('fs');
const path = require('path');
const walk = require('walk');
const extractComments = require('extract-comments');

/**
 * 生成分类
 * @param projectPath
 * @param root
 * @param fileStats
 * @return {Object}
 */
function generateCategory(projectPath, root, fileStats) {
  const filePath = `${root.replace(path.resolve(projectPath), '').replace(/\\/g, '/')}/${fileStats.name}`;
  const title = fileStats.name.replace(/Services\.js$/i, '');

  let mockFilePath;
  let items;

  try {
    let fileContent = fs.readFileSync(path.resolve(root, fileStats.name), 'utf-8');
    mockFilePath = extractComments.first(fileContent)[0].value.split('\n')[1];
    items = extractComments.block(fileContent);
    items = items.map((item) => {
      return item.value.split('\n')[1];
    });
  } catch (err) {
    items = '';
    mockFilePath = ''
  }

  if (mockFilePath.indexOf('mock@') !== -1) {
    mockFilePath = mockFilePath.replace('mock@', '');
  } else {
    mockFilePath = '';
  }

  return {
    title: title,
    filePath: filePath,
    mockFilePath: mockFilePath,
    item: items,
  };
}

/**
 * 获取分类
 * @param {String} projectPath
 * @return {Promise.<void>}
 */
async function getCategory(projectPath) {
  const walkerOptions = {
    followLinks: false,
  };
  const filterReg = /Services\.js$/;
  const walker = walk.walk(path.resolve(projectPath, 'src', 'services'), walkerOptions);

  let categories = [];

  walker.on('file', function (root, fileStats, next) {
    if (filterReg.test(fileStats.name)) {
      categories.push(generateCategory(projectPath, root, fileStats));
    }
    next();
  });

  walker.on('errors', function (root, nodeStatsArray, next) {
    console.log('------------- error -------------');
    console.log(`root: ${root}`);
    console.log(`nodeStatsArray: ${nodeStatsArray}`);
    next();
  });

  return new Promise((resolve) => {
    walker.on('end', function () {
      resolve(categories);
    });
  });
}

module.exports = {
  getCategory,
};
