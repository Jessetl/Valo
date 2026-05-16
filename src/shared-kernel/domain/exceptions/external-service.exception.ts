import { DomainException } from './domain.exception';

export class ExternalServiceException extends DomainException {
  constructor(
    public readonly serviceName: string,
    message: string = 'El servicio no esta disponible en este momento.',
  ) {
    super(`${serviceName}: ${message}`);
  }
}
