const { formatDateString } = require('../utils/date.utils')
const { LATEST_VERSION } = require('../config/constants.config')
const {
  getPackageData,
  getPackageSyntaxInfo,
  getExactSemanticVersion,
} = require('../utils/package.utils')
const {
  getPackageLatestVersion,
  getPackagePublishDates,
  getPackageVersions,
  getPackageDependencies,
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
  parsedPackages.forEach(({ name, version, semanticVersion }) => {
    const isLatest = version === LATEST_VERSION
    if (isLatest) return

    const packageVersions = getPackageVersions(name)
    const isVersionValid = packageVersions.includes(semanticVersion)
    if (isVersionValid) return

    throw new Error(
      `The version ${semanticVersion} of the ${name} package was never published.`,
    )
  })
}

const addPublishDateToPackages = (parsedPackages) => {
  return parsedPackages.map((parsedPackage) => {
    const publishDates = getPackagePublishDates(parsedPackage.name)
    const publishDate = publishDates[parsedPackage.semanticVersion]
    const formattedPublishDate = formatDateString(publishDate)

    return {
      ...parsedPackage,
      publishDate,
      formattedPublishDate,
    }
  })
}

const parseDependenciesRecursively = (packageName, maxDepth, currentDepth) => {
  const dependencies = getPackageDependencies(packageName)
  return Object.entries(dependencies).map(([name, version]) => {
    const semanticVersion = getExactSemanticVersion(version)
    const publishDates = getPackagePublishDates(name)
    const publishDate = publishDates[semanticVersion]

    const parsedDependency = {
      name,
      version,
      semanticVersion,
      publishDate: publishDate || '',
      formattedPublishDate: publishDate ? formatDateString(publishDate) : '',
    }

    if (currentDepth <= maxDepth) {
      parsedDependency.dependencies = parseDependenciesRecursively(
        `${name}@${semanticVersion}`,
        maxDepth,
        currentDepth + 1,
      )

      if (parsedDependency.dependencies.length === 0) {
        delete parsedDependency.dependencies
      }
    }

    return parsedDependency
  })
}

const addDependenciesToPackages = (parsedPackagesWithPublishDate, maxDepth) => {
  return parsedPackagesWithPublishDate.map((parsedPackageWithPublishDate) => {
    const name = parsedPackageWithPublishDate.name
    const semanticVersion = parsedPackageWithPublishDate.semanticVersion
    const nameWithVersion = `${name}@${semanticVersion}`

    const dependencies = parseDependenciesRecursively(
      nameWithVersion,
      maxDepth,
      2,
    )

    if (dependencies.length) {
      return {
        ...parsedPackageWithPublishDate,
        dependencies,
      }
    }

    return parsedPackageWithPublishDate
  })
}

const viewCommand = (packages, options) => {
  throwPackagesNotValidError(packages)
  const parsedPackages = parsePackages(packages)
  throwVersionNeverPublishedError(parsedPackages)
  const packagesWithPublishDate = addPublishDateToPackages(parsedPackages)

  if (options.depth > 0 || options.all) {
    const packagesAndDependenciesWithPublishDate = addDependenciesToPackages(
      packagesWithPublishDate,
      options.depth || Number.MAX_SAFE_INTEGER,
    )

    return {
      packagesWithPublishDate: packagesAndDependenciesWithPublishDate,
    }
  }

  return {
    packagesWithPublishDate,
  }
}

module.exports = {
  viewCommand,
}
