const core = require('@actions/core');
const exec = require('@actions/exec');
const tc = require('@actions/tool-cache');

const PLRL_URL = "https://app.plural.sh/artifacts/plural/plural?platform=linux&arch=amd64"

async function run() {
  try {
    core.info(`donwload URL:         ${PLRL_URL}`)
    const path = await tc.downloadTool(PLRL_URL);
    core.addPath(path)
    await setupConfig();
    await exec.exec("plural --help");
  } catch (error) {
    core.setFailed(error.message);
  }
}

async function setupConfig() {
  let conf = core.getInput('config');
  await io.mkdirP('path/to/make')
}

run();
