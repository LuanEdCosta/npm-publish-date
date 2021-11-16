const { execSync } = require('child_process')

const getPackageLatestVersion = (package) => {
  const versionJson = execSync(`npm view ${package} version --json`)
  return JSON.parse(versionJson)
}

const getPackageVersions = (package) => {
  const versionsJson = execSync(`npm view ${package} versions --json`)
  return JSON.parse(versionsJson)
}

const getPackagePublishDates = (package) => {
  const publishDatesJson = execSync(`npm view ${package} time --json`)
  return JSON.parse(publishDatesJson)
}

const getProjectPackages = ({ packages, all, depth }) => {
  const packagesFilter = packages?.length ? packages.join(' ') : ''
  const depthFilter = depth ? `--depth ${depth}` : ''
  const allFilter = all ? `--all` : ''

  const packagesJson = execSync(
    `npm list ${packagesFilter} ${depthFilter} ${allFilter} --json`,
  )

  return JSON.parse(packagesJson)
}

module.exports = {
  getPackageLatestVersion,
  getPackageVersions,
  getPackagePublishDates,
  getProjectPackages,
}
