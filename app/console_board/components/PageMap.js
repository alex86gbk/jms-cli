const fs = require('fs');
const path = require('path');
const walk = require('walk');
const cheerio = require('cheerio');

const setting = require('./Setting');

const pageRoot = 'templates';

/**
 * 生成页面地图 TODO 设置与读取页面参数
 * @param projectPath
 * @param root
 * @param fileStats
 * @return {Object}
 */
function generatePageMap(projectPath, root, fileStats) {
  const projectSetting = setting.getSetting(projectPath);
  const filePath = `${root.replace(path.resolve(projectPath), '').replace(/\\/g, '/')}/${fileStats.name}`;

  let title;
  let link;

  if (projectSetting.publicPath === '/') {
    link =
      'http://localhost:' +
      projectSetting.devServerPort +
      root.replace(path.resolve(projectPath, pageRoot), '').replace(/\\/g, '/') +
      '/' +
      fileStats.name.replace(/\.ejs$/, '.html');
  } else {
    link =
      'http://localhost:' +
      projectSetting.devServerPort +
      projectSetting.publicPath +
      root.replace(path.resolve(projectPath, pageRoot), '').replace(/\\/g, '/') +
      '/' +
      fileStats.name.replace(/\.ejs$/, '.html');
  }

  try {
    let fileContent = fs.readFileSync(path.resolve(root, fileStats.name), 'utf-8');
    const $ = cheerio.load(fileContent);

    title = $('title').text();
  } catch (err) {
    title = '';
  }

  return {
    title: title,
    filePath: filePath,
    param: '',
    link: link,
  };
}

/**
 * 获取项目地图
 * @param {String} projectPath
 */
async function getPageMap(projectPath) {
  const walkerOptions = {
    followLinks: false,
  };
  const filterReg = /\.html$/;
  const walker = walk.walk(path.resolve(projectPath, pageRoot), walkerOptions);

  let pageMap = [];

  walker.on('file', function (root, fileStats, next) {
    if (!filterReg.test(fileStats.name)) {
      pageMap.push(generatePageMap(projectPath, root, fileStats));
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
      console.log('Get page map done!');
      resolve(pageMap);
    });
  });
}

module.exports = {
  getPageMap,
};
