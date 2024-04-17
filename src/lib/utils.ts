export type APIResponse<V> =
  | { data: V; error: undefined }
  | { data: undefined; error: { status: number; message: string } }
