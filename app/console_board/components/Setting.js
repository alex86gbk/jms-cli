const fs = require('fs');
const path = require('path');

/**
 * 获取设置
 * @param {String} projectPath
 */
function getSetting(projectPath) {
  let setting;
  try {
    delete require.cache[require.resolve(`${projectPath}/.projectrc.js`)];
    setting = require(`${projectPath}/.projectrc.js`);
    setting.publicPath = `/${setting.publicPath.join('/')}`;
    setting.startPage = setting.startPage ? setting.startPage : '';
  } catch (err) {
    setting = {
      dev: {
        port: 8080
      },
      mock: {
        port: 3000,
        proxyPath: '/api',
        YAPI: '',
      },
      publicPath: [],
    };
    global.logger.errorLogger.error('catch error: ', err.stack);
  }

  return setting;
}

/**
 * 保存设置
 * @param {String} projectPath
 * @param {String} projectSetting
 */
async function setSetting(projectPath, projectSetting) {
  const data = JSON.parse(projectSetting);
  const setting = {
    "mock": {
      "port": parseInt(data.mockServerPort),
      "proxyPath": data.proxyPath,
      "YAPI": data.mockYAPI
    },
    "dev": {
      "port": parseInt(data.devServerPort)
    },
    "publicPath": data.publicPath.replace(/^\//, '').split('/'),
    "startPage": data.startPage,
  };

  if (setting["publicPath"][0] === '') {
    setting["publicPath"] = [];
  }

  try {
    fs.writeFileSync(path.resolve(projectPath, '.projectrc.js'), `module.exports = ${JSON.stringify(setting, null, 2)};`);

    return Promise.resolve();
  } catch (err) {
    global.logger.errorLogger.error('catch error: ', err.stack);

    return Promise.reject();
  }
}

module.exports = {
  getSetting,
  setSetting,
};
