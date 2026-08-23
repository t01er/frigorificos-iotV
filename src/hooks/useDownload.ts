import { useState } from "react";

interface UseDownloadOptions {
    url: string;
    method?: "GET" | "POST";
    body?: any;
    fileName?: string;
    headers?: Record<string, string>;
}

interface UseDownloadReturn {
    download: (options?: Partial<UseDownloadOptions>) => Promise<void>;
    loading: boolean;
    error: string | null;
    progress: number;
}

export const useDownload = (options: UseDownloadOptions): UseDownloadReturn => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);

    const getToken = () => {
        return localStorage.getItem('token');
    };

    const download = async (overrideOptions?: Partial<UseDownloadOptions>) => {
        const finalOptions = { ...options, ...overrideOptions };
        const { url, method = "GET", body, fileName: customFileName, headers = {} } = finalOptions;

        setLoading(true);
        setError(null);
        setProgress(0);

        try {
            const token = getToken();
            
            if (!token) {
                throw new Error("No se encontró token de autenticación");
            }

            const fetchHeaders: Record<string, string> = {
                'Authorization': `Bearer ${token}`,
                ...headers,
            };

            if (!(body instanceof FormData)) {
                fetchHeaders['Content-Type'] = 'application/json';
            }

            const fetchOptions: RequestInit = {
                method,
                headers: fetchHeaders,
                signal: AbortSignal.timeout(600000), 
            };

            if (body) {
                if (body instanceof FormData) {
                    fetchOptions.body = body;
                } else {
                    fetchOptions.body = JSON.stringify(body);
                }
            }

            const response = await fetch(url, fetchOptions);

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                    throw new Error("Sesión expirada. Por favor, inicie sesión nuevamente.");
                }
                throw new Error(`Error al descargar: ${response.statusText}`);
            }

            const blob = await response.blob();
            
            if (blob.size === 0) {
                throw new Error("El archivo descargado está vacío");
            }

            const contentDisposition = response.headers.get("content-disposition");
            let fileName = customFileName || generateDefaultFileName();

            if (contentDisposition && contentDisposition.includes("filename=")) {
                const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                if (match && match[1]) {
                    fileName = match[1].replace(/['"]/g, "");
                }
            }

            const contentType = response.headers.get("content-type");
            const isZip = contentType?.includes("application/zip") || 
                         fileName.endsWith(".zip") ||
                         url.includes("zip");

            const finalFileName = isZip && !fileName.endsWith(".zip") 
                ? `${fileName}.zip` 
                : fileName;

            const urlBlob = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = urlBlob;
            link.setAttribute("download", finalFileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(urlBlob);
            
            setProgress(100);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Error al descargar el archivo";
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const generateDefaultFileName = () => {
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 19).replace(/[:T]/g, "-");
        return `download_${dateStr}`;
    };

    return { download, loading, error, progress };
};