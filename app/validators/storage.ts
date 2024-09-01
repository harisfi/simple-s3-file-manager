import vine from '@vinejs/vine'

export const storageGetUploadUrlValidator = vine.compile(
  vine.object({
    input: vine.object({
      input: vine.object({
        object_name: vine.string(),
      }),
    }),
  })
)

export const storageGetDownloadUrlValidator = vine.compile(
  vine.object({
    input: vine.object({
      input: vine.object({
        object_name: vine.string(),
      }),
    }),
  })
)

export const storageGetRawObjectContentValidator = vine.compile(
  vine.object({
    input: vine.object({
      input: vine.object({
        object_name: vine.string(),
      }),
    }),
  })
)
