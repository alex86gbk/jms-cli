const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const co = require('co');
const prompt = require('co-prompt');
const chalk = require('chalk');

const projects = require('../projects.json');

/**
 * 检查项目文件夹
 * @param projectName {String}
 * @return {Promise}
 */
function checkProject(projectName) {
  return new Promise((resolve) => {
    if (fs.existsSync(`${projectName}`)) {
      console.log(chalk.red(` Project "${path.resolve(process.cwd(), projectName)}" directory has been exist!`));
      process.exit();
    } else if (projects.indexOf(path.resolve(process.cwd(), projectName)) > -1) {
      console.log(chalk.red(` Project "${path.resolve(process.cwd(), projectName)}" directory has been exist!`));
      process.exit();
    } else {
      resolve();
    }
  });
}

/**
 * 新增项目记录
 * @param projectName {String}
 * @return {Promise}
 */
function addProject(projectName) {
  projects.push(path.resolve(process.cwd(), projectName));

  return new Promise((resolve) => {
    fs.writeFile(`${__dirname}/../projects.json`, JSON.stringify(projects), 'utf-8', (err) => {
      if (err) console.log(err);
      console.log(chalk.green(`\n New project ${path.resolve(process.cwd(), projectName)} has been added!`));
      console.log(chalk.grey(' The latest project list is:'));
      console.log(`\n ${projects.join('\n ')}`);
      resolve();
    });
  });
}

/**
 * 下载版本库
 * @param url {String}
 * @param projectName {String}
 * @return {Promise}
 */
function cloneRepository(url, projectName) {
  const command = `git clone ${url} ${projectName} && cd ${projectName} && git checkout master`;
  console.log(chalk.white('\n Start generating...'));

  return new Promise((resolve) => {
    exec(command, (error) => {
      if (error) {
        console.log(error);
        process.exit();
      }
      console.log(chalk.green(' Generation completed!'));
      resolve();
    });
  });
}

/**
 * 初始化项目
 * @param init {String}
 * @param projectName {String}
 * @return {Promise}
 */
function initProject(init, projectName) {
  const command = `cd ${projectName} && npm install`;

  if (init === 'yes' || init === 'y') {
    console.log(chalk.white(' Project init...'));

    return new Promise((resolve) => {
      exec(command, (error) => {
        if (error) {
          console.log(error);
          process.exit();
        }
        console.log(chalk.green('\n Init completed!'));
        process.exit();
        resolve();
      });
    });
  } else {
    process.exit();
  }
}

module.exports = (url) => {
  co(function * create() {
    const projectName = yield prompt('Project name: ');

    yield checkProject(projectName);
    yield addProject(projectName);
    yield cloneRepository(url, projectName);

    const init = yield prompt('Would you like to init project? It`s maybe taken a while! (yes/no)');

    yield initProject(init, projectName);
  });
};
