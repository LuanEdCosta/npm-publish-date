const { execSync } = require('child_process')

const getPackageLatestVersion = (package) => {
  const command = `npm view ${package} version --json`
  const versionJson = execSync(command).toString()
  return JSON.parse(versionJson)
}

const getPackageVersions = (package) => {
  const command = `npm view ${package} versions --json`
  const versionsJson = execSync(command).toString()
  return JSON.parse(versionsJson)
}

const getPackagePublishDates = (package) => {
  const command = `npm view ${package} time --json`
  const publishDatesJson = execSync(command).toString()
  return JSON.parse(publishDatesJson)
}

const getProjectPackages = ({ packages, all, depth }) => {
  const packagesFilter = packages?.length ? packages.join(' ') : ''
  const depthFilter = depth ? `--depth ${depth}` : ''
  const allFilter = all ? `--all` : ''
  const command = `npm list ${packagesFilter} ${depthFilter} ${allFilter} --json`
  const packagesJson = execSync(command).toString()
  return JSON.parse(packagesJson)
}

const getPackageDependencies = (package) => {
  const command = `npm view ${package} dependencies --json`
  const dependenciesJson = execSync(command, { encoding: 'utf-8' }).toString()
  return JSON.parse(dependenciesJson || '{}')
}

module.exports = {
  getPackageLatestVersion,
  getPackageVersions,
  getPackagePublishDates,
  getProjectPackages,
  getPackageDependencies,
}
