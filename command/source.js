const fs = require('fs');
const { exec } = require('child_process');
const co = require('co');
const prompt = require('co-prompt');
const chalk = require('chalk');
const { listJSON } = require('../src/utils');

const sources = require('../sources.json');

/**
 * 列出 npm 源列表
 * @return {Promise}
 */
function listSource() {
  return new Promise((resolve) => {
    fs.readFile(`${__dirname}/../sources.json`, (err) => {
      if (err) console.log(err);
      console.log(chalk.grey(' The source list is:'));
      console.log(`\n ${listJSON(sources).list}`);
      resolve();
    });
  });
}

/**
 * 切换 npm 源
 * number {number}
 * @return {Promise}
 */
function changeSource(number) {
  const command = `npm config set registry ${sources[number]}`;
  console.log(chalk.white('\n Changing source...'));

  return new Promise((resolve) => {
    exec(command, (error) => {
      if (error) {
        console.log(error);
        process.exit();
      }
      console.log(chalk.green('\n Changing done!'));
      console.log(chalk.white(`\n Use npm source: ${sources[number]}`));
      resolve();
    });
  });
}

module.exports = () => {
  co(function * source() {
    yield listSource();

    const number = yield prompt(`\nChoose a order number [${listJSON(sources).key}]: `);

    yield changeSource(number);

    process.exit();
  });
};
