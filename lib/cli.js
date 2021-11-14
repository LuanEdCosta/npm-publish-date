const chalk = require('chalk')
const { Command } = require('commander')

const packageJson = require('../package.json')
const { listCommand } = require('./commands/list.command')

const commanderListCommand = new Command('list')
  .description('List versions of all node_modules packages')
  .option('-j, --json', 'Show results using the JSON format', false)
  .action((options) => {
    const { packagePublishDates } = listCommand()

    if (options.json) {
      console.log(JSON.stringify(packagePublishDates, null, 2))
      return
    }

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
  })

try {
  new Command('npd')
    .version(packageJson?.version || 'Not Defined')
    .addCommand(commanderListCommand)
    .parse(process.argv)
} catch (e) {
  console.log('')
  console.log(chalk.bgRed('An Error Ocurred'))
  console.log('Message:', e.message)
  console.log('')
}
