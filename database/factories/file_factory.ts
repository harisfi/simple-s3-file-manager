import File from '#models/file'
import factory from '@adonisjs/lucid/factories'

export const FileFactory = factory
  .define(File, async ({ faker }) => {
    return {
      id: faker.string.uuid(),
      name: faker.word.words(),
      urlPath: faker.internet.url(),
      userId: faker.string.uuid(),
    }
  })
  .build()
