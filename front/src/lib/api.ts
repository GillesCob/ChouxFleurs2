import axiosClient from './axiosClient';

export const api = {
  get: <T>(path: string) => axiosClient.get<T>(path).then((r) => r.data),
  post: <T>(path: string, body: unknown) => axiosClient.post<T>(path, body).then((r) => r.data),
  patch: <T>(path: string, body: unknown) => axiosClient.patch<T>(path, body).then((r) => r.data),
  delete: <T>(path: string) => axiosClient.delete<T>(path).then((r) => r.data),
};
