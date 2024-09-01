import { IUserUseCase, User, UserRole } from '#domains/user'
import UserRepository from '#repositories/user'
import UserUseCase from '#usecases/user'
import { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import { NextFn } from '@adonisjs/core/types/http'

export default class AuthMiddleware {
  private userUseCase: IUserUseCase

  constructor() {
    const userRepository = UserRepository.getInstance()
    this.userUseCase = UserUseCase.getInstance(userRepository)
  }

  private handleGuest(ctx: HttpContext) {
    ctx.user = { roles: [UserRole.GUEST] } as User
  }

  async handle(ctx: HttpContext, next: NextFn, allowedRoles?: string[]) {
    try {
      const authToken = ctx.request.header('authorization')
      if (authToken) {
        const token = authToken.replace('Bearer ', '')
        if (token) {
          ctx.user = await this.userUseCase.verify(token)
          return await next()
        } else {
          throw new Error('token is empty')
        }
      } else {
        if (allowedRoles?.includes('guest')) {
          this.handleGuest(ctx)
          return await next()
        }
        throw new Error('invalid header')
      }
    } catch (error) {
      ctx.response.status(error.status ?? 401).json({
        message: app.inProduction ? 'Unauthorized' : error.message,
      })
    }
  }
}
