import { FileStoreInput, FileUpdateInput, IFileUseCase } from '#domains/file'
import FileRepository from '#repositories/file'
import FileUseCase from '#usecases/file'
import { fileDeleteValidator, fileStoreValidator, fileUpdateValidator } from '#validators/file'
import { HttpContext } from '@adonisjs/core/http'

export default class FilesController {
  private fileUseCase: IFileUseCase

  constructor() {
    const fileRepository = FileRepository.getInstance()
    this.fileUseCase = FileUseCase.getInstance(fileRepository)
  }

  async store(ctx: HttpContext) {
    try {
      const {
        input: { input: payload },
      } = await ctx.request.validateUsing(fileStoreValidator)
      const input: FileStoreInput = {
        id: payload.id,
        name: payload.name,
        urlPath: payload.url_path,
        userId: payload.user_id ?? ctx.user?.id!,
      }
      const { id } = await this.fileUseCase.store({ user: ctx.user }, input)
      return { id }
    } catch (error) {
      ctx.response.status(error.status ?? 400).json({ message: error.message })
    }
  }

  async update(ctx: HttpContext) {
    try {
      const {
        input: { id, input: payload },
      } = await ctx.request.validateUsing(fileUpdateValidator)
      const input: FileUpdateInput = {
        name: payload.name,
        urlPath: payload.url_path,
        userId: payload.user_id ?? ctx.user?.id!,
      }
      await this.fileUseCase.update({ user: ctx.user }, id, input)
      return { id }
    } catch (error) {
      ctx.response.status(error.status ?? 400).json({ message: error.message })
    }
  }

  async delete(ctx: HttpContext) {
    try {
      const {
        input: { id },
      } = await ctx.request.validateUsing(fileDeleteValidator)
      await this.fileUseCase.delete({ user: ctx.user }, id)
      return { id }
    } catch (error) {
      ctx.response.status(error.status ?? 400).json({ message: error.message })
    }
  }
}
