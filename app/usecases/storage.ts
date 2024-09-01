import { IStorageRepository, IStorageUseCase } from '#domains/storage'

export default class StorageUseCase implements IStorageUseCase {
  private static instance: StorageUseCase

  public static getInstance(storageRepository: IStorageRepository): IStorageUseCase {
    if (!StorageUseCase.instance) {
      StorageUseCase.instance = new StorageUseCase(storageRepository)
    }
    return StorageUseCase.instance
  }

  private constructor(private storageRepository: IStorageRepository) {}

  getUploadUrl(objectName: string): Promise<string> {
    return this.storageRepository.getUploadUrl(objectName)
  }

  getDownloadUrl(objectName: string): Promise<string> {
    return this.storageRepository.getDownloadUrl(objectName)
  }
}
