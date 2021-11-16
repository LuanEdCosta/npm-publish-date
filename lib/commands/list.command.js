const { formatDateString } = require('../utils/date.utils')
const {
  getProjectPackages,
  getPackagePublishDates,
} = require('../services/npm.service')

// -----------------------------------------------------------------------------

const parsePackages = (dependencies, callback) => {
  Object.entries(dependencies).forEach(([name, package]) => {
    callback(name, package.version)
    if (package.dependencies) parsePackages(package.dependencies, callback)
  })
}

// -----------------------------------------------------------------------------

const listCommand = (packages, options) => {
  const projectPackages = getProjectPackages({
    packages,
    depth: options.depth,
    all: options.all,
  })

  const parsedPackages = []
  parsePackages(projectPackages.dependencies, (name, version) => {
    parsedPackages.push({ name, version })
  })

  const publishDates = parsedPackages.map((package) => {
    const packageVersions = getPackagePublishDates(package.name)
    const createdAt = packageVersions.created
    const updatedAt = packageVersions.modified
    const currentVersionPublishDate = packageVersions[package.version]

    return {
      ...package,
      createdAt: formatDateString(createdAt),
      updatedAt: formatDateString(updatedAt),
      currentVersionPublishDate: formatDateString(currentVersionPublishDate),
    }
  })

  return {
    publishDates,
  }
}

module.exports = {
  listCommand,
}
