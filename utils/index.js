const path = require('path');
const url = require('url');
const { readdir, readFile, stat } = require('fs/promises');

// 判断是否是key
const regKey = /^-/;
// 判断是否是仓库地址
const regRepository = /(http:|https:|git@)/;
// 判断是否是HTTP仓库地址
const regRepositoryHttp = /(http:|https:)/;
// 判断是否是SSH仓库地址
const regRepositorySsh = /(git@)/;

/**
 * 参数转对象
 */
 function parseParams(rest) {
  return rest.reduce((prev, current, index) => {
    if (regKey.test(current)) {
      const key = current.replace(regKey,'');
      const next = rest[index + 1];
      const value = regKey.test(next) ? true : (next || true);
      prev[key] = value;
    }
    return prev;
  }, {})
}

// 迭代函数
async function loop(dir, result) {
  // 读取目录中的所有文件
  const files = await readdir(dir);

  // 循环文件/文件夹名称数组
  for (const file of files) {
    // 完整路径
    const fullPath = dir + '/' + file;
    // 文件/文件夹信息
    const statInfo = await stat(fullPath);
    // 判断是目录
    if (statInfo.isDirectory()) {
      // 迭代
      await loop(fullPath, result);
    } else if (file === 'git.txt') {
      // 匹配
      result.push({
        dir,
        file: fullPath,
      });
    }
  }
}

/**
 * 找到所有配置文件
 */
async function findGitTxt(rootDir) {
  // 匹配的文件
  const matchedFiles = [];

  // 开始循环
  await loop(rootDir, matchedFiles);

  // 返回
  return matchedFiles;
}

/**
 * 找到配置文件中的仓库配置
 */
async function findGitRepository(gittxt, repositories) {
  // 文本内容
  const content = await readFile(gittxt.file,'utf-8');
  
  // 有效行
  const filter = content.split(/(↵|\r\n|\r|\n)/).filter(item => regRepository.test(item));
  
  // 仓库
  filter.map(item => {
    const rest = item.replace('=', ' ').split(' ').filter(item => item);
    const repository = rest.reduce((prev, current) => {
      if (regRepository.test(current)) {
        return current;
      }
      return prev;
    }, null);

    // 无仓库地址
    if (repository === null) return;

    // 参数
    const params = parseParams(rest);

    // SSH仓库地址
    const repositorySsh = http2ssh(repository);
    // HTTP仓库地址
    const repositoryHttp = ssh2http(repository);
    // 仓库名称
    const { name } = path.parse(repositoryHttp);

    repositories.push({
      dir: gittxt.dir,
      repositoryName: params.name || name,
      repositorySsh,
      repositoryHttp,
      params,
    });
  });
}

/**
 * http 转 ssh
 */
function http2ssh(repository) {
  // 直接返回
  if (regRepositorySsh.test(repository)) return repository;
  // 解析路径
  const { host, pathname } = url.parse(repository);
  // 转换
  return 'git@' + host + ':' + pathname.substring(1);
}

/**
 * ssh 转 http
 */
function ssh2http(repository) {
  // 直接返回
  if (regRepositoryHttp.test(repository)) return repository;
  // 解析路径
  const [x, host, pathname] = repository.replace('@', ':').split(':');
  // 转换
  return 'http://' + host + '/' + pathname;
}

module.exports = {
  findGitTxt,
  findGitRepository,
  parseParams,
};
