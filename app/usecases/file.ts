import { Context } from '#domains/common'
import { File, FileStoreInput, FileUpdateInput, IFileRepository, IFileUseCase } from '#domains/file'
import db from '@adonisjs/lucid/services/db'
import { TransactionClientContract as Trx } from '@adonisjs/lucid/types/database'
import { DateTime } from 'luxon'

export default class FileUseCase implements IFileUseCase {
  private static instance: FileUseCase

  public static getInstance(fileRepository: IFileRepository<Trx>): IFileUseCase {
    if (!FileUseCase.instance) {
      FileUseCase.instance = new FileUseCase(fileRepository)
    }
    return FileUseCase.instance
  }

  private constructor(private fileRepository: IFileRepository<Trx>) {}

  async store(ctx: Context, input: FileStoreInput): Promise<File> {
    const trx = await db.transaction()
    try {
      const file: File = {
        id: input.id ?? '',
        name: input.name,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
        urlPath: input.urlPath,
        userId: input.userId,
      }
      await this.fileRepository.store(file, trx)
      await trx.commit()
      return file
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  async update(ctx: Context, id: string, input: FileUpdateInput): Promise<File> {
    const trx = await db.transaction()
    try {
      const file = await this.fileRepository.get(id, trx, true)
      if (input.name !== undefined) {
        file.name = input.name
      }
      if (input.urlPath !== undefined) {
        file.urlPath = input.urlPath
      }
      if (input.userId !== undefined) {
        file.userId = input.userId
      }
      await this.fileRepository.update(id, file, trx)
      await trx.commit()
      return file
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  async delete(ctx: Context, id: string): Promise<void> {
    const trx = await db.transaction()
    try {
      await this.fileRepository.get(id, trx, true)
      await this.fileRepository.delete(id, trx)
      await trx.commit()
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }
}
