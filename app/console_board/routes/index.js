const express = require('express');
const router = express.Router();

/**
 * 渲染默认视图页
 * @param req
 * @param res
 */
function renderDefaultView(req, res) {
  res.render('index');
}

router.get('/', renderDefaultView);

module.exports = router;
