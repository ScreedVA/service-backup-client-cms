// lib/payloadClient.ts

export type PayloadDomain = string;

export type CollectionQueryOptions = {
  depth?: number;
  limit?: number;
  page?: number;
  sort?: string;
  where?: Record<string, any>;
};

export type GlobalQueryOptions = {
  depth?: number;
};

function buildQueryString(params: Record<string, any>) {
  const search = new URLSearchParams();

  for (const key of Object.keys(params)) {
    const value = params[key];
    if (value === undefined || value === null) continue;

    if (typeof value === "object") {
      // Payload supports nested query params like where[field][equals]
      // We'll flatten them recursively
      const flatten = (obj: any, prefix: string) => {
        for (const k in obj) {
          const v = obj[k];
          const nextKey = `${prefix}[${k}]`;

          if (typeof v === "object" && v !== null) {
            flatten(v, nextKey);
          } else {
            search.append(nextKey, String(v));
          }
        }
      };

      flatten(value, key);
    } else {
      search.append(key, String(value));
    }
  }

  return search.toString();
}

export async function queryCollection<T = any>(
  domain: PayloadDomain,
  collectionSlug: string,
  options: CollectionQueryOptions = {
    depth: 0,
  },
  token?: string
): Promise<T> {
  const query = buildQueryString(options);

  const url = `https://${domain.replace(/\/$/, "")}/api/${collectionSlug}${query ? `?${query}` : ""}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `JWT ${token}` } : {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Payload collection query failed for url: ${url} (${res.status}): ${text}`);
  }

  return res.json();
}

export async function queryGlobal<T = any>(
  domain: PayloadDomain,
  globalSlug: string,
  options: GlobalQueryOptions = {
    depth: 0,
  },
  token?: string
): Promise<T> {
  const query = buildQueryString(options);

  const url = `https://${domain.replace(/\/$/, "")}/api/globals/${globalSlug}${query ? `?${query}` : ""}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `JWT ${token}` } : {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Payload global query failed for url: ${url} (${res.status}): ${text}`);
  }

  return res.json();
}

// queryGlobal("perfometrics.co", "shared-section").then((data) => console.log("Global Data:", data));
// queryCollection("perfometrics.co", "regions").then((data) => console.log("Collection Data:", data));
