const fs = require('fs');
const path = require('path');
const walk = require('walk');
const cheerio = require('cheerio');

const setting = require('./Setting');

const pageRoot = 'templates';

/**
 * 获取页面参数
 * @return {Object}
 */
function getParams($meta) {
  let params = [];

  if ($meta.length) {
    $meta.each(function () {
      if (this.attribs.name === 'param') {
        if (this.attribs.content.indexOf('=') > 0) {
          params.push(this.attribs.content.split('='));
        }
      }
    });
    return params;
  } else {
    return [];
  }
}

/**
 * 生成页面地图
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
  let params;

  if (projectSetting.publicPath === '/') {
    link =
      'http://localhost:' +
      projectSetting.dev.port +
      root.replace(path.resolve(projectPath, pageRoot), '').replace(/\\/g, '/') +
      '/' +
      fileStats.name.replace(/\.ejs$/, '.html');
  } else {
    link =
      'http://localhost:' +
      projectSetting.dev.port +
      projectSetting.publicPath +
      root.replace(path.resolve(projectPath, pageRoot), '').replace(/\\/g, '/') +
      '/' +
      fileStats.name.replace(/\.ejs$/, '.html');
  }

  try {
    let fileContent = fs.readFileSync(path.resolve(root, fileStats.name), 'utf-8');
    const $ = cheerio.load(fileContent);

    title = $('title').text();
    params = getParams($('meta'));
  } catch (err) {
    title = '';
  }

  return {
    title: title,
    filePath: filePath,
    param: params,
    link: link,
  };
}

/**
 * 获取项目地图
 * @param {String} projectPath
 * @return {Promise.<void>}
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
    global.logger.errorLogger.error('catch error: ', `root: ${root} \nnodeStatsArray: ${nodeStatsArray}`);
    next();
  });

  return new Promise((resolve) => {
    walker.on('end', function () {
      resolve(pageMap);
    });
  });
}

module.exports = {
  getPageMap,
};
