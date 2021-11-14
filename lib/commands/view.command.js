const { execSync } = require('child_process')

const { formatDateString } = require('../utils/date.utils')

const viewCommand = (packageName, options) => {
  const versionsJson = execSync(`npm view ${packageName} time --json`)
  if (!versionsJson) throw new Error(`No versions found for: ${packageName}`)
  const versions = JSON.parse(versionsJson)

  const versionPublishDate = versions[options.version]

  const packageVersions = {
    publishDate: formatDateString(versionPublishDate),
  }

  return {
    packageVersions,
  }
}

module.exports = {
  viewCommand,
}
