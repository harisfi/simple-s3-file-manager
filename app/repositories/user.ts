import * as jose from 'jose'
import stringHelpers from '@adonisjs/core/helpers/string'
import Client from '@keycloak/keycloak-admin-client'
import { RequiredActionAlias } from '@keycloak/keycloak-admin-client/lib/defs/requiredActionProviderRepresentation.js'
import UserRepresentation from '@keycloak/keycloak-admin-client/lib/defs/userRepresentation.js'
import { UserQuery } from '@keycloak/keycloak-admin-client/lib/resources/users.js'
import { IUserRepository, User, UserCountParams, UserFetchParams, UserRole } from '#domains/user'
import env from '#start/env'

export default class UserRepository implements IUserRepository {
  private static instance: UserRepository

  public static getInstance(): IUserRepository {
    if (!UserRepository.instance) {
      UserRepository.instance = new UserRepository()
    }
    return UserRepository.instance
  }

  private client: Client
  private clientUniqueId = ''

  private constructor() {
    this.client = new Client({
      baseUrl: env.get('KEYCLOAK_HOST'),
      realmName: env.get('KEYCLOAK_REALM'),
    })
  }

  private async login() {
    await this.client.auth({
      clientId: env.get('KEYCLOAK_CLIENT_ID'),
      grantType: 'password',
      username: env.get('KEYCLOAK_ADMIN_USERNAME'),
      password: env.get('KEYCLOAK_ADMIN_PASSWORD'),
    })
    if (!this.clientUniqueId) {
      const clients = await this.client.clients.find({
        clientId: env.get('KEYCLOAK_CLIENT_ID'),
      })
      if (!clients.length || !clients[0].id) {
        throw new Error('keycloak client not found')
      }
      this.clientUniqueId = clients[0].id
    }
  }

  private async toType(kcUser: UserRepresentation): Promise<User> {
    const user: User = {
      id: kcUser.id ?? '',
      email: kcUser.email ?? '',
      name: kcUser.firstName ?? '',
      enabled: kcUser.enabled ?? false,
      roles: [],
    }
    const kcRoles = await this.client.users.listClientRoleMappings({
      id: user.id,
      clientUniqueId: this.clientUniqueId,
    })
    for (const kcRole of kcRoles) {
      if (kcRole.name) {
        const key = stringHelpers.snakeCase(kcRole.name).toUpperCase() as keyof typeof UserRole
        user.roles.push(UserRole[key])
      }
    }
    return user
  }

  async store(user: User): Promise<void> {
    await this.login()
    let kcUser: UserRepresentation
    const { id } = await this.client.users.create({
      username: user.email,
      email: user.email,
      firstName: user.name,
      enabled: true,
      requiredActions: [RequiredActionAlias.VERIFY_EMAIL],
      credentials: [{ type: 'password', value: user.email, temporary: true }],
    })
    const result = await this.client.users.findOne({ id })
    if (!result) {
      throw new Error(`user '${user.email}' not found`)
    }
    kcUser = result
    if (!kcUser.id) {
      throw new Error(`invalid user '${user.email}'`)
    }
    user.id = kcUser.id
    for (const role of user.roles) {
      const kcRole = await this.client.clients.findRole({
        id: this.clientUniqueId,
        roleName: role.toLowerCase(),
      })
      if (!kcRole || !kcRole.id || !kcRole.name) {
        throw new Error(`invalid client role '${role}'`)
      }
      await this.client.users.addClientRoleMappings({
        id: kcUser.id,
        clientUniqueId: this.clientUniqueId,
        roles: [{ id: kcRole.id, name: kcRole.name }],
      })
    }
  }

  async fetch(params?: UserFetchParams): Promise<User[]> {
    await this.login()
    let users: User[] = []
    const payload: UserQuery = {}
    payload.search = params?.search
    payload.max = params?.limit
    payload.first = params?.offset
    const kcUsers = await this.client.users.find(payload)
    for (const kcUser of kcUsers) {
      users.push(await this.toType(kcUser))
    }
    return users
  }

  async count(params?: UserCountParams): Promise<number> {
    await this.login()
    const payload: UserQuery = { search: params?.search }
    return await this.client.users.count(payload)
  }

  async get(id: string): Promise<User> {
    await this.login()
    const kcUser = await this.client.users.findOne({ id })
    if (!kcUser) {
      throw new Error(`user with id '${id}' not found`)
    }
    return await this.toType(kcUser)
  }

  async update(id: string, user: User): Promise<void> {
    await this.login()
    const kcUser = await this.client.users.findOne({ id })
    if (!kcUser) {
      throw new Error(`user with id '${id}' not found`)
    }
    await this.client.users.update(
      { id },
      {
        firstName: user.name,
        enabled: user.enabled,
      }
    )
    const kcRoles = await this.client.users.listClientRoleMappings({
      id,
      clientUniqueId: this.clientUniqueId,
    })
    await this.client.users.delClientRoleMappings({
      id,
      clientUniqueId: this.clientUniqueId,
      roles: kcRoles.map((kcRole) => {
        if (!kcRole.id || !kcRole.name) {
          throw new Error(`invalid user role `)
        }
        return { id: kcRole.id, name: kcRole.name }
      }),
    })
    for (const role of user.roles) {
      const kcRole = await this.client.clients.findRole({
        id: this.clientUniqueId,
        roleName: role.toLowerCase(),
      })
      if (!kcRole || !kcRole.id || !kcRole.name) {
        throw new Error(`invalid client role '${role}'`)
      }
      await this.client.users.addClientRoleMappings({
        id,
        clientUniqueId: this.clientUniqueId,
        roles: [{ id: kcRole.id, name: kcRole.name }],
      })
    }
  }

  async delete(id: string): Promise<void> {
    await this.login()
    const kcUser = await this.client.users.findOne({ id })
    if (!kcUser) {
      throw new Error(`user with id '${id}' not found`)
    }
    await this.client.users.del({ id })
  }

  async verify(token: string): Promise<User> {
    const jwks = jose.createRemoteJWKSet(
      new URL(
        `${env.get('KEYCLOAK_HOST')}/realms/${env.get(
          'KEYCLOAK_REALM'
        )}/protocol/openid-connect/certs`
      )
    )
    const { payload } = await jose.jwtVerify(token, jwks, {
      requiredClaims: ['sub', 'email', 'given_name', 'resource_access'],
    })
    const id = payload.sub as string
    const email = payload.email as string
    const name = payload.given_name as string
    const user: User = {
      id,
      email,
      name,
      enabled: true,
      roles: [],
    }
    const resourceAccess = payload.resource_access as Record<string, any>
    const roles = resourceAccess[env.get('KEYCLOAK_CLIENT_ID')].roles as string[]
    for (const role of roles) {
      const key = stringHelpers.snakeCase(role).toUpperCase() as keyof typeof UserRole
      user.roles.push(UserRole[key])
    }
    return user
  }
}
