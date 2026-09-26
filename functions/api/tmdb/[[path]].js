const TMDB_ORIGIN = "https://api.themoviedb.org/3";

function isAllowedPath(path) {
  return /^\/trending\/all\/day$/.test(path)
    || /^\/search\/multi$/.test(path)
    || /^\/find\/tt\d+$/.test(path)
    || /^\/movie\/\d+$/.test(path)
    || /^\/tv\/\d+$/.test(path)
    || /^\/tv\/\d+\/season\/\d+$/.test(path);
}

export async function onRequestGet({ request, env, params }) {
  const pathValue = Array.isArray(params.path) ? params.path.join("/") : params.path || "";
  const path = `/${pathValue}`;

  if (!isAllowedPath(path)) {
    return new Response("Not found", { status: 404 });
  }

  const token = env.TMDB_ACCESS_TOKEN;
  const apiKey = env.TMDB_API_KEY;
  if (!token && !apiKey) {
    return new Response("TMDB credentials are not configured", { status: 500 });
  }

  const requestUrl = new URL(request.url);
  const upstreamUrl = new URL(`${TMDB_ORIGIN}${path}`);
  requestUrl.searchParams.forEach((value, key) => {
    if (key !== "api_key") {
      upstreamUrl.searchParams.set(key, value);
    }
  });
  if (apiKey) {
    upstreamUrl.searchParams.set("api_key", apiKey);
  }

  const headers = new Headers({ accept: "application/json" });
  if (token) {
    headers.set("authorization", `Bearer ${token}`);
  }

  const response = await fetch(upstreamUrl, { headers });
  return new Response(response.body, {
    status: response.status,
    headers: {
      "content-type": response.headers.get("content-type") || "application/json",
      "cache-control": "public, max-age=300"
    }
  });
}
