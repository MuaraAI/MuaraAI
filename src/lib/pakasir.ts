const PAKASIR_BASE_URL = "https://app.pakasir.com/api";

export interface PakasirCreateResponse {
  payment?: {
    project: string;
    order_id: string;
    amount: number;
    fee: number;
    total_payment: number;
    payment_method: string;
    payment_number: string;
    expired_at: string;
  };
  message?: string;
}

export interface TransactionDetailResponse {
  transaction?: {
    amount: number;
    order_id: string;
    project: string;
    status: string;
    payment_method: string;
    completed_at: string;
  };
}

export async function createPakasirQRIS({
  orderId,
  amount,
}: {
  orderId: string;
  amount: number;
}): Promise<PakasirCreateResponse> {
  const project = process.env.PAKASIR_PROJECT;
  const apiKey = process.env.PAKASIR_API_KEY;

  if (!project || !apiKey) {
    throw new Error("PAKASIR_PROJECT and PAKASIR_API_KEY must be configured");
  }

  const response = await fetch(`${PAKASIR_BASE_URL}/transactioncreate/qris`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      project,
      order_id: orderId,
      amount,
      api_key: apiKey,
    }),
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    throw new Error(`Pakasir API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function getPakasirTransactionDetail(
  orderId: string,
  amount: number,
  options?: {
    project?: string;
    apiKey?: string;
    fetchFn?: typeof fetch;
  }
): Promise<TransactionDetailResponse> {
  const project = options?.project || process.env.PAKASIR_PROJECT;
  const apiKey = options?.apiKey || process.env.PAKASIR_API_KEY;
  const customFetch = options?.fetchFn || fetch;

  if (!project || !apiKey) {
    throw new Error("PAKASIR_PROJECT and PAKASIR_API_KEY must be configured");
  }

  const response = await customFetch(`${PAKASIR_BASE_URL}/transactiondetail`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      project,
      order_id: orderId,
      amount,
      api_key: apiKey,
    }),
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    throw new Error(`Pakasir Detail API error: ${response.status}`);
  }

  return response.json();
}

export async function verifyAndProcessPakasirWebhook(
  payload: { order_id: string; amount: number },
  options?: {
    apiKey?: string;
    project?: string;
    fetchFn?: typeof fetch;
  }
): Promise<{ success: boolean; transaction?: TransactionDetailResponse["transaction"] }> {
  try {
    const project = options?.project || process.env.PAKASIR_PROJECT;
    const detail = await getPakasirTransactionDetail(payload.order_id, payload.amount, options);
    if (!detail.transaction) {
      return { success: false };
    }

    if (
      !project ||
      detail.transaction.project !== project ||
      detail.transaction.status !== "completed" ||
      detail.transaction.amount !== payload.amount
    ) {
      return { success: false };
    }

    return { success: true, transaction: detail.transaction };
  } catch (e) {
    return { success: false };
  }
}
