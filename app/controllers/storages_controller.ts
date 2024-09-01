import { IStorageUseCase } from '#domains/storage'
import StorageRepository from '#repositories/storage'
import StorageUseCase from '#usecases/storage'
import {
  storageGetDownloadUrlValidator,
  storageGetRawObjectContentValidator,
  storageGetUploadUrlValidator,
} from '#validators/storage'
import { HttpContext } from '@adonisjs/core/http'

export default class StoragesController {
  private storageUseCase: IStorageUseCase

  constructor() {
    const storageRepository = StorageRepository.getInstance()
    this.storageUseCase = StorageUseCase.getInstance(storageRepository)
  }

  async getUploadUrl(ctx: HttpContext) {
    try {
      const {
        input: { input: payload },
      } = await ctx.request.validateUsing(storageGetUploadUrlValidator)
      const url = await this.storageUseCase.getUploadUrl(payload.object_name)
      return { url }
    } catch (error) {
      ctx.response.status(error.status ?? 400).json({ message: error.message })
    }
  }

  async getDownloadUrl(ctx: HttpContext) {
    try {
      const {
        input: { input: payload },
      } = await ctx.request.validateUsing(storageGetDownloadUrlValidator)
      const url = await this.storageUseCase.getDownloadUrl(payload.object_name)
      return { url }
    } catch (error) {
      ctx.response.status(error.status ?? 400).json({ message: error.message })
    }
  }

  async getRawObjectContent(ctx: HttpContext) {
    try {
      const {
        input: { input: payload },
      } = await ctx.request.validateUsing(storageGetRawObjectContentValidator)
      const data = await this.storageUseCase.getRawObjectContent(payload.object_name)
      return { data }
    } catch (error) {
      ctx.response.status(error.status ?? 400).json({ message: error.message })
    }
  }
}
