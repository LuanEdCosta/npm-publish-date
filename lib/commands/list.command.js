const { formatDateString } = require('../utils/date.utils')
const {
  getProjectPackages,
  getPackagePublishDates,
} = require('../services/npm.service')

const getParsedPackages = (dependencies) => {
  return Object.entries(dependencies).map(([name, package]) => {
    const version = package.version

    const packageVersions = getPackagePublishDates(name)
    const publishDate = packageVersions[version]

    const parsedPackage = {
      name,
      version,
      publishDate,
      formattedPublishDate: formatDateString(publishDate),
    }

    if (package.dependencies) {
      parsedPackage.dependencies = getParsedPackages(package.dependencies)
    }

    return parsedPackage
  })
}

const listCommand = (packages, options) => {
  const projectPackages = getProjectPackages({
    packages,
    all: options.all,
    depth: options.depth,
  })

  const packagesWithPublishDate = getParsedPackages(
    projectPackages.dependencies,
  )

  return {
    packagesWithPublishDate,
  }
}

module.exports = {
  listCommand,
}
