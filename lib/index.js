const { listCommand } = require('./commands/list.command')
const { viewCommand } = require('./commands/view.command')
const { validateCommand } = require('./commands/validate.command')

module.exports = {
  listCommand,
  viewCommand,
  validateCommand,
}
