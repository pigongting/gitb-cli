const tools = require('../utils/index');
const fsp = require('fs/promises');
const url = require('url');

/**
 * 克隆
 */
async function clone(params, ext) {
  const gittxts = await tools.findGitTxt(ext.rootDir);
  const repositories = [];
  const needClone = [];
  
  for (let i = 0; i < gittxts.length; i++) {
    const gittxt = gittxts[i];
    await tools.findGitRepository(gittxt, repositories);
  }

  for (let r = 0; r < repositories.length; r++) {
    const repository = repositories[r];
    await fsp.stat(repository.dir + '/' + repository.repositoryName).catch((reason) => {
      needClone.push(repository);
    });
  }

  const data = needClone.reduce((prev, current, index) => {
    const item = [prev];

    // 解析路径
    const { protocol, host, pathname } = url.parse(current.repositoryHttp);

    // 分支
    const branch = current.params.b || 'master';
    
    item.push(`cd ${current.dir}`);

    item.push(`git clone -b ${branch} ${protocol}//${params.u}:${params.p}@${host}${pathname} ${current.repositoryName}`);
    // item.push(`git clone ${current.repositorySsh} ${current.repositoryName}`);

    prev = item.join('\n');
    
    return prev;
  }, '#! /bin/bash');

  // 写入文件
  await fsp.writeFile(`${ext.rootDir}/gitb.sh`, data);
  
  // console.log("写入完成");
  // console.log(fsp);
  // console.log(params);
  // console.log(gittxts);
  // console.log(repositories);
  // console.log(needClone);
}

module.exports = clone;

/*
{
  dir: '/Users/pigongting/Documents/company/kaisatech/sources/rd-06-prj/50-kic/50-kic-saas-h5/console-store/main/demo/src/utils',
  repositoryName: 'weburl',
  repositorySsh: 'git@192.168.118.72:rd-06-prj/xx-tpl/plat-store/console/utils/weburl.git',
  repositoryHttp: 'http://192.168.118.72/rd-06-prj/xx-tpl/plat-store/console/utils/weburl.git',
  params: {}
}
*/
