const fs = require('fs');
const { exec } = require('child_process');
const co = require('co');
const prompt = require('co-prompt');
const chalk = require('chalk');

/**
 * 检查项目文件夹
 * @param project
 * @return {Promise}
 */
function checkProject(project) {
  return new Promise((resolve) => {
    if (fs.existsSync(`${project}`)) {
      console.log(chalk.red('\n Project directory has been exist!'));
      process.exit();
    } else {
      resolve();
    }
  });
}

/**
 * 下载版本库
 * url {String}
 * project {String}
 * @return {Promise}
 */
function cloneRepository(url, project) {
  const command = `git clone ${url} ${project} && cd ${project} && git checkout master`;
  console.log(chalk.white('\n Start generating...'));

  return new Promise((resolve) => {
    exec(command, (error) => {
      if (error) {
        console.log(error);
        process.exit();
      }
      console.log(chalk.green('\n √ Generation completed!'));
      resolve();
    });
  });
}

/**
 * 初始化项目
 * @param init
 * @param project
 * @return {Promise}
 */
function initProject(init, project) {
  const command = `cd ${project} && npm install`;

  if (init === 'yes' || init === 'y') {
    console.log(chalk.white('Project init...'));

    return new Promise((resolve) => {
      exec(command, (error) => {
        if (error) {
          console.log(error);
          process.exit();
        }
        console.log(chalk.green('\n √ Init completed!'));
        process.exit();
        resolve();
      });
    });
  } else {
    process.exit();
  }
}

module.exports = (url) => {
  co(function * init() {
    const project = yield prompt('Project name: ');

    yield checkProject(project);
    yield cloneRepository(url, project);

    const init = yield prompt('Auto init project? It`s maybe taken a while! (yes/no)');

    yield initProject(init, project);
  });
};
