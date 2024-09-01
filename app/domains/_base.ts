import { RawQuery } from '@adonisjs/lucid/types/querybuilder'
import { DateTime } from 'luxon'

export type BaseDomainTypes = {
  id?: string
  createdAt: DateTime
  updatedAt: DateTime
}

export type WhereObject = {
  column: string | RawQuery
  operator?: 'gte' | 'gt' | 'lt' | 'lte' | 'eq' | 'neq' | 'con' | 'in' | 'nin'
  value?: any
  group?: Array<WhereObject>
  filtering?: 'and' | 'or' | 'has'
  relation?: string
}

export type RelationObject = {
  table: string
  where?: Array<WhereObject>
  limit?: number
  orderBy?: Record<string, any>
}

export type WhereHasObject = {
  relation: string
  where: Array<WhereObject>
}

export interface FindParams {
  where?: Array<WhereObject>
  limit?: number
  offset?: number
  orderBy?: Record<string, any>
  relations?: Array<RelationObject>
}

export interface FindResults<T> {
  data: T[]
  total: number
}

export interface IGenericRepository<T, U> {
  store(data: T, dbTrx?: U): Promise<void>
  get(id: string, dbTrx?: U, lock?: boolean): Promise<T>
  fetch(params?: FindParams, dbTrx?: U): Promise<T[]>
  count(params?: FindParams, dbTrx?: U): Promise<number>
  update(id: string, data: Partial<T>, dbTrx?: U): Promise<void>
  delete(id: string, dbTrx?: U): Promise<void>
}
