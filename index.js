const core = require('@actions/core');
const exec = require('@actions/exec');
const tc = require('@actions/tool-cache');
const io = require('@actions/io');

const fs = require('fs');
const path = require('path');


const PLRL_URL = "https://app.plural.sh/artifacts/plural/plural?platform=linux&arch=amd64"
const VSN = '1.0' //
async function run() {
  try {
    await download();
    core.info("installed plural")
    await setupConfig();
    await exec.exec("plural --help");
  } catch (error) {
    core.setFailed(error.message);
  }
}

async function download() {
  core.info(`donwload URL: ${PLRL_URL}`)
  const p = await tc.downloadTool(PLRL_URL);
  core.info(`downloaded plural to ${p}`)
  cachedPath = await tc.cacheFile(p, 'plural', 'plural', VSN);
  await exec.exec(`chmod +x ${cachedPath}/plural`)
  core.addPath(cachedPath)
}

async function setupConfig() {
  let conf = core.getInput('config');
  const homedir = process.env.HOME
  await io.mkdirP(path.join(homedir, ".plural"))
  await fs.writeFile(path.join(homedir, ".plural", "config.yml"), conf, 'utf8', (err) => {
    if (err) throw err
    core.info('wrote config file')
  })
}

run();
