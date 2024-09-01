import { IStorageRepository } from '#domains/storage'
import env from '#start/env'
import logger from '@adonisjs/core/services/logger'
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

  async getRawObjectContent(objectName: string): Promise<string> {
    const data = new Promise<string>((resolve, reject) => {
      let buff = ''
      let size = 0
      this.client
        .getObject(env.get('S3_BUCKET'), objectName)
        .then((dataStream) => {
          dataStream.on('data', (chunk) => {
            buff += chunk
            size += chunk.length
          })
          dataStream.on('end', () => {
            logger.info('End. Total size = ' + size)
            resolve(buff)
          })
          dataStream.on('error', (err) => {
            logger.info(err)
            reject(err)
          })
        })
        .catch(reject)
    })
    return data
  }
}
