import { BaseDomainTypes, IGenericRepository } from '#domains/_base'
import { Context } from '#domains/common'

export type File = BaseDomainTypes & {
  name: string
  urlPath: string
  userId: string
}

export interface IFileRepository<T> extends IGenericRepository<File, T> {}

export type FileStoreInput = {
  id?: string
  name: string
  urlPath: string
  userId: string
}
export type FileUpdateInput = {
  name?: string
  urlPath?: string
  userId?: string
}

export interface IFileUseCase {
  store(ctx: Context, input: FileStoreInput): Promise<File>
  update(ctx: Context, id: string, input: FileUpdateInput): Promise<File>
  delete(ctx: Context, id: string): Promise<void>
}
