const { execSync } = require('child_process')

const { formatDateString } = require('../utils/date.utils')

// -----------------------------------------------------------------------------

const parseDependencies = (dependencies, callback) => {
  Object.entries(dependencies).forEach(([name, package]) => {
    callback(name, package.version)
    if (package.dependencies) parseDependencies(package.dependencies, callback)
  })
}

const getPackageVersions = (package) => {
  const versionsJson = execSync(`npm view ${package.name} time --json`)
  if (versionsJson) return JSON.parse(versionsJson)
  return []
}

// -----------------------------------------------------------------------------

const listCommand = (packageList, options) => {
  const packageListFilter = packageList?.length ? packageList.join(' ') : ''
  const depthFilter = options.depth ? `--depth ${options.depth}` : ''
  const allFilter = options.all ? `--all` : ''

  const allPackagesJson = execSync(
    `npm list ${packageListFilter} ${depthFilter} ${allFilter} --json`,
  )

  if (!allPackagesJson) throw new Error('No packages to inspect')
  const allPackagesData = JSON.parse(allPackagesJson)

  const packages = []

  parseDependencies(allPackagesData.dependencies, (name, version) => {
    packages.push({ name, version })
  })

  const packagePublishDates = packages.map((package) => {
    const packageVersions = getPackageVersions(package)

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
    packagePublishDates,
  }
}

module.exports = {
  listCommand,
}
