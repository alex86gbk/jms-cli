const fs = require('fs');
const path = require('path');
const walk = require('walk');
const extractComments = require('extract-comments');

/**
 * 生成分类
 * @param {String} projectPath
 * @param {String} root
 * @param {String} fileStats
 * @param {Array} mock
 * @return {Object}
 */
function generateCategory(projectPath, root, fileStats, mock) {
  const filePath = `${root.replace(path.resolve(projectPath), '').replace(/\\/g, '/')}/${fileStats.name}`;
  const title = fileStats.name.replace(/Services\.js$/i, '');

  let items;
  let mockModule;

  try {
    let fileContent = fs.readFileSync(path.resolve(root, fileStats.name), 'utf-8');
    items = extractComments.block(fileContent);
    items = items.map((item) => {
      return item.value.split('\n')[1];
    });
  } catch (err) {
    items = '';
    global.logger.errorLogger.error('catch error: ', err.stack);
  }

  mock.forEach((item) => {
    if (item.indexOf(title) >= 0) {
      mockModule = item;
    }
  });

  mockModule = mockModule ? mockModule : '';

  return {
    title: title,
    filePath: filePath,
    mockModule: mockModule,
    item: items,
  };
}

/**
 * 获取 mock 数据文件
 * @param {String} projectPath
 */
function getMockFile(projectPath) {
  const walkerOptions = {
    followLinks: false,
  };
  const filterReg = /\.js$/;
  const walker = walk.walk(path.resolve(projectPath, 'api'), walkerOptions);

  let mock = [];

  walker.on('file', function (root, fileStats, next) {
    if (filterReg.test(fileStats.name)) {
      mock.push(`${root.replace(path.resolve(projectPath), '').replace(/\\/g, '/')}/${fileStats.name}`);
    }
    next();
  });

  return new Promise((resolve) => {
    walker.on('end', function () {
      resolve(mock);
    });
  });
}

/**
 * 获取 mock 数据文件夹
 * @param {String} projectPath
 */
function getMockDir(projectPath) {
  const walkerOptions = {
    followLinks: false,
  };
  const walker = walk.walk(path.resolve(projectPath, 'mock'), walkerOptions);

  let mock = [];

  walker.on('directory', function (root, fileStats, next) {
    mock.push(`${root.replace(path.resolve(projectPath), '').replace(/\\/g, '/')}/${fileStats.name}`);
    next();
  });

  return new Promise((resolve) => {
    walker.on('end', function () {
      resolve(mock);
    });
  });
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
  let mock;

  if (global.JMSVersion >= global.versionMap['release-0.2.0'].version) {
    mock = await getMockDir(projectPath);
  } else {
    mock = await getMockFile(projectPath);
  }

  const walker = walk.walk(path.resolve(projectPath, 'src', 'services'), walkerOptions);
  let categories = [];

  walker.on('file', function (root, fileStats, next) {
    if (filterReg.test(fileStats.name)) {
      categories.push(generateCategory(projectPath, root, fileStats, mock));
    }
    next();
  });

  walker.on('errors', function (root, nodeStatsArray, next) {
    global.logger.errorLogger.error('catch error: ', `root: ${root} \nnodeStatsArray: ${nodeStatsArray}`);
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
