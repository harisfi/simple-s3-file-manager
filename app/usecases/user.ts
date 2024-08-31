import { IUserRepository, IUserUseCase } from '#domains/user'

export default class UserUseCase implements IUserUseCase {
  private static instance: UserUseCase

  public static getInstance(userRepository: IUserRepository): IUserUseCase {
    if (!UserUseCase.instance) {
      UserUseCase.instance = new UserUseCase(userRepository)
    }
    return UserUseCase.instance
  }

  private constructor(private userRepository: IUserRepository) {}

  verify(token: string) {
    return this.userRepository.verify(token)
  }
}
