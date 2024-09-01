export interface IStorageRepository {
  getUploadUrl(objectName: string): Promise<string>
  getDownloadUrl(objectName: string): Promise<string>
}

export interface IStorageUseCase {
  getUploadUrl(objectName: string): Promise<string>
  getDownloadUrl(objectName: string): Promise<string>
}
