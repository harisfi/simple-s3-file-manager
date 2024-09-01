import { IUserUseCase, UserRole } from '#domains/user'
import UserRepository from '#repositories/user'
import UserUseCase from '#usecases/user'
import stringHelpers from '@adonisjs/core/helpers/string'
import { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'

export default class AuthController {
  private userUseCase: IUserUseCase

  constructor() {
    const userRepository = UserRepository.getInstance()
    this.userUseCase = UserUseCase.getInstance(userRepository)
  }

  async verify(ctx: HttpContext) {
    try {
      const authHeader = ctx.request.header('authorization')
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '')
        if (token) {
          const user = await this.userUseCase.verify(token)
          const rawRole = ctx.request.header('x-hasura-role')
          if (!rawRole) {
            throw new Error('role is empty')
          }
          const role =
            UserRole[stringHelpers.snakeCase(rawRole).toUpperCase() as keyof typeof UserRole]
          if (!user.roles.includes(role)) {
            throw new Error('role not allowed')
          }
          return {
            'x-hasura-role': role.toLowerCase(),
            'x-hasura-user-id': user.id,
          }
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
