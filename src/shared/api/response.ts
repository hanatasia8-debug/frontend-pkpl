/**
 * Shape of a successful API response from the backend.
 * Kept here so services can type their `apiClient.get<>()` calls
 * without depending on backend-only modules.
 */
export interface ApiSuccessBody<T> {
  success: true;
  statusCode: number;
  message: string;
  data: T;
}
