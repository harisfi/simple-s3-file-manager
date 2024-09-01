import env from '#start/env'
import type { ApplicationService, LoggerService } from '@adonisjs/core/types'
import { Client } from 'minio'

export default class AppProvider {
  constructor(protected app: ApplicationService) {}

  /**
   * Register bindings to the container
   */
  register() {}

  /**
   * The container bindings have booted
   */
  async boot() {
    const logger = await this.app.container.make('logger')
    await checkMinio(logger)
  }

  /**
   * The application has been booted
   */
  async start() {}

  /**
   * The process has been started
   */
  async ready() {}

  /**
   * Preparing to shutdown the app
   */
  async shutdown() {}
}

async function checkMinio(logger: LoggerService) {
  const minioClient = new Client({
    endPoint: env.get('S3_ENDPOINT'),
    port: env.get('S3_PORT'),
    region: env.get('S3_REGION'),
    accessKey: env.get('S3_KEY'),
    secretKey: env.get('S3_SECRET'),
    useSSL: env.get('S3_USE_SSL'),
  })
  const bucket = env.get('S3_BUCKET')
  let bucketExist = await minioClient.bucketExists(bucket)
  logger.info('S3 Bucket')
  logger.info(JSON.stringify({ bucket, bucketExist }))
  if (!bucketExist) {
    logger.info(`Bucket "${bucket}" doesn't exist. Creating...`)
    await minioClient.makeBucket(bucket, env.get('S3_REGION')).then((_x: any) => {
      logger.info(`Bucket "${bucket}" is created.`)
      bucketExist = true
    })
  }
  if (bucketExist) {
    minioClient.getBucketPolicy(bucket).catch(() => {
      const bucketPolicy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: {
              AWS: ['*'],
            },
            Action: ['s3:ListBucket', 's3:GetBucketLocation'],
            Resource: [`arn:aws:s3:::${bucket}`],
          },
          {
            Effect: 'Allow',
            Principal: {
              AWS: ['*'],
            },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${bucket}/*`],
          },
        ],
      }
      minioClient.setBucketPolicy(bucket, JSON.stringify(bucketPolicy))
    })
  }
}
