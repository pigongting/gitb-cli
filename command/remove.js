const tools = require('../utils/index');
const fsp = require('fs/promises');

/**
 * 克隆
 */
async function remove(params, ext) {
  const gittxts = await tools.findGitTxt(ext.rootDir);
  const repositories = [];
  const needRemove = [];
  
  for (let i = 0; i < gittxts.length; i++) {
    const gittxt = gittxts[i];
    await tools.findGitRepository(gittxt, repositories);
  }

  for (let r = 0; r < repositories.length; r++) {
    const repository = repositories[r];
    const exist = await fsp.stat(repository.dir + '/' + repository.repositoryName).catch((reason) => {});
    exist && needRemove.push(repository);
  }

  const data = needRemove.reduce((prev, current, index) => {
    const item = [prev];

    item.push(`rm -rf ${current.dir}/${current.repositoryName}`);

    prev = item.join('\n');

    return prev;
  }, '#! /bin/bash');

  // 写入文件
  await fsp.writeFile(`${ext.rootDir}/gitb.sh`, data);
}

module.exports = remove;
