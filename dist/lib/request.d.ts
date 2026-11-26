export default class Request {
    instance: any;
    private static readonly SAFE_COOKIE_NAME_PATTERN;
    private static readonly SAFE_COOKIE_VALUE_PATTERN;
    private static readonly MAX_COOKIE_VALUE_LENGTH;
    private static readonly SAFE_BEARER_TOKEN_PATTERN;
    private static readonly MAX_BEARER_TOKEN_LENGTH;
    private static readonly UNSAFE_HTML_CHARS_PATTERN;
    private static readonly CONTROL_CHARS_PATTERN;
    constructor(instance: any);
    currentRequest: any;
    lastRequestInfo: {
        url: string;
        method: string;
        headers: Record<string, string | boolean>;
        body: unknown;
    } | null;
    lastResponseInfo: unknown;
    abort(): void;
    send(authUrl: string, url: string, method: 'GET' | 'POST', callback: (data: object) => void, data?: string, headers?: {
        key: string;
        value: string | boolean;
    }[]): void;
    private sanitizeCookieValue;
    private sanitizeBearerToken;
    private safeParseJson;
    private sanitizeString;
    private sanitizeResponsePayload;
    getCookie(name: string): string | null;
}
