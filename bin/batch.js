#!/usr/bin/env node

// console.log('========================================================================================================================');
// console.log(process);

const tools = require('../utils/index');

const clone = require('../command/clone');
const remove = require('../command/remove');
const pull = require('../command/pull');

// 命令行参数
const [nodePath, gitbPath, command, ...rest] = process.argv;

// 业务参数
const params = tools.parseParams(rest);

// console.log(nodePath, gitbPath, command, rest, params);

// 扩展参数
const ext = {
  rootDir: process.env.PWD,
}

// 克隆
if (command === 'clone') {
  clone(params, ext);
}

// 拉取
if (command === 'pull') {
  pull(params, ext);
}

// 移除
if (command === 'remove') {
  remove(params, ext);
}
