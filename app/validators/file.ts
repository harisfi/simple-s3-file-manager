import vine from '@vinejs/vine'

export const fileStoreValidator = vine.compile(
  vine.object({
    input: vine.object({
      input: vine.object({
        id: vine.string().optional(),
        name: vine.string(),
        url_path: vine.string(),
        user_id: vine.string().optional(),
      }),
    }),
  })
)

export const fileUpdateValidator = vine.compile(
  vine.object({
    input: vine.object({
      id: vine.string(),
      input: vine.object({
        name: vine.string().optional(),
        url_path: vine.string().optional(),
        user_id: vine.string().optional(),
      }),
    }),
  })
)

export const fileDeleteValidator = vine.compile(
  vine.object({
    input: vine.object({
      id: vine.string(),
    }),
  })
)
