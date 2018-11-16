const fs = require('fs');
const path = require('path');
const walk = require('walk');
const esprima = require('esprima');

/**
 * 生成接口函数信息
 * @param {Object} ast
 * @return {Object}
 */
function generateApiFunctionInfo(ast) {
  let info = [];

  ast.body.map((module) => {
    if (module['type'] === 'ExportNamedDeclaration') {
      let api = {};
      if (module['declaration'] && module['declaration']['type'] === 'FunctionDeclaration') {
        api['name'] = module['declaration']['id']['name'];
        if (module['declaration']['body'] && module['declaration']['body']['type'] === 'BlockStatement') {
          module['declaration']['body']['body'].map((body) => {
            if (body['argument'] && body['argument']['arguments']) {
              body['argument']['arguments'].map((arguments) => {
                if (arguments['properties'].length) {
                  arguments['properties'].map((properties) => {
                    if (properties['type'] === 'Property') {
                      if (properties['key']['name'] === 'url' && properties['value']['type'] === 'BinaryExpression') {
                        api['url'] = properties['value']['right']['value'];
                      }
                      if (properties['key']['name'] === 'url' && properties['value']['type'] === 'Literal') {
                        api['url'] = properties['value']['value'];
                      }
                      if (properties['key']['name'] === 'method' && properties['value']['type'] === 'Literal') {
                        api['method'] = properties['value']['value'];
                      }
                    }
                  });
                }
              });
            }
          });
        }
      }
      info.push(api);
    }
  });

  ast.comments.map((comment, i) => {
    if (comment['type'] === 'Block') {
      info[i]['description'] = comment['value'].split('\n')[1].replace(/\*/g, '');
    }
  });

  return info;
}

/**
 * 生成接口
 * @param root
 * @param fileStats
 * @return {Object}
 */
function generateServiceApi(root, fileStats) {
  const title = fileStats.name.replace(/Services\.js$/i, '');

  let apiFunction;

  try {
    let fileContent = fs.readFileSync(path.resolve(root, fileStats.name), 'utf-8');
    apiFunction = generateApiFunctionInfo(esprima.parseModule(fileContent, { comment: true }));
    apiFunction.map((item) => {
      item['category'] = title;
      item['mock'] = `${title}=>${item['name']}`;
    });
  } catch (err) {
    apiFunction = [];
  }

  return apiFunction;
}

/**
 * 获取接口
 * @param {String} projectPath
 * @return {Promise.<void>}
 */
async function getServiceApi(projectPath) {
  const walkerOptions = {
    followLinks: false,
  };
  const filterReg = /Services\.js$/;
  const walker = walk.walk(path.resolve(projectPath, 'src', 'services'), walkerOptions);

  let serviceApi = [];

  walker.on('file', function (root, fileStats, next) {
    if (filterReg.test(fileStats.name)) {
      serviceApi = serviceApi.concat(generateServiceApi(root, fileStats));
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
      resolve(serviceApi);
    });
  });
}

/**
 * 获取模拟数据
 * @param {String} projectPath
 * @param {Object} req
 * @return {Promise.<void>}
 */
async function getMock(projectPath, req) {
  let mockPath = global.JMSVersion >= global.settableVersion ? 'mock' : 'api';

  try {
    let mockModule = require(path.resolve(projectPath, mockPath, req.category));
    let property = mockModule[req.name];

    if (typeof property === 'function') {
      return Promise.resolve(
        property.toString()
          .replace(/^function[\s\S]*res.send\(/, '')
          .replace(/\)[\s]*}$/, '')
          .replace(/\);[\s]*}$/, '')
        );
    } else if (typeof property === 'object') {
      return Promise.resolve(JSON.stringify(property));
    }
  } catch (err) {
    return Promise.resolve(null);
  }
}

module.exports = {
  getServiceApi,
  getMock,
};
