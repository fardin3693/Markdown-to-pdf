export type TransferPhase = 'idle' | 'uploading' | 'processing' | 'done' | 'error' | 'cancelled';

export interface UploadBlobWithProgressOptions {
    url: string;
    method?: string;
    formData?: FormData;
    body?: XMLHttpRequestBodyInit | null;
    headers?: Record<string, string>;
    onProgress?: (progress: number) => void;
    onPhaseChange?: (phase: TransferPhase) => void;
}

export interface UploadBlobWithProgressResult {
    blob: Blob;
    headers: Record<string, string>;
}

export interface UploadBlobWithProgressRequest extends Promise<UploadBlobWithProgressResult> {
    abort: () => void;
}

function resolveApiUrl(url: string): string {
    if (/^https?:\/\//.test(url)) {
        return url;
    }

    if (!url.startsWith('/api/')) {
        return url;
    }

    const configuredBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');

    if (configuredBaseUrl) {
        return `${configuredBaseUrl}${url}`;
    }

    if (typeof window !== 'undefined') {
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        if (isLocalhost) {
            return `http://127.0.0.1:3001${url}`;
        }
    }

    return url;
}

function parseHeaders(rawHeaders: string): Record<string, string> {
    return rawHeaders
        .trim()
        .split(/[\r\n]+/)
        .filter(Boolean)
        .reduce<Record<string, string>>((headers, line) => {
            const parts = line.split(': ');
            const key = parts.shift();
            if (!key) {
                return headers;
            }
            headers[key.toLowerCase()] = parts.join(': ');
            return headers;
        }, {});
}

async function getXhrErrorMessage(xhr: XMLHttpRequest): Promise<string> {
    const fallback = `Request failed with status ${xhr.status}`;
    const response = xhr.response;

    if (response instanceof Blob) {
        const text = await response.text();
        if (!text.trim()) {
            return fallback;
        }

        try {
            const parsed = JSON.parse(text) as { error?: string; details?: string; message?: string };
            return parsed.details || parsed.error || parsed.message || fallback;
        } catch {
            return text;
        }
    }

    if (typeof xhr.responseText === 'string' && xhr.responseText.trim()) {
        try {
            const parsed = JSON.parse(xhr.responseText) as { error?: string; details?: string; message?: string };
            return parsed.details || parsed.error || parsed.message || fallback;
        } catch {
            return xhr.responseText;
        }
    }

    return fallback;
}

export function uploadBlobWithProgress({
    url,
    method = 'POST',
    formData,
    body,
    headers,
    onProgress,
    onPhaseChange,
}: UploadBlobWithProgressOptions): UploadBlobWithProgressRequest {
    let xhr: XMLHttpRequest | null = null;
    const requestBody = formData ?? body ?? null;

    const promise = new Promise<UploadBlobWithProgressResult>((resolve, reject) => {
        xhr = new XMLHttpRequest();
        const requestUrl = resolveApiUrl(url);

        xhr.open(method, requestUrl, true);
        xhr.responseType = 'blob';

        if (headers) {
            Object.entries(headers).forEach(([key, value]) => {
                xhr?.setRequestHeader(key, value);
            });
        }

        onPhaseChange?.('uploading');
        onProgress?.(0);

        xhr.upload.onprogress = (event) => {
            if (!event.lengthComputable) {
                return;
            }

            const progress = Math.min(100, Math.round((event.loaded / event.total) * 100));
            onProgress?.(progress);
        };

        xhr.upload.onload = () => {
            onProgress?.(100);
            onPhaseChange?.('processing');
        };

        xhr.onload = async () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                onPhaseChange?.('done');
                resolve({
                    blob: xhr.response,
                    headers: parseHeaders(xhr.getAllResponseHeaders()),
                });
                return;
            }

            onPhaseChange?.('error');
            reject(new Error(await getXhrErrorMessage(xhr)));
        };

        xhr.onerror = () => {
            onPhaseChange?.('error');
            reject(new Error('Network error while uploading file.'));
        };

        xhr.onabort = () => {
            onPhaseChange?.('cancelled');
            onProgress?.(0);
            reject(new Error('Upload aborted.'));
        };

        xhr.send(requestBody);
    });

    const request = promise as UploadBlobWithProgressRequest;
    request.abort = () => {
        if (xhr && xhr.readyState !== XMLHttpRequest.DONE) {
            xhr.abort();
        }
    };

    return request;
}

export function isUploadAbortError(error: unknown): boolean {
    return error instanceof Error && error.message === 'Upload aborted.';
}

export function readFileAsArrayBufferWithProgress(
    file: File,
    onProgress?: (progress: number) => void,
): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        onProgress?.(0);

        reader.onprogress = (event) => {
            if (!event.lengthComputable) {
                return;
            }

            const progress = Math.min(100, Math.round((event.loaded / event.total) * 100));
            onProgress?.(progress);
        };

        reader.onload = () => {
            onProgress?.(100);
            resolve(reader.result as ArrayBuffer);
        };

        reader.onerror = () => {
            reject(new Error('Failed to read file.'));
        };

        reader.readAsArrayBuffer(file);
    });
}
