export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${env.GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent('https://www.anlaisz.com/api/auth')}&scope=repo`;
    return Response.redirect(githubAuthUrl, 302);
  }

  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  const tokenData = await tokenResponse.json();
  const script = `
    <script>
      window.opener.postMessage(
        'authorization:github:success:${JSON.stringify({ token: tokenData.access_token })}',
        '*'
      );
      window.close();
    </script>
  `;
  return new Response(script, { headers: { 'Content-Type': 'text/html' } });
}
