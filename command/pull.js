const tools = require('../utils/index');
const fsp = require('fs/promises');

/**
 * 克隆
 */
async function pull(params, ext) {
  const gittxts = await tools.findGitTxt(ext.rootDir);
  const repositories = [];
  const needPull = [];
  
  for (let i = 0; i < gittxts.length; i++) {
    const gittxt = gittxts[i];
    await tools.findGitRepository(gittxt, repositories);
  }

  for (let r = 0; r < repositories.length; r++) {
    const repository = repositories[r];
    const exist = await fsp.stat(repository.dir + '/' + repository.repositoryName).catch((reason) => {});
    exist && needPull.push(repository);
  }

  const data = needPull.reduce((prev, current, index) => {
    const item = [prev];

    // 分支
    const branch = current.params.b || 'master';

    item.push(`cd ${current.dir}/${current.repositoryName}`);

    item.push(`currentbranch=$(git symbolic-ref --short HEAD)`);
    item.push('if [[ $currentbranch != "'+ branch +'" ]];');
    item.push('then');
    item.push(`    git checkout -q -f -b ${branch} origin/${branch};`);
    item.push('fi');
    
    item.push(`git pull -q`);

    prev = item.join('\n');
    
    return prev;
  }, '#! /bin/bash');

  // 写入文件
  await fsp.writeFile(`${ext.rootDir}/gitb.sh`, data);
}

module.exports = pull;
