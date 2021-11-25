const { dateDiffInDays } = require('../utils/date.utils')
const { viewCommand } = require('./view.command')

const getErrorMessage = (diffInDays) => {
  const defaultMessage = `The package was published ${diffInDays} days ago`

  const messages = {
    0: 'The package was published today',
    1: 'The package was published yesterday',
  }

  return messages[diffInDays] || defaultMessage
}

const validatePublishDateRecursively = ({
  packages,
  minDays,
  addInvalidPackage,
}) => {
  let isValid = true

  packages.forEach((package) => {
    const versionPublishDate = new Date(package.publishDate)
    const diffInDays = dateDiffInDays(versionPublishDate, new Date())

    if (diffInDays < minDays) {
      isValid = false
      const errorMessage = getErrorMessage(diffInDays)
      const packageWithoutDependencies = { ...package }
      delete packageWithoutDependencies.dependencies
      addInvalidPackage(packageWithoutDependencies, errorMessage)
    } else if (package.dependencies) {
      isValid = validatePublishDateRecursively({
        packages: package.dependencies,
        minDays,
        addInvalidPackage,
      })
    }
  })

  return isValid
}

const validateCommand = (packages, options) => {
  const { packagesWithPublishDate } = viewCommand(packages, {
    depth: options.depth,
    all: options.all,
  })

  const invalidPackages = []

  const addInvalidPackage = (package, reason) => {
    invalidPackages.push({
      ...package,
      reason,
    })
  }

  const isValid = validatePublishDateRecursively({
    packages: packagesWithPublishDate,
    minDays: options.minDays,
    addInvalidPackage,
  })

  return { isValid, invalidPackages, packagesWithPublishDate }
}

module.exports = {
  validateCommand,
}
