const path = require('path');
const DataStore = require('nedb');

/**
 * 加载数据文件
 * @param {String} dbPath
 */
function loadDBFiles(dbPath) {
  const db = {
    item: new DataStore({
      filename: path.join(dbPath, 'item.db'),
      autoload: true
    }),
    category: new DataStore({
      filename: path.join(dbPath, 'category.db'),
      autoload: true
    })
  };

  db.item.ensureIndex({ fieldName: 'createdDate'}, function (err) {});
  db.category.ensureIndex({ fieldName: 'name'}, function (err) {});

  return db;
}

module.exports = loadDBFiles;
