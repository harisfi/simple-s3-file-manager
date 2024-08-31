export type User = {
  id: string
  email: string
  name: string
  enabled: boolean
  roles: UserRole[]
}

export type UserFetchParams = {
  search?: string
  limit?: number
  offset?: number
}

export type UserCountParams = {
  search?: string
  limit?: number
  offset?: number
}

export interface IUserRepository {
  store(user: User): Promise<void>
  fetch(params?: UserFetchParams): Promise<User[]>
  count(params?: UserCountParams): Promise<number>
  get(id: string): Promise<User>
  update(id: string, user: User): Promise<void>
  delete(id: string): Promise<void>
  verify(token: string): Promise<User>
}

export interface IUserUseCase {
  verify(token: string): Promise<User>
}

export enum UserRole {
  ADMINISTRATOR = 'ADMINISTRATOR',
  GUEST = 'GUEST',
}
