export class ConfigurationError extends Error {
  constructor(public readonly code: 'INVALID_DATABASE_URL' | 'INVALID_SESSION_SECRET') {
    super(code);
    this.name = 'ConfigurationError';
  }
}
