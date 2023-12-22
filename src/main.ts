import * as core from '@actions/core'
import * as tc from '@actions/tool-cache'
import fs from 'fs'

const ARCH = 'amd64'
const DEFAULT_VERSION = 'v0.3.20'
const ERROR_MESSAGE = 'Failed to install goss'

interface CommandsMap {
  [command: string]: string
}

function getUrls(version: string): CommandsMap {
  return {
    goss: `https://github.com/aelsabbahy/goss/releases/download/${version}/goss-linux-${ARCH}`,
    dgoss: `https://raw.githubusercontent.com/aelsabbahy/goss/${version}/extras/dgoss/dgoss`,
    dcgoss: `https://raw.githubusercontent.com/aelsabbahy/goss/${version}/extras/dcgoss/dcgoss`,
    kgoss: `https://raw.githubusercontent.com/aelsabbahy/goss/${version}/extras/kgoss/kgoss`
  }
}

function combine(parts: CommandsMap[]): CommandsMap {
  return parts.reduce((result, part) => ({ ...result, ...part }), {})
}

function restore(urls: CommandsMap, version: string): CommandsMap {
  const results = Object.entries(urls).map(([command, url]) => {
    const existing = tc.find(command, version, ARCH)
    if (existing) {
      core.addPath(existing)
      return {}
    }
    return { [command]: url }
  })
  return combine(results)
}

async function download(urls: CommandsMap): Promise<CommandsMap> {
  const results = await Promise.all(
    Object.entries(urls).map(async ([command, url]) => {
      const downloaded = await tc.downloadTool(url)
      return { [command]: downloaded }
    })
  )
  return combine(results)
}

async function chmod(paths: CommandsMap, mode: string): Promise<void> {
  await Promise.all(
    Object.values(paths).map(async path => {
      return new Promise<void>((resolve, reject) => {
        fs.chmod(path, mode, err => {
          err ? reject(err) : resolve()
        })
      })
    })
  )
}

async function cache(
  paths: CommandsMap,
  version: string
): Promise<CommandsMap> {
  const results = await Promise.all(
    Object.entries(paths).map(async ([command, path]) => {
      const cached = await tc.cacheFile(path, command, command, version, ARCH)
      return { [command]: cached }
    })
  )
  return combine(results)
}

function addPaths(paths: CommandsMap): void {
  for (const path of Object.values(paths)) {
    core.addPath(path)
  }
}

async function run(): Promise<void> {
  try {
    const version: string =
      core.getInput('version', { required: false }) || DEFAULT_VERSION
    const urls = getUrls(version)
    const missing = restore(urls, version)
    const downloaded = await download(missing)
    await chmod(downloaded, '755')
    const cached = await cache(downloaded, version)
    addPaths(cached)
  } catch (error) {
    const message = error instanceof Error ? error.message : undefined
    core.setFailed(message || ERROR_MESSAGE)
  }
}

run()
