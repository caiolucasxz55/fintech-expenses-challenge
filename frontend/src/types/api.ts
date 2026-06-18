/**
 * Contratos genéricos da API.
 *
 * O backend (NestJS) embrulha toda resposta de sucesso num envelope
 * `{ data, timestamp }` via TransformInterceptor, e padroniza erros via
 * GlobalExceptionFilter como `{ statusCode, timestamp, path, message }`,
 * onde `message` pode ser string única ou um array (erros de validação).
 */

export interface ApiEnvelope<T> {
  data: T;
  timestamp: string;
}

export interface ApiErrorBody {
  statusCode: number;
  timestamp: string;
  path: string;
  message: string | string[];
}

/** Erro normalizado consumido pela UI (já com a mensagem achatada). */
export interface NormalizedApiError {
  status: number;
  message: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  lastPage: number;
  hasNextPage: boolean;
}

export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
}
