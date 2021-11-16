const { dateDiffInDays } = require('../utils/date.utils')
const { getPackageData } = require('../utils/package.utils')
const { LATEST_VERSION } = require('../config/constants.config')
const {
  getPackageLatestVersion,
  getPackageVersions,
  getPackagePublishDates,
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

const getPublishDates = (parsedPackages) => {
  return parsedPackages.map((parsedPackage) => {
    return getPackagePublishDates(parsedPackage.name)
  })
}

const validatePublishDates = ({ parsedPackages, publishDates, minDays }) => {
  let isValid = true
  const invalidPackages = []

  const addInvalidPackage = (parsedPackage, reason) => {
    invalidPackages.push({
      ...parsedPackage,
      reason,
    })
  }

  parsedPackages.forEach((parsedPackage, index) => {
    const packagePublishDates = publishDates[index]
    const semanticVersion = parsedPackage.semanticVersion

    const versionPublishDate = new Date(packagePublishDates[semanticVersion])
    const diffInDays = dateDiffInDays(versionPublishDate, new Date())

    if (diffInDays < minDays) {
      isValid = false

      const defaultMessage = `The package was published ${diffInDays} days ago`

      const messages = {
        0: 'The package was published today',
        1: 'The package was published yesterday',
      }

      addInvalidPackage(parsedPackage, messages[diffInDays] || defaultMessage)
      return
    }
  })

  return { isValid, invalidPackages }
}

const validateCommand = (packages, options) => {
  throwPackagesNotValidError(packages)
  const parsedPackages = parsePackages(packages)
  throwVersionNeverPublishedError(parsedPackages)
  const publishDates = getPublishDates(parsedPackages)

  const { isValid, invalidPackages } = validatePublishDates({
    packages,
    parsedPackages,
    publishDates,
    minDays: options.minDays,
  })

  return { isValid, invalidPackages }
}

module.exports = {
  validateCommand,
}
