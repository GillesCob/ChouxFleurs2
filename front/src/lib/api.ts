import { mockFetch } from './mock-api';
import axiosClient from './axiosClient';

export const USE_MOCK = true;

export const api = {
  get: <T>(path: string) =>
    USE_MOCK
      ? mockFetch<T>('GET', path)
      : axiosClient.get<T>(path).then((r) => r.data),

  post: <T>(path: string, body: unknown) =>
    USE_MOCK
      ? mockFetch<T>('POST', path, body)
      : axiosClient.post<T>(path, body).then((r) => r.data),

  patch: <T>(path: string, body: unknown) =>
    USE_MOCK
      ? mockFetch<T>('PATCH', path, body)
      : axiosClient.patch<T>(path, body).then((r) => r.data),

  delete: <T>(path: string) =>
    USE_MOCK
      ? mockFetch<T>('DELETE', path)
      : axiosClient.delete<T>(path).then((r) => r.data),
};
