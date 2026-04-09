import 'axios';

declare module 'axios' {
  export interface AxiosRequestConfig {
    /**
     * When true, a 401 on this request clears the stored token but does not show
     * the global "session ended" alert (used restoring session on cold start).
     */
    authSilentInvalidation?: boolean;
  }
}
