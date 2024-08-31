import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import app from '@adonisjs/core/services/app'
import { IUserUseCase, User, UserRole } from '#domains/user'
import UserRepository from '#repositories/user'
import UserUseCase from '#usecases/user'

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
      ctx.response.unauthorized({
        message: app.inProduction ? 'Unauthorized' : error.message,
      })
    }
  }
}
