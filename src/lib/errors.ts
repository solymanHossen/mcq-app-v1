export class UnauthorizedError extends Error {
  constructor(message = "Authentication required") {
    super(message)
    this.name = "UnauthorizedError"
  }
}

export class ForbiddenError extends Error {
  constructor(message = "You don't have permission to do that") {
    super(message)
    this.name = "ForbiddenError"
  }
}

export class RateLimitedError extends Error {
  constructor(message = "Too many attempts, please try again later") {
    super(message)
    this.name = "RateLimitedError"
  }
}
