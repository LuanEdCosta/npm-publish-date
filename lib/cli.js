#!/usr/bin/env node

const util = require('util')
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
  .option('-a, --all', 'Get the publish date of the entire package tree', false)
  .option('-d, --depth <depth>', 'Filter packages by depth', undefined)
  .action((packages, options) => {
    const { packagesWithPublishDate } = listCommand(packages, options)

    if (options.json) {
      console.log(JSON.stringify(packagesWithPublishDate, null, 2))
      return
    }

    console.log('')
    console.log(chalk.blue('Packages With Publish Date:'))
    console.log('')
    console.log(util.inspect(packagesWithPublishDate, false, null, true))
    console.log('')

    console.log('You can check why a package is installed with:')
    console.log(chalk.blue('npm why {packageName}'))
    console.log('')
    console.log('To inspect more details of a package use:')
    console.log(chalk.blue('npm view {packageName}'))
    console.log('')
  })

const commanderViewCommand = new Command('view')
  .description('See the publish date of packages')
  .usage('<packages...> [options]')
  .argument(
    '<packages...>',
    'Package names written in this format: @scope/package@version',
  )
  .option('-j, --json', 'Show result in JSON format', false)
  .option('-a, --all', 'Get the publish date of the entire package tree', false)
  .option('-d, --depth <depth>', 'Filter packages by depth', undefined)
  .action((packages, options) => {
    const { packagesWithPublishDate } = viewCommand(packages, options)

    if (options.json) {
      console.log(JSON.stringify(packagesWithPublishDate, null, 2))
      return
    }

    console.log('')
    console.log(chalk.cyan('Packages With Publish Date:'))
    console.log('')
    console.log(util.inspect(packagesWithPublishDate, false, null, true))
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
  .option('-a, --all', 'Validate the entire package tree', false)
  .option('-d, --depth <depth>', 'Filter packages by depth', undefined)
  .option('-j, --json', 'Show result in JSON format', false)
  .action((packages, options) => {
    const { isValid, invalidPackages, packagesWithPublishDate } =
      validateCommand(packages, options)

    if (options.json) {
      if (isValid) {
        const data = { isValid, packages: packagesWithPublishDate }
        console.log(JSON.stringify(data, null, 2))
      } else {
        console.log(JSON.stringify({ isValid, invalidPackages }, null, 2))
      }
      return
    }

    if (isValid) {
      console.log('')
      console.log(chalk.cyan('Packages:'))
      console.log('')
      console.log(util.inspect(packagesWithPublishDate, false, null, true))
      console.log('')
      console.log(chalk.green('All Packages Are Valid'))
      console.log('')
    } else {
      console.log('')
      console.log(chalk.red('There Are Some Invalid Packages:'))
      console.log('')
      console.log(util.inspect(invalidPackages, false, null, true))
      console.log('')
    }
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
