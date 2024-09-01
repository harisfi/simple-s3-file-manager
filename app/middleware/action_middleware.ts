import { IUserUseCase, UserRole } from '#domains/user'
import UserRepository from '#repositories/user'
import UserUseCase from '#usecases/user'
import stringHelpers from '@adonisjs/core/helpers/string'
import { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import { NextFn } from '@adonisjs/core/types/http'
import { schema } from '@adonisjs/validator'

export default class ActionMiddleware {
  private userUseCase: IUserUseCase

  constructor() {
    const userRepository = UserRepository.getInstance()
    this.userUseCase = UserUseCase.getInstance(userRepository)
  }

  async handle(ctx: HttpContext, next: NextFn) {
    try {
      const authHeader = ctx.request.header('authorization')
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '')
        if (token) {
          const user = await this.userUseCase.verify(token)
          const webhookSchema = schema.create({
            session_variables: schema.object().members({
              'x-hasura-role': schema.string(),
            }),
          })
          const {
            session_variables: { 'x-hasura-role': rawRole },
          } = await ctx.request.validate({
            schema: webhookSchema,
            cacheKey: 'POST-/action',
          })
          const role =
            UserRole[stringHelpers.snakeCase(rawRole).toUpperCase() as keyof typeof UserRole]
          if (!user.roles.includes(role)) {
            throw new Error('role not allowed')
          }
          ctx.user = user
          await next()
        } else {
          throw new Error('token is empty')
        }
      } else {
        throw new Error('invalid header')
      }
    } catch (error) {
      ctx.response.status(error.status ?? 401).json({
        message: app.inProduction ? 'Unauthorized' : error.message,
      })
    }
  }
}
