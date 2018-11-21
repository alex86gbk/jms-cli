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
                      else if (properties['key']['name'] === 'url' && properties['value']['type'] === 'Literal') {
                        api['url'] = properties['value']['value'];
                      }
                      else if (properties['key']['name'] === 'url' && properties['value']['type'] === 'TemplateLiteral') {
                        api['url'] = properties['value']['quasis'].map((quasis) => {
                          if (quasis.tail) {
                            return quasis.value.cooked;
                          }
                        }).join('');
                      }
                      else if (properties['key']['name'] === 'url' && properties['value']['type'] === 'TemplateLiteral') {
                        api['url'] = properties['value']['value'];
                      }
                      else if (properties['key']['name'] === 'method' && properties['value']['type'] === 'Literal') {
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
 * @param {String} projectPath
 * @param {String} root
 * @param {Object} fileStats
 * @return {Object}
 */
function generateServiceApi(projectPath, root, fileStats) {
  const filePath = `${root.replace(path.resolve(projectPath, 'src', 'services'), '').replace(/\\/g, '/')}/${fileStats.name}`;
  const category = fileStats.name.replace(/Services\.js$/i, '');
  const fileCategory = filePath.replace(/^\//, '').replace(/Services\.js$/i, '');

  let apiFunction;

  try {
    let fileContent = fs.readFileSync(path.resolve(root, fileStats.name), 'utf-8');
    apiFunction = generateApiFunctionInfo(esprima.parseModule(fileContent, { comment: true }));
    apiFunction.map((item) => {
      item['category'] = category;
      item['mock'] = `${fileCategory}=>${item['name']}`;
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
      serviceApi = serviceApi.concat(generateServiceApi(projectPath, root, fileStats));
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
  let property;

  try {
    if (global.JMSVersion >= global.versionMap['release-0.2.0'].version) {
      property = require(path.resolve(projectPath, 'mock', req.category, req.name));
    } else {
      property = require(path.resolve(projectPath, 'api', req.category))[req.name];
    }

    if (typeof property === 'function') {
      return Promise.resolve(
        property.toString()
          .replace(/^function[\s\S]*res.send\(/, '')
          .replace(/^\([\s\S]*\)[\s\S]*=>[\s\S]*res.send\(/, '')
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
