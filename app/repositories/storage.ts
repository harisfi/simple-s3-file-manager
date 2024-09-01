import { IStorageRepository } from '#domains/storage'
import env from '#start/env'
import { Client } from 'minio'

export default class StorageRepository implements IStorageRepository {
  private static instance: StorageRepository
  private client: Client

  public static getInstance(): IStorageRepository {
    if (!StorageRepository.instance) {
      StorageRepository.instance = new StorageRepository()
    }
    return StorageRepository.instance
  }

  private constructor() {
    this.client = new Client({
      endPoint: env.get('S3_ENDPOINT'),
      port: env.get('S3_PORT'),
      region: env.get('S3_REGION'),
      accessKey: env.get('S3_KEY'),
      secretKey: env.get('S3_SECRET'),
      useSSL: env.get('S3_USE_SSL'),
    })
  }

  getUploadUrl(objectName: string): Promise<string> {
    return this.client.presignedPutObject(env.get('S3_BUCKET'), objectName, 60 * 24)
  }

  getDownloadUrl(objectName: string): Promise<string> {
    return this.client.presignedGetObject(env.get('S3_BUCKET'), objectName)
  }
}
