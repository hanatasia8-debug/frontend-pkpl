type PossibleApiError = {
  response?: {
    status?: number;
    data?: { message?: string; errors?: Record<string, string> } & Record<
      string,
      unknown
    >;
  };
  message?: string;
};

export function mapApiError(err: unknown) {
  const e = err as PossibleApiError | null | undefined;
  // Default fallback
  const result: {
    userMessage: string;
    fieldErrors?: Record<string, string>;
    backendDependency?: boolean;
  } = { userMessage: "Terjadi kesalahan. Silakan coba lagi." };

  if (!e) return result;

  // Axios-like error with response
  if (e.response) {
    const status = e.response.status;
    const data = e.response.data || {};

    // Map common statuses
    if (status === 400) {
      result.userMessage =
        typeof data.message === "string"
          ? data.message
          : "Data tidak valid. Periksa kembali input Anda.";
      // If API returned field-level errors as { errors: { field: msg } }
      if (data.errors && typeof data.errors === "object") {
        result.fieldErrors = data.errors as Record<string, string>;
      }
      return result;
    }

    if (status === 401) {
      result.userMessage = "Sesi Anda telah berakhir. Silakan login kembali.";
      return result;
    }

    if (status === 403) {
      result.userMessage =
        "Anda tidak memiliki izin untuk melakukan tindakan ini.";
      return result;
    }

    if (status === 404) {
      result.userMessage =
        typeof data.message === "string"
          ? data.message
          : "Data tidak ditemukan.";
      return result;
    }

    if (status && status >= 500) {
      result.userMessage =
        "Terjadi masalah pada server. Silakan coba lagi beberapa saat kemudian.";
      result.backendDependency = true;
      return result;
    }

    // Generic server-provided message
    if (data && typeof data.message === "string") {
      result.userMessage = data.message;
      return result;
    }
  }

  // Network error
  if (e.message && e.message.toLowerCase().includes("network")) {
    result.userMessage =
      "Koneksi ke server bermasalah. Periksa koneksi internet Anda lalu coba lagi.";
    return result;
  }

  // Fallback to message if available
  if (e.message) result.userMessage = e.message;

  return result;
}
