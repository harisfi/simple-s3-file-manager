import { FindParams } from '#domains/_base'
import QueryUtil from '#utils/query'
import { BaseModel } from '@adonisjs/lucid/orm'
import { TransactionClientContract as Trx } from '@adonisjs/lucid/types/database'
import { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'

export function fetch<T extends typeof BaseModel>(
  model: T,
  params?: FindParams,
  trx?: Trx
): ModelQueryBuilderContract<T> {
  const query = model.query({ client: trx })
  if (params) {
    const { limit, offset, orderBy, where } = params
    QueryUtil.buildWhere(query, where)
    QueryUtil.buildOrder(query, orderBy)
    if (limit) {
      query.limit
    }
    if (offset) {
      query.offset
    }
  }
  return query
}

export async function count<T extends typeof BaseModel>(
  model: T,
  params?: FindParams,
  trx?: Trx
): Promise<number> {
  const query = model.query({ client: trx })
  if (params) {
    const { limit, offset, where } = params
    QueryUtil.buildWhere(query, where)
    if (limit) {
      query.limit
    }
    if (offset) {
      query.offset
    }
  }
  const result = await query.count('*', 'total').first()
  return result?.$extras.total
}

export async function get<T extends typeof BaseModel>(
  model: T,
  id: string,
  trx?: Trx,
  lock?: boolean
) {
  let query = model.query({ client: trx }).where({ id })
  if (lock) {
    query = query.forUpdate()
  }
  const models = await query
  if (!models.length) {
    throw new Error(`${model.table} with id '${id}' not found`)
  }
  return models[0]
}
