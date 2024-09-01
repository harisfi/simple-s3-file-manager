import { FindParams } from '#domains/_base'
import { File, IFileRepository } from '#domains/file'
import Model from '#models/file'
import { TransactionClientContract as Trx } from '@adonisjs/lucid/types/database'
import { ulid } from 'ulid'
import { count, fetch, get } from '#repositories/common'

export default class FileRepository implements IFileRepository<Trx> {
  private static instance: FileRepository

  public static getInstance(): IFileRepository<Trx> {
    if (!FileRepository.instance) {
      FileRepository.instance = new FileRepository()
    }
    return FileRepository.instance
  }

  private constructor() {}

  private toType(model: Model): File {
    return {
      id: model.id,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      name: model.name,
      urlPath: model.urlPath,
      userId: model.userId,
    }
  }

  async store(file: File, trx?: Trx): Promise<void> {
    file.id = file.id || ulid()
    await Model.create(
      {
        id: file.id,
        createdAt: file.createdAt,
        updatedAt: file.updatedAt,
        name: file.name,
        urlPath: file.urlPath,
        userId: file.userId,
      },
      { client: trx }
    )
  }

  async fetch(params?: FindParams, trx?: Trx): Promise<File[]> {
    const files: File[] = []
    const models = await fetch(Model, params, trx)
    for (const model of models) {
      files.push(this.toType(model))
    }
    return files
  }

  async count(params: FindParams, trx?: Trx): Promise<number> {
    return count(Model, params, trx)
  }

  async get(id: string, trx?: Trx, lock?: boolean): Promise<File> {
    const model = await get(Model, id, trx, lock)
    return this.toType(model)
  }

  async update(id: string, file: File, trx?: Trx): Promise<void> {
    const model = await Model.query({ client: trx }).where({ id }).firstOrFail()
    model.name = file.name
    model.urlPath = file.urlPath
    model.userId = file.userId
    await model.save()
  }

  async delete(id: string, trx?: Trx): Promise<void> {
    const model = await Model.query({ client: trx }).where({ id }).firstOrFail()
    await model.delete()
  }
}
