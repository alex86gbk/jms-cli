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
      publicPath: []
    };
  }

  return {
    devServerPort: setting.dev.port,
    mockServerPort: setting.mock.port,
    proxyPath: setting.mock.proxyPath,
    mockYAPI: setting.mock.YAPI,
    publicPath: `/${setting.publicPath.join('/')}`,
  }
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
    "publicPath": data.publicPath.replace(/^\//, '').split('/')
  };

  if (setting["publicPath"][0] === '') {
    setting["publicPath"] = [];
  }

  try {
    fs.writeFileSync(path.resolve(projectPath, '.projectrc.js'), `module.exports = ${JSON.stringify(setting, null, 2)};`);

    return Promise.resolve();
  } catch (err) {
    return Promise.reject();
  }
}

module.exports = {
  getSetting,
  setSetting,
};
