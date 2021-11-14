#!/usr/bin/env node

const { execSync } = require('child_process')
const chalk = require('chalk')

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

const formatDateString = (date) => {
  return new Date(date).toLocaleString()
}

// -----------------------------------------------------------------------------

const allPackagesJson = execSync('npm list --json')

if (!allPackagesJson) {
  console.log('No packages to inspect')
  return
}

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

console.log('')
console.log(chalk.blue('Packages Publish Date'))
console.log('')
console.log(packagePublishDates)
console.log('')

console.log('You can check why a package is installed with:')
console.log(chalk.blue('npm why {packageName}'))
console.log('')
console.log('To inspect more details of a package use:')
console.log(chalk.blue('npm view {packageName}'))
console.log('')