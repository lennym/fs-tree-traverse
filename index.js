var list = module.exports = require('./lib/fs-tree-traverse');

list.list(__dirname, { relative: true }, console.log.bind(console));
