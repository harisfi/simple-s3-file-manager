import { FileFactory } from '#database/factories/file_factory'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await FileFactory.createMany(3)
  }
}
