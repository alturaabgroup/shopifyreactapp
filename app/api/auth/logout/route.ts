import { NextResponse } from 'next/server';

const COOKIE_NAME = process.env.COOKIE_NAME || 'cust_token';

export async function POST() {
  const response = NextResponse.json({ success: true });
  
  // Clear the cookie
  response.cookies.delete(COOKIE_NAME);

  return response;
}
