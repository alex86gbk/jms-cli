const path = require('path');
const DataStore = require('nedb');

/**
 * 加载数据文件
 * @param {String} dbPath
 */
function loadDBFiles(dbPath) {
  const db = {
    project: new DataStore({
      filename: path.join(dbPath, 'project.db'),
      autoload: true
    })
  };

  db.project.ensureIndex({ fieldName: 'createdDate'}, function (err) {});

  return db;
}

/**
 * 查询数据（同步）
 * @param dataBase 数据库
 */
function queryDataSync(dataBase) {
  return new Promise(function (resolve, reject) {
    dataBase.find({}).exec(function (err, docs) {
      if (err) {
        reject();
      } else {
        resolve(docs);
      }
    });
  });
}

/**
 * 插入数据（同步）
 * @param dataBase 数据库
 * @param data 待插入数据
 * @return {Promise}
 */
function insertDataSync(dataBase, data) {
  return new Promise(function (resolve, reject) {
    dataBase.insert(data, function (err, docs) {
      if (err) {
        reject();
      } else {
        resolve(docs);
      }
    });
  });
}

module.exports = {
  loadDBFiles, queryDataSync, insertDataSync
};
