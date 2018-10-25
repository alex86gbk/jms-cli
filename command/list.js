const fs = require('fs');
const co = require('co');
const chalk = require('chalk');

const project = require('../projects.json');

/**
 * 列出项目列表
 */
function listProject() {
  return new Promise((resolve) => {
    fs.readFile(`${__dirname}/../projects.json`, (err) => {
      if (err) console.log(err);
      console.log(chalk.grey(' The project list is:'));
      console.log(`\n ${project.join('\n ')}`);
      resolve();
    });
  });
}

module.exports = () => {
  co(function * list() {
    yield listProject();
  });
};
