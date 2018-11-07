const fs = require('fs');
const path = require('path');

/**
 * 获取设置
 */
function getSetting(path) {
  const setting = require(`${path}/.projectrc.js`);

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
 * @param {Object} req
 * @param {Object} res
 * @param {String} projectPath
 */
function setSetting(req, res, projectPath) {
  const data = JSON.parse(req.body.setting);
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

  try {
    fs.writeFileSync(path.resolve(projectPath, '.projectrc.js'), `module.exports = ${JSON.stringify(setting, null, 2)};`);
    res.send({
      'message': 'ok'
    });
  } catch (err) {
    res.send({
      'message': 'fail'
    });
  }
}

module.exports = {
  getSetting,
  setSetting,
};
