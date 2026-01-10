export async function POST(req) {
    return new Response(null, {
      status: 200,
      headers: {
        'Set-Cookie': `token=; Path=/; HttpOnly; Max-Age=0; Secure; SameSite=None`,
      },
    });
  }