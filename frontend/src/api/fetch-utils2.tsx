import {useAuthService} from "../auth/auth-utils";
import {ImageHandle} from "../components/Editor/utils/types";

export class NamedBlob {
    constructor(
        public blob: Blob,
        public filename: string,
    ) {}
}

export const useApiService = () => {

    const authSerivce = useAuthService();

    async function performDataRequest<T>(
        method: string,
        url: string,
        data: { [key: string]: any },
    ) {
        if (authSerivce.isLoggedIn()) await authSerivce.handleLogin();

        const formData = new FormData();
        // Convert the `data` object into a `formData` object by iterating
        // through the keys and appending the (key, value) pair to the FormData
        // object. All non-Blob values are converted to a string.
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                const val = data[key];
                if (val === undefined) continue;
                if (val instanceof File || val instanceof Blob) {
                    formData.append(key, val);
                } else if (val instanceof NamedBlob) {
                    formData.append(key, val.blob, val.filename);
                } else {
                    formData.append(key, val.toString());
                }
            }
        }

        const response = await fetch(url, {
            credentials: "include",
            headers: getHeaders(),
            method,
            body: formData,
        });
        try {
            const body = await response.json();
            if (response.status === 401) {
                await authSerivce.requestToken();
                return performDataRequest<T>(method, url, data);
            }
            if (!response.ok) {
                return Promise.reject(body.err);
            }
            return body as T;
        } catch (e: any) {
            return Promise.reject(e.toString());
        }
    }

    async function performRequest<T>(method: string, url: string) {
        if (authSerivce.isLoggedIn()) await authSerivce.handleLogin();
        const response = await fetch(url, {
            credentials: "include",
            headers: getHeaders(),
            method,
        });
        try {
            const body = await response.json();
            if (response.status === 401) {
                await authSerivce.requestToken();
                return performRequest<T>(method, url);
            }
            if (!response.ok) {
                return Promise.reject(body.err);
            }
            return body as T;
        } catch (e: any) {
            return Promise.reject(e.toString());
        }
    }

    function fetchPost<T = any>(url: string, data: { [key: string]: any }) {
        return performDataRequest<T>("POST", url, data);
    }

    function fetchPut<T = any>(url: string, data: { [key: string]: any }) {
        return performDataRequest<T>("PUT", url, data);
    }

    function fetchDelete<T = any>(url: string) {
        return performRequest<T>("DELETE", url);
    }

    function fetchGet<T = any>(url: string) {
        return performRequest<T>("GET", url);
    }

    function download(url: string, name?: string) {
        const a = document.createElement("a");
        document.body.appendChild(a);
        a.href = url;
        a.target = "_blank";
        a.download = name ?? "file";
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
        }, 0);
    }

    async function downloadIndirect(url: string) {
        const { value: signedUrl } = await fetchGet(url);
        download(signedUrl);
    }

    function imageHandler(file: File): Promise<ImageHandle> {
        return new Promise((resolve, reject) => {
            fetchPost("/api/image/upload/", {
                file,
            })
                .then(res => {
                    resolve({
                        name: file.name,
                        src: res.filename,
                        remove: async () => {
                            await fetchPost(`/api/image/remove/${res.filename}/`, {});
                        },
                    });
                })
                .catch(e => reject(e));
        });
    }

    return { fetchPost, fetchPut, fetchDelete, fetchGet, download, downloadIndirect, imageHandler };
}

function getHeaders() {
    const headers: Record<string, string> = {
        "Authorization": `Bearer ${localStorage.getItem("access_token")}`, // hsg token
    };

    return headers;
}

