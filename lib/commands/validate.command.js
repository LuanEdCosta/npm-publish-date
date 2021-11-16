const { execSync, exec } = require('child_process')

const { dateDiffInDays } = require('../utils/date.utils')

const throwPackagesNotValidError = (packages) => {
  packages.forEach((package) => {
    const isFile = package.includes('file:')
    const isSymlink = package.includes('link:')
    const isURL = package.includes('http://') || package.includes('https://')

    if (isFile || isSymlink || isURL) {
      throw new Error(
        `Cannot validate the package "${package}" because this format is not supported.`,
      )
    }
  })
}

const getPackageLatestVersion = (packageName) => {
  const versionJson = execSync(`npm view ${packageName} version --json`)
  return JSON.parse(versionJson)
}

const parsePackages = (packages) => {
  return packages.map((package) => {
    const hasScope = package.startsWith('@')

    const packageNameWithoutScope = hasScope ? package.slice(1) : package
    const [packageName, version] = packageNameWithoutScope.split('@')
    const packageNameWithScope = hasScope ? `@${packageName}` : packageName

    if (version) {
      return {
        name: packageNameWithScope,
        version: version,
        semanticVersion: version,
      }
    }

    return {
      name: packageNameWithScope,
      version: 'latest',
      semanticVersion: getPackageLatestVersion(packageNameWithScope),
    }
  })
}

const getPackageVersions = (packageName) => {
  const versionsJson = execSync(`npm view ${packageName} versions --json`)
  return JSON.parse(versionsJson)
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
    const publishDatesJson = execSync(
      `npm view ${parsedPackage.name} time --json`,
    )
    return JSON.parse(publishDatesJson)
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
