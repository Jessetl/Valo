export const USER_READER = Symbol('USER_READER');

export interface IUserReader {
  existsById(userId: string): Promise<boolean>;
}
