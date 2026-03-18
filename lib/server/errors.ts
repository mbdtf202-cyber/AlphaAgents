export class AuthError extends Error {
  constructor(message = "Authentication required.") {
    super(message);
    this.name = "AuthError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "You do not have permission to perform this action.") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends Error {
  constructor(message = "Resource not found.") {
    super(message);
    this.name = "NotFoundError";
  }
}

export class ConfigurationError extends Error {
  constructor(message = "AlphaAgents is not configured for this action.") {
    super(message);
    this.name = "ConfigurationError";
  }
}

export class RateLimitError extends Error {
  retryAfterSeconds: number;

  constructor(message = "Too many requests.", retryAfterSeconds = 60) {
    super(message);
    this.name = "RateLimitError";
    this.retryAfterSeconds = retryAfterSeconds;
  }
}
