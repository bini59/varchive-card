// Cloudflare Pages Functions - API Proxy
// /api/archive/* 요청을 v-archive.net/api/archive/*로 프록시

interface Env {}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { params } = context;
  const path = (params.path as string[])?.join('/') || '';

  const targetUrl = `https://v-archive.net/api/archive/${path}`;

  const response = await fetch(targetUrl, {
    method: context.request.method,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'vArchive-Card/1.0',
    },
  });

  // CORS 헤더 추가
  const newResponse = new Response(response.body, response);
  newResponse.headers.set('Access-Control-Allow-Origin', '*');
  newResponse.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  newResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type');

  return newResponse;
};

// OPTIONS 요청 처리 (CORS preflight)
export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};