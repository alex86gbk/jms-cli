const pkg = require('../package.json');

/**
 * 是否正确版本
 * @param {*} curV 当前版本
 * @param {*} reqV 所需版本
 */
function isCurrentVersion(curV, reqV) {
  if (curV && reqV) {
    const arr1 = curV.split('.');
    const arr2 = reqV.split('.');
    const minLength = Math.min(arr1.length, arr2.length);
    let position = 0;
    let diff = 0;
    while (
      position < minLength
      && ((diff = parseInt(arr1[position], 10) - parseInt(arr2[position], 10)) === 0)
    ) {
      position += 1;
    }
    diff = (diff !== 0) ? diff : (arr1.length - arr2.length);
    return diff >= 0;
  } else {
    return false;
  }
}

/**
 * 获取版本号
 * @param {*} versionStr 版本号字符串
 */
function getVersion(versionStr) {
  return versionStr.match(/([0-9]\d|[0-9])(\.([0-9]\d|\d)){2}$/)[0];
}

if (!isCurrentVersion(getVersion(process.version), getVersion(pkg.engines.node))) {
  console.error(
    '\x1b[31m%s\x1b[0m',
    `Oops!!! now use Node version is ${process.version} this program require Node${pkg.engines.node}\n`
  );
  console.info(
    '\x1b[34m%s\x1b[0m',
    'Would you like typing [y] to continue install, or typing [ctrl+c] to exit\n'
    + 'If typing [n] will exit with code 1'
  );
  process.stdin.resume();
  process.stdin.on('data', (data) => {
    const input = data.toString().toLowerCase();
    if (input.trim() === 'y') {
      process.stdin.pause();
      process.exit();
    }
    if (input.trim() === 'n') {
      process.exit(1);
    }
  });
}
