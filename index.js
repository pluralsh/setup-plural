const core = require('@actions/core');
const exec = require('@actions/exec');
const tc = require('@actions/tool-cache');
const io = require('@actions/io');
const jwt_decode = require("jwt-decode");


const fs = require('fs');
const path = require('path');
const cmp = require('semver-compare');

const PLRL_URL_FMT_LEGACY = "https://github.com/pluralsh/plural-cli/releases/download/vVSN/plural-cli_VSN_Linux_PLAT.tar.gz"
const PLRL_URL_FMT = "https://github.com/pluralsh/plural-cli/releases/download/vVSN/plural-cli_console_VSN_Linux_PLAT.tar.gz"

async function run() {
  try {
    const vsn = core.getInput('vsn', { required: false });
    const plat = core.getInput('plat', { required: false }) || 'amd64'
    await download(vsn, plat);
    core.info("installed plural")
    await setupConfig(vsn);
    await exec.exec("plural --help");
  } catch (error) {
    core.setFailed(error.message);
  }
}

function urlFormat(vsn) {
  if (cmp(vsn, '0.6.23') >= 0) return PLRL_URL_FMT
  return PLRL_URL_FMT_LEGACY
}

async function download(vsn, plat) {
  const url = urlFormat(vsn).replace(/VSN/g, vsn)
                          .replace(/PLAT/g, plat)
  core.info(`download URL: ${url}`)
  const p = await tc.downloadTool(url);
  const folder = await tc.extractTar(p);
  core.info(`downloaded plural to ${folder}`)
  cachedPath = await tc.cacheDir(folder, 'plural', vsn);
  await exec.exec(`chmod +x ${cachedPath}/plural`)
  core.addPath(cachedPath)
}

async function setupConfig(vsn) {
  let conf = core.getInput('config');
  if (!conf) {
    if (cmp(vsn, '0.7.0') >= 0) {
      await setupTempConfig()
    } else {
      core.setFailed("you must use versions greater than 0.7.0 with temporary credentials")
    }
  
    return
  }

  const homedir = process.env.HOME
  await io.mkdirP(path.join(homedir, ".plural"))
  await fs.writeFile(path.join(homedir, ".plural", "config.yml"), conf, 'utf8', (err) => {
    if (err) throw err
    core.info('wrote config file')
  })
}

async function setupTempConfig() {
  const token = await core.getIDToken()
  const email = core.getInput('email')
  if (!email) {
    core.setFailed("`email` is required when authenticating with oidc")
    return
  }
  const claims = jwt_decode(token)
  core.info(`logging in with jwt subject: ${claims.sub}`)
  await exec.exec(`plural auth oidc github_actions --token ${token} --email ${email}`)
}

run();
