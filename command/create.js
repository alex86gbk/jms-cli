const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const co = require('co');
const prompt = require('co-prompt');
const chalk = require('chalk');

const init = require('../src/init');
const utils = require('../src/utils');

let db;
let project;
let projects;

const argv = process.argv.splice(2);

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
  const data = {
    name: path.resolve(process.cwd(), projectName),
    path: path.resolve(process.cwd(), projectName),
  };

  projects.push(path.resolve(process.cwd(), projectName));

  return new Promise((resolve) => {
    db.insertDataSync(project, data).then(() => {
      console.log(chalk.green(`\n New project ${path.resolve(process.cwd(), projectName)} will be generating!`));
      console.log(chalk.blue(' The latest project list is:'));
      console.log(`\n ${projects.join('\n ')}`);
      resolve();
    });
  });
}

/**
 * 下载版本库（安装Vue依赖支持）
 * @param url {String}
 * @param projectName {String}
 * @return {Promise}
 */
function cloneRepositoryWithVue(url, projectName) {
  const command = `git clone ${url} ${projectName} && cd ${projectName} && git checkout master`;

  console.log(chalk.white('\n Start generating...'));

  return new Promise((resolve) => {
    exec(command, (error) => {
      if (error) {
        console.log(error);
        process.exit();
      }
      utils.deleteFolder(path.resolve(process.cwd(), projectName, '.git'));
      console.log(chalk.green(' Generation completed!'));
      resolve();
    });
  });
}

/**
 * 下载版本库（仅React依赖支持）
 * @param url {String}
 * @param projectName {String}
 * @return {Promise}
 */
function cloneRepository(url, projectName) {
  const command = `git clone ${url} ${projectName} && cd ${projectName} && git checkout react`;

  console.log(chalk.white('\n Start generating...'));

  return new Promise((resolve) => {
    exec(command, (error) => {
      if (error) {
        console.log(error);
        process.exit();
      }
      utils.deleteFolder(path.resolve(process.cwd(), projectName, '.git'));
      console.log(chalk.green(' Generation completed!'));
      resolve();
    });
  });
}

/**
 * 安装项目依赖
 * @param install {String}
 * @param projectName {String}
 * @return {Promise}
 */
function installProject(install, projectName) {
  const command = `cd ${projectName} && npm install`;

  if (install === 'yes' || install === 'y') {
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
    const appPath = yield init.initAppPath();
    const dbPath = yield init.initDBPath(appPath);

    db = require('../src/db');
    project = db.loadDBFiles(dbPath).project;
    projects = yield db.queryDataSync(project);
    projects = projects.map((item) => {
      return item.path
    });

    const projectName = argv.length >= 2 ? argv[1] : yield prompt('Project name: ');

    yield checkProject(projectName);
    yield addProject(projectName);

    console.log(chalk.green('\n Need support Vue?'));
    const needVueSupport = yield prompt(' please type: (yes/no) ');

    if (needVueSupport === 'yes' || needVueSupport === 'y') {
      yield cloneRepositoryWithVue(url, projectName);
    } else {
      yield cloneRepository(url, projectName);
    }

    console.log(chalk.blue('\n Would you like to install project? It`s maybe taken a while! '));
    const install = yield prompt(' please type: (yes/no) ');

    yield installProject(install, projectName);
  });
};
