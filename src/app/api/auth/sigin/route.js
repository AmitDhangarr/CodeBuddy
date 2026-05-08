export async function POST(request) {
  try {
    const data = await request.json();
    console.log('Received data:', data);
    
    return Response.json(
      { message: 'Sign in successful', data },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      { error: 'Sign in failed', details: error.message },
      { status: 400 }
    );
  }
}