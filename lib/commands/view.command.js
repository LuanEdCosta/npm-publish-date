const { formatDateString } = require('../utils/date.utils')
const { LATEST_VERSION } = require('../config/constants.config')
const {
  getPackageData,
  getPackageSyntaxInfo,
} = require('../utils/package.utils')
const {
  getPackageLatestVersion,
  getPackagePublishDates,
  getPackageVersions,
} = require('../services/npm.service')

const throwPackagesNotValidError = (packages) => {
  packages.forEach((package) => {
    const { isFile, isSymlink, isURL } = getPackageSyntaxInfo(package)

    if (isFile || isSymlink || isURL) {
      throw new Error(
        `Cannot validate the package "${package}" because this format is not supported.`,
      )
    }
  })
}

const parsePackages = (packages) => {
  return packages.map((package) => {
    const { name, version } = getPackageData(package)
    const isLatest = version === LATEST_VERSION

    return {
      name,
      version,
      semanticVersion: isLatest ? getPackageLatestVersion(name) : version,
    }
  })
}

const throwVersionNeverPublishedError = (parsedPackages) => {
  parsedPackages.forEach((parsedPackage) => {
    const packageVersions = getPackageVersions(parsedPackage.name)
    if (!packageVersions.includes(parsedPackage.semanticVersion)) {
      throw new Error(
        `The version ${parsedPackage.semanticVersion} of the ${parsedPackage.name} package does not exist.`,
      )
    }
  })
}

const getPackagesWithPublishDate = (parsedPackages) => {
  return parsedPackages.map((parsedPackage) => {
    const publishDates = getPackagePublishDates(parsedPackage.name)
    const publishDateString = publishDates[parsedPackage.semanticVersion]
    const formattedPublishDate = formatDateString(publishDateString)

    return {
      ...parsedPackage,
      publishDate: formattedPublishDate,
    }
  })
}

const viewCommand = (packages) => {
  throwPackagesNotValidError(packages)
  const parsedPackages = parsePackages(packages)
  throwVersionNeverPublishedError(parsedPackages)
  const packagesWithPublishDate = getPackagesWithPublishDate(parsedPackages)

  return {
    packagesWithPublishDate,
  }
}

module.exports = {
  viewCommand,
}
