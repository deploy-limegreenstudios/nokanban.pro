const errors: Record<number, { code: number; message: string }> = {
  400: {
    code: 400,
    message: 'BAD_REQUEST',
  },
  401: {
    code: 401,
    message: 'UNAUTHORIZED',
  },
  403: {
    code: 403,
    message: 'FORBIDDEN',
  },
  404: {
    code: 404,
    message: 'NOT_FOUND',
  },
  409: {
    code: 409,
    message: 'CONFLICT',
  },
  500: {
    code: 500,
    message: 'INTERNAL_SERVER_ERROR',
  },
}

export const getError = (code: number, details?: string) => {
  const error = errors[code] || errors[500]
  return {
    ...error,
    details: details || null,
  }
}
