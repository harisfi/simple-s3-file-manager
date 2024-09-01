import { RelationObject, WhereObject } from '#domains/_base'
import { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import { DatabaseQueryBuilderContract } from '@adonisjs/lucid/types/querybuilder'

export default class QueryUtil {
  static buildWhere(query: ModelQueryBuilderContract<any>, where?: WhereObject[]) {
    if (where) {
      for (const whereItem of where) {
        if (whereItem.group) {
          if (whereItem.relation) {
            let method: keyof ModelQueryBuilderContract<any> = 'whereHas'
            if (whereItem.filtering === 'or') {
              method = 'orWhereHas'
            } else {
              method = 'whereHas'
            }
            query[method](whereItem.relation, (childQuery) => {
              this.buildWhere(childQuery, whereItem.group)
            })
          } else {
            let method: keyof ModelQueryBuilderContract<any> = 'where'
            if (whereItem.filtering === 'or') {
              method = 'orWhere'
            } else {
              method = 'where'
            }
            query[method]((childQuery) => {
              this.buildWhere(childQuery, whereItem.group)
            })
          }
        } else {
          let op: string = ''
          switch (whereItem.operator) {
            case 'eq':
              op = '='
              break
            case 'gt':
              op = '>'
              break
            case 'gte':
              op = '>='
              break
            case 'lt':
              op = '<'
              break
            case 'lte':
              op = '<='
              break
            case 'neq':
              op = '='
              break
            case 'con':
              op = '@>'
              break
            case 'in':
              op = 'in'
              break
            case 'nin':
              op = 'not in'
              break
            default:
              break
          }
          if (whereItem.column != 'has') {
            let method: keyof ModelQueryBuilderContract<any> = 'where'
            if (whereItem.filtering === 'or') {
              if (whereItem.operator === 'neq') {
                method = 'orWhereNot'
              } else {
                method = 'orWhere'
              }
            } else {
              if (whereItem.operator === 'neq') {
                method = 'whereNot'
              } else {
                method = 'where'
              }
            }
            if (whereItem.value === null) {
              let method: keyof ModelQueryBuilderContract<any> = 'whereNull'
              if (whereItem.operator === 'neq') {
                method = 'whereNotNull'
              }
              query[method](whereItem.column)
            } else {
              query[method](whereItem.column, op, whereItem.value)
            }
          } else {
            let method: keyof ModelQueryBuilderContract<any> = 'has'
            if (whereItem.filtering === 'or') {
              if (whereItem.operator === 'neq') {
                method = 'orDoesntHave'
              } else {
                method = 'orHas'
              }
            } else {
              if (whereItem.operator === 'neq') {
                method = 'doesntHave'
              } else {
                method = 'has'
              }
            }
            if (whereItem.value) {
              query[method](whereItem.relation!, op, whereItem.value)
            } else {
              query[method](whereItem.relation!)
            }
          }
        }
      }
    }
  }

  static buildOrder(
    query: DatabaseQueryBuilderContract<any> | ModelQueryBuilderContract<any>,
    orderBy?: Record<string, any>
  ) {
    if (orderBy) {
      let sqlOrderBy = ''
      for (const key in orderBy) {
        if (Object.prototype.hasOwnProperty.call(orderBy, key)) {
          const element = orderBy[key]
          if (sqlOrderBy != '') {
            sqlOrderBy += ', '
          }
          sqlOrderBy += `${key} ${element} `
        }
      }
      query.orderByRaw(sqlOrderBy)
    } else {
      query.orderBy('created_at', 'desc')
    }
  }

  static buildPreload(query: ModelQueryBuilderContract<any>, relations?: Array<RelationObject>) {
    if (relations) {
      for (const relation of relations) {
        query.preload(relation.table, (qp: ModelQueryBuilderContract<any>) => {
          this.buildWhere(qp, relation.where)
          this.buildOrder(qp, relation.orderBy)
          if (relation.limit) qp.limit(relation.limit)
        })
      }
    }
  }
}
