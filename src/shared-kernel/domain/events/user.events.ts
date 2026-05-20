export const USER_REGISTERED = 'user.registered';

export class UserRegisteredEvent {
  constructor(public readonly userId: string) {}
}
