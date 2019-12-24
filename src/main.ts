import * as core from '@actions/core'
import * as tc from '@actions/tool-cache'

const TOOL = 'goss'
const ARCH = 'amd64'

interface CommandsMap {
  [command: string]: string
}

function getUrls(version: string): CommandsMap {
  return {
    goss: `https://github.com/aelsabbahy/goss/releases/download/${version}/goss-linux-${ARCH}`,
    dgoss: `https://raw.githubusercontent.com/aelsabbahy/goss/${version}/extras/dgoss/dgoss`
  }
}

function combine(parts: CommandsMap[]): CommandsMap {
  return parts.reduce((result, part) => ({ ...result, ...part }), {})
}

async function download(urls: CommandsMap): Promise<CommandsMap> {
  const results = await Promise.all(
    Object.entries(urls).map(async ([command, url]) => {
      core.debug(`Downloading ${command} from ${url}`)
      const downloaded = await tc.downloadTool(url)
      return { [command]: downloaded }
    })
  )
  return combine(results)
}

async function cache(
  paths: CommandsMap,
  version: string
): Promise<CommandsMap> {
  const results = await Promise.all(
    Object.entries(paths).map(async ([command, path]) => {
      core.debug(`Caching ${command} ${version}`)
      const cached = await tc.cacheFile(path, command, TOOL, version, ARCH)
      return { [command]: cached }
    })
  )
  return combine(results)
}

async function run(): Promise<void> {
  try {
    const version: string = core.getInput('version')
    const existing = tc.find(TOOL, version, ARCH)
    if (existing) {
      core.debug(`Found cached ${TOOL} ${version}. Restoring.`)
      core.addPath(existing)
      return
    }

    const downloaded = await download(getUrls(version))
    await cache(downloaded, version)
    const cached = tc.find(TOOL, version, ARCH)
    const [directory] = Object.values(cached)
    if (!directory) {
      core.setFailed(`Failed to instal and/or cache ${TOOL} files`)
      return
    }
    core.addPath(directory)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
