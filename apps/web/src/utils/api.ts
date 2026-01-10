import { env } from './env'

export const API = {
  BASE_URL: () => env.VITE_API_BASE_URL,
  AUTH: {
    BASE_URL: () => '/auth',
    SIGN_IN: () => '/sign-in',
    SIGN_UP: () => '/sign-up',
    SESSION: () => '/session',
    LOGOUT: () => '/logout',
  },
}
