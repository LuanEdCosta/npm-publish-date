#!/usr/bin/env node

const chalk = require('chalk')
const { Command } = require('commander')

const packageJson = require('../package.json')
const { listCommand } = require('./commands/list.command')
const { viewCommand } = require('./commands/view.command')
const { validateCommand } = require('./commands/validate.command')

const commanderListCommand = new Command('list')
  .description('List the publish date of installed packages')
  .usage('[packages...] [options]')
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
  .usage('<packageName> [options]')
  .argument('<packageName>', 'Name of a package')
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

const commanderValidateCommand = new Command('validate')
  .description('Validate the publish date of packages')
  .usage('<packages...> [options]')
  .argument(
    '<packages...>',
    'Package names written in this format: @scope/package@version',
  )
  .option(
    '-m, --min-days <minDays>',
    'Minimum number of days that the package was published',
    0,
  )
  .option('-j, --json', 'Show result in JSON format', false)
  .option(
    '-f, --forward',
    'Forward packages when publish dates are valid',
    false,
  )
  .action((packages, options) => {
    const { isValid, invalidPackages } = validateCommand(packages, options)

    if (options.json && options.forward) {
      throw new Error(
        'The --json and --forward options cannot be used together',
      )
    }

    if (options.json) {
      console.log(JSON.stringify(isValid, null, 2))
      return
    }

    if (options.forward) {
      console.log(packages.join(' '))
      return
    }

    console.log('')
    console.log(chalk.cyan('Validate Packages:'))
    console.log(packages.join(' '))
    console.log('')

    if (isValid) {
      console.log(chalk.green('ALL PACKAGES ARE VALID'))
    } else {
      console.log(chalk.red('THERE ARE SOME INVALID PACKAGES'))
      console.log('')
      console.log(invalidPackages)
    }

    console.log('')
  })

try {
  new Command('npd')
    .version(packageJson?.version || 'Not Defined')
    .usage('<command> [options]')
    .addCommand(commanderListCommand)
    .addCommand(commanderViewCommand)
    .addCommand(commanderValidateCommand)
    .parse(process.argv)
} catch (e) {
  console.log('')
  console.log(chalk.bgRed('An Error Ocurred'))
  console.log(e)
  console.log('')
}
