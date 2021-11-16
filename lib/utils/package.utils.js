const { LATEST_VERSION } = require('../config/constants.config')

const getPackageSyntaxInfo = (package) => {
  const isFile = package.includes('file:')
  const isSymlink = package.includes('link:')
  const isURL = package.includes('http://') || package.includes('https://')
  const hasScope = package.startsWith('@')

  return {
    isFile,
    isSymlink,
    isURL,
    hasScope,
  }
}

const getPackageData = (package) => {
  const hasScope = package.startsWith('@')
  const packageNameWithoutScope = hasScope ? package.slice(1) : package
  const [packageName, version] = packageNameWithoutScope.split('@')
  const packageNameWithScope = hasScope ? `@${packageName}` : packageName
  return {
    name: packageNameWithScope,
    version: version || LATEST_VERSION,
  }
}

module.exports = {
  getPackageSyntaxInfo,
  getPackageData,
}
