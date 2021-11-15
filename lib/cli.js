#!/usr/bin/env node

const chalk = require('chalk')
const { Command } = require('commander')

const packageJson = require('../package.json')
const { listCommand } = require('./commands/list.command')
const { viewCommand } = require('./commands/view.command')

const commanderListCommand = new Command('list')
  .description('List versions of all node_modules packages')
  .argument('[packages...]', 'Package names to filter', [])
  .option('-j, --json', 'Show results in JSON format', false)
  .option('-a, --all', 'Show the publish date of all packages', false)
  .option('-d, --depth <depth>', 'Filter packages by depth', undefined)
  .action((packages, options) => {
    const { packagePublishDates } = listCommand(packages, options)

    if (options.json) {
      console.log(JSON.stringify(packagePublishDates, null, 2))
      return
    }

    console.log('')
    console.log(chalk.blue('Publish Dates:'))
    console.log('')
    console.log(packagePublishDates)
    console.log('')

    console.log('You can check why a package is installed with:')
    console.log(chalk.blue('npm why {packageName}'))
    console.log('')
    console.log('To inspect more details of a package use:')
    console.log(chalk.blue('npm view {packageName}'))
    console.log('')
  })

const commanderViewCommand = new Command('view')
  .description('See versions of a single package')
  .argument('<packageName>')
  .option('-v, --version <version>', 'Package version', 'modified')
  .option('-j, --json', 'Show result in JSON format', false)
  .action((packageName, options) => {
    const { packageVersions } = viewCommand(packageName, options)

    if (options.json) {
      console.log(JSON.stringify(packageVersions, null, 2))
      return
    }

    console.log('')
    console.log('Package Name:', chalk.blue(packageName))
    console.log('Package Version:', chalk.blue(options.version))
    console.log('')
    console.log(chalk.cyan('Publish Dates:'))
    console.log('')
    console.log(packageVersions)
    console.log('')
  })

try {
  new Command('npd')
    .version(packageJson?.version || 'Not Defined')
    .addCommand(commanderListCommand)
    .addCommand(commanderViewCommand)
    .parse(process.argv)
} catch (e) {
  console.log('')
  console.log(chalk.bgRed('An Error Ocurred'))
  console.log(e)
  console.log('')
}