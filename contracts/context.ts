import { User } from '#domains/user'

declare module '@adonisjs/core/http' {
  export interface HttpContext {
    user?: User
  }
}
