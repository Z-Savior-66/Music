const fs = require('fs')
const ghRelease = require('gh-release')
const token = require('./githubToken')
const pkg = require('../../package.json')
const { jp } = require('./index')

const changeLog = fs.readFileSync(jp('../changeLog.md'), 'utf-8')

/**
 * 从 package.json 的 repository.url 解析 GitHub 仓库归属。
 *
 * 发布脚本原先用 pkg.author / pkg.name 拼 owner/repo，与实际仓库不一致会导致
 * 发布到错误的地方；解析失败时直接抛错，避免静默发到错误的仓库。
 */
const parseRepo = (repoUrl) => {
  const match = /github\.com[:/]([^/]+)\/([^/.]+)/.exec(repoUrl || '')
  if (!match) throw new Error('无法从 package.json 解析仓库地址')
  return { owner: match[1], repo: match[2] }
}

const { owner, repo } = parseRepo(pkg.repository?.url)

const assetsDir = '../assets'

const getBuildFiles = () => {
  const files = []
  const pathRegExp = [
    /latest\.yml$/,
    /\.exe$/,
    /\.blockmap$/,
  ]
  const names = fs.readdirSync(jp(assetsDir), 'utf8')
  names.forEach(name => {
    pathRegExp.forEach(regexp => {
      if (regexp.test(name)) files.push(jp(assetsDir, name))
    })
  })
  return files
}

// all options have defaults and can be omitted
const options = {
  tag_name: `v${pkg.version}`,
  target_commitish: 'main',
  name: `v${pkg.version}`,
  body: changeLog,
  draft: false,
  prerelease: false,
  repo,
  owner,
  endpoint: 'https://api.github.com', // for GitHub enterprise, use http(s)://hostname/api/v3
  auth: {
    token,
  },
  assets: getBuildFiles(),
}


const publishRelease = ({ isDraft = false, isPrerelease = false, target_commitish = 'main' }) => new Promise((resolve, reject) => {
  options.target_commitish = target_commitish
  options.draft = isDraft
  options.prerelease = isPrerelease

  ghRelease(options, function(err, result) {
    if (err) return reject(err)
    resolve(result)
    console.log(result) // create release response: https://developer.github.com/v3/repos/releases/#response-4
  })
})

module.exports = publishRelease
module.exports.parseRepo = parseRepo

