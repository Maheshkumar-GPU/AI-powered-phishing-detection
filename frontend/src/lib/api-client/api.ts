import { useMutation, useQuery } from "@tanstack/react-query";
import type {
  MutationFunction,
  QueryFunction,
  QueryKey,
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import type {
  AnalyticsSummary,
  ChatHistoryItem,
  ChatInput,
  ChatMessage,
  CountResult,
  DeleteResult,
  GetHistoryCountParams,
  GetHistoryParams,
  HealthStatus,
  ListReportsParams,
  ModelStatus,
  Report,
  ScanInput,
  ScanResult,
  ScanSummary,
} from "./api.schemas";
import { customFetch } from "./custom-fetch";
import type { ErrorType, BodyType } from "./custom-fetch";

type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];

// ── Health ──────────────────────────────────────────────────────────────────

export const getHealthCheckQueryKey = () => [`/api/health`] as const;

export const healthCheck = async (options?: RequestInit): Promise<HealthStatus> =>
  customFetch<HealthStatus>(`/api/health`, { ...options, method: "GET" });

export function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(
  options?: { query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>; request?: SecondParameter<typeof customFetch> }
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryKey = options?.query?.queryKey ?? getHealthCheckQueryKey();
  const queryFn: QueryFunction<Awaited<ReturnType<typeof healthCheck>>> = ({ signal }) =>
    healthCheck({ signal, ...options?.request });
  const query = useQuery({ queryKey, queryFn, ...options?.query }) as UseQueryResult<TData, TError> & { queryKey: QueryKey };
  query.queryKey = queryKey;
  return query;
}

// ── Scanner ─────────────────────────────────────────────────────────────────

export const getGetScanQueryKey = (scanId: number) => [`/api/scanner/scan/${scanId}`] as const;

export const scanUrl = async (scanInput: ScanInput, options?: RequestInit): Promise<ScanResult> =>
  customFetch<ScanResult>(`/api/scanner/scan`, {
    ...options,
    method: "POST",
    headers: { "Content-Type": "application/json", ...options?.headers },
    body: JSON.stringify(scanInput),
  });

export const useScanUrl = <TError = ErrorType<unknown>, TContext = unknown>(
  options?: { mutation?: UseMutationOptions<Awaited<ReturnType<typeof scanUrl>>, TError, { data: BodyType<ScanInput> }, TContext>; request?: SecondParameter<typeof customFetch> }
): UseMutationResult<Awaited<ReturnType<typeof scanUrl>>, TError, { data: BodyType<ScanInput> }, TContext> => {
  const mutationFn: MutationFunction<Awaited<ReturnType<typeof scanUrl>>, { data: BodyType<ScanInput> }> = ({ data }) =>
    scanUrl(data, options?.request);
  return useMutation({ mutationFn, ...options?.mutation });
};

export const getScan = async (scanId: number, options?: RequestInit): Promise<ScanResult> =>
  customFetch<ScanResult>(`/api/scanner/scan/${scanId}`, { ...options, method: "GET" });

export function useGetScan<TData = Awaited<ReturnType<typeof getScan>>, TError = ErrorType<void>>(
  scanId: number,
  options?: { query?: UseQueryOptions<Awaited<ReturnType<typeof getScan>>, TError, TData>; request?: SecondParameter<typeof customFetch> }
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryKey = options?.query?.queryKey ?? getGetScanQueryKey(scanId);
  const queryFn: QueryFunction<Awaited<ReturnType<typeof getScan>>> = ({ signal }) =>
    getScan(scanId, { signal, ...options?.request });
  const query = useQuery({ queryKey, queryFn, enabled: !!scanId, ...options?.query }) as UseQueryResult<TData, TError> & { queryKey: QueryKey };
  query.queryKey = queryKey;
  return query;
}

// ── History ──────────────────────────────────────────────────────────────────

export const getGetHistoryQueryKey = (params?: GetHistoryParams) =>
  [`/api/history`, ...(params ? [params] : [])] as const;

export const getGetHistoryCountQueryKey = (params?: GetHistoryCountParams) =>
  [`/api/history/count`, ...(params ? [params] : [])] as const;

const buildQueryString = (params?: Record<string, unknown>) => {
  if (!params) return "";
  const p = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined) p.append(k, v === null ? "null" : String(v)); });
  const s = p.toString();
  return s ? `?${s}` : "";
};

export const getHistory = async (params?: GetHistoryParams, options?: RequestInit): Promise<ScanSummary[]> =>
  customFetch<ScanSummary[]>(`/api/history${buildQueryString(params as Record<string, unknown>)}`, { ...options, method: "GET" });

export function useGetHistory<TData = Awaited<ReturnType<typeof getHistory>>, TError = ErrorType<unknown>>(
  params?: GetHistoryParams,
  options?: { query?: UseQueryOptions<Awaited<ReturnType<typeof getHistory>>, TError, TData>; request?: SecondParameter<typeof customFetch> }
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryKey = options?.query?.queryKey ?? getGetHistoryQueryKey(params);
  const queryFn: QueryFunction<Awaited<ReturnType<typeof getHistory>>> = ({ signal }) =>
    getHistory(params, { signal, ...options?.request });
  const query = useQuery({ queryKey, queryFn, ...options?.query }) as UseQueryResult<TData, TError> & { queryKey: QueryKey };
  query.queryKey = queryKey;
  return query;
}

export const getHistoryCount = async (params?: GetHistoryCountParams, options?: RequestInit): Promise<CountResult> =>
  customFetch<CountResult>(`/api/history/count${buildQueryString(params as Record<string, unknown>)}`, { ...options, method: "GET" });

export function useGetHistoryCount<TData = Awaited<ReturnType<typeof getHistoryCount>>, TError = ErrorType<unknown>>(
  params?: GetHistoryCountParams,
  options?: { query?: UseQueryOptions<Awaited<ReturnType<typeof getHistoryCount>>, TError, TData>; request?: SecondParameter<typeof customFetch> }
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryKey = options?.query?.queryKey ?? getGetHistoryCountQueryKey(params);
  const queryFn: QueryFunction<Awaited<ReturnType<typeof getHistoryCount>>> = ({ signal }) =>
    getHistoryCount(params, { signal, ...options?.request });
  const query = useQuery({ queryKey, queryFn, ...options?.query }) as UseQueryResult<TData, TError> & { queryKey: QueryKey };
  query.queryKey = queryKey;
  return query;
}

export const deleteScan = async (scanId: number, options?: RequestInit): Promise<DeleteResult> =>
  customFetch<DeleteResult>(`/api/history/${scanId}`, { ...options, method: "DELETE" });

export const useDeleteScan = <TError = ErrorType<unknown>, TContext = unknown>(
  options?: { mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteScan>>, TError, { scanId: number }, TContext>; request?: SecondParameter<typeof customFetch> }
): UseMutationResult<Awaited<ReturnType<typeof deleteScan>>, TError, { scanId: number }, TContext> => {
  const mutationFn: MutationFunction<Awaited<ReturnType<typeof deleteScan>>, { scanId: number }> = ({ scanId }) =>
    deleteScan(scanId, options?.request);
  return useMutation({ mutationFn, ...options?.mutation });
};

// ── Chatbot ──────────────────────────────────────────────────────────────────

export const getGetChatHistoryQueryKey = (sessionId: string) =>
  [`/api/chatbot/history/${sessionId}`] as const;

export const sendChatMessage = async (chatInput: ChatInput, options?: RequestInit): Promise<ChatMessage> =>
  customFetch<ChatMessage>(`/api/chatbot/message`, {
    ...options,
    method: "POST",
    headers: { "Content-Type": "application/json", ...options?.headers },
    body: JSON.stringify(chatInput),
  });

export const useSendChatMessage = <TError = ErrorType<unknown>, TContext = unknown>(
  options?: { mutation?: UseMutationOptions<Awaited<ReturnType<typeof sendChatMessage>>, TError, { data: BodyType<ChatInput> }, TContext>; request?: SecondParameter<typeof customFetch> }
): UseMutationResult<Awaited<ReturnType<typeof sendChatMessage>>, TError, { data: BodyType<ChatInput> }, TContext> => {
  const mutationFn: MutationFunction<Awaited<ReturnType<typeof sendChatMessage>>, { data: BodyType<ChatInput> }> = ({ data }) =>
    sendChatMessage(data, options?.request);
  return useMutation({ mutationFn, ...options?.mutation });
};

export const getChatHistory = async (sessionId: string, options?: RequestInit): Promise<ChatHistoryItem[]> =>
  customFetch<ChatHistoryItem[]>(`/api/chatbot/history/${sessionId}`, { ...options, method: "GET" });

export function useGetChatHistory<TData = Awaited<ReturnType<typeof getChatHistory>>, TError = ErrorType<unknown>>(
  sessionId: string,
  options?: { query?: UseQueryOptions<Awaited<ReturnType<typeof getChatHistory>>, TError, TData>; request?: SecondParameter<typeof customFetch> }
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryKey = options?.query?.queryKey ?? getGetChatHistoryQueryKey(sessionId);
  const queryFn: QueryFunction<Awaited<ReturnType<typeof getChatHistory>>> = ({ signal }) =>
    getChatHistory(sessionId, { signal, ...options?.request });
  const query = useQuery({ queryKey, queryFn, enabled: !!sessionId, ...options?.query }) as UseQueryResult<TData, TError> & { queryKey: QueryKey };
  query.queryKey = queryKey;
  return query;
}

export const clearChatHistory = async (sessionId: string, options?: RequestInit): Promise<DeleteResult> =>
  customFetch<DeleteResult>(`/api/chatbot/history/${sessionId}`, { ...options, method: "DELETE" });

export const useClearChatHistory = <TError = ErrorType<unknown>, TContext = unknown>(
  options?: { mutation?: UseMutationOptions<Awaited<ReturnType<typeof clearChatHistory>>, TError, { sessionId: string }, TContext>; request?: SecondParameter<typeof customFetch> }
): UseMutationResult<Awaited<ReturnType<typeof clearChatHistory>>, TError, { sessionId: string }, TContext> => {
  const mutationFn: MutationFunction<Awaited<ReturnType<typeof clearChatHistory>>, { sessionId: string }> = ({ sessionId }) =>
    clearChatHistory(sessionId, options?.request);
  return useMutation({ mutationFn, ...options?.mutation });
};

// ── Analytics ─────────────────────────────────────────────────────────────────

export const getGetAnalyticsSummaryQueryKey = () => [`/api/analytics/summary`] as const;
export const getGetModelStatusQueryKey = () => [`/api/analytics/model-status`] as const;

export const getAnalyticsSummary = async (options?: RequestInit): Promise<AnalyticsSummary> =>
  customFetch<AnalyticsSummary>(`/api/analytics/summary`, { ...options, method: "GET" });

export function useGetAnalyticsSummary<TData = Awaited<ReturnType<typeof getAnalyticsSummary>>, TError = ErrorType<unknown>>(
  options?: { query?: UseQueryOptions<Awaited<ReturnType<typeof getAnalyticsSummary>>, TError, TData>; request?: SecondParameter<typeof customFetch> }
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryKey = options?.query?.queryKey ?? getGetAnalyticsSummaryQueryKey();
  const queryFn: QueryFunction<Awaited<ReturnType<typeof getAnalyticsSummary>>> = ({ signal }) =>
    getAnalyticsSummary({ signal, ...options?.request });
  const query = useQuery({ queryKey, queryFn, ...options?.query }) as UseQueryResult<TData, TError> & { queryKey: QueryKey };
  query.queryKey = queryKey;
  return query;
}

export const getModelStatus = async (options?: RequestInit): Promise<ModelStatus> =>
  customFetch<ModelStatus>(`/api/analytics/model-status`, { ...options, method: "GET" });

export function useGetModelStatus<TData = Awaited<ReturnType<typeof getModelStatus>>, TError = ErrorType<unknown>>(
  options?: { query?: UseQueryOptions<Awaited<ReturnType<typeof getModelStatus>>, TError, TData>; request?: SecondParameter<typeof customFetch> }
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryKey = options?.query?.queryKey ?? getGetModelStatusQueryKey();
  const queryFn: QueryFunction<Awaited<ReturnType<typeof getModelStatus>>> = ({ signal }) =>
    getModelStatus({ signal, ...options?.request });
  const query = useQuery({ queryKey, queryFn, ...options?.query }) as UseQueryResult<TData, TError> & { queryKey: QueryKey };
  query.queryKey = queryKey;
  return query;
}

// ── Reports ───────────────────────────────────────────────────────────────────

export const getListReportsQueryKey = (params?: ListReportsParams) =>
  [`/api/reports`, ...(params ? [params] : [])] as const;

export const getGetReportQueryKey = (reportId: number) => [`/api/reports/${reportId}`] as const;
export const getGetReportByScanQueryKey = (scanId: number) => [`/api/reports/scan/${scanId}`] as const;

export const listReports = async (params?: ListReportsParams, options?: RequestInit): Promise<Report[]> =>
  customFetch<Report[]>(`/api/reports${buildQueryString(params as Record<string, unknown>)}`, { ...options, method: "GET" });

export function useListReports<TData = Awaited<ReturnType<typeof listReports>>, TError = ErrorType<unknown>>(
  params?: ListReportsParams,
  options?: { query?: UseQueryOptions<Awaited<ReturnType<typeof listReports>>, TError, TData>; request?: SecondParameter<typeof customFetch> }
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryKey = options?.query?.queryKey ?? getListReportsQueryKey(params);
  const queryFn: QueryFunction<Awaited<ReturnType<typeof listReports>>> = ({ signal }) =>
    listReports(params, { signal, ...options?.request });
  const query = useQuery({ queryKey, queryFn, ...options?.query }) as UseQueryResult<TData, TError> & { queryKey: QueryKey };
  query.queryKey = queryKey;
  return query;
}

export const getReport = async (reportId: number, options?: RequestInit): Promise<Report> =>
  customFetch<Report>(`/api/reports/${reportId}`, { ...options, method: "GET" });

export function useGetReport<TData = Awaited<ReturnType<typeof getReport>>, TError = ErrorType<void>>(
  reportId: number,
  options?: { query?: UseQueryOptions<Awaited<ReturnType<typeof getReport>>, TError, TData>; request?: SecondParameter<typeof customFetch> }
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryKey = options?.query?.queryKey ?? getGetReportQueryKey(reportId);
  const queryFn: QueryFunction<Awaited<ReturnType<typeof getReport>>> = ({ signal }) =>
    getReport(reportId, { signal, ...options?.request });
  const query = useQuery({ queryKey, queryFn, enabled: !!reportId, ...options?.query }) as UseQueryResult<TData, TError> & { queryKey: QueryKey };
  query.queryKey = queryKey;
  return query;
}

export const getReportByScan = async (scanId: number, options?: RequestInit): Promise<Report> =>
  customFetch<Report>(`/api/reports/scan/${scanId}`, { ...options, method: "GET" });

export function useGetReportByScan<TData = Awaited<ReturnType<typeof getReportByScan>>, TError = ErrorType<unknown>>(
  scanId: number,
  options?: { query?: UseQueryOptions<Awaited<ReturnType<typeof getReportByScan>>, TError, TData>; request?: SecondParameter<typeof customFetch> }
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryKey = options?.query?.queryKey ?? getGetReportByScanQueryKey(scanId);
  const queryFn: QueryFunction<Awaited<ReturnType<typeof getReportByScan>>> = ({ signal }) =>
    getReportByScan(scanId, { signal, ...options?.request });
  const query = useQuery({ queryKey, queryFn, enabled: !!scanId, ...options?.query }) as UseQueryResult<TData, TError> & { queryKey: QueryKey };
  query.queryKey = queryKey;
  return query;
}
