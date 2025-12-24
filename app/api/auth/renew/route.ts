import { NextRequest, NextResponse } from 'next/server';
import { shopifyRequest } from '@/api/shopifyClient';
import { RENEW_CUSTOMER_ACCESS_TOKEN } from '@/api/mutations';

const COOKIE_NAME = process.env.COOKIE_NAME || 'cust_token';
const COOKIE_SECURE = process.env.COOKIE_SECURE === 'true';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'No token found' },
        { status: 401 }
      );
    }

    // Renew token
    const response: any = await shopifyRequest(RENEW_CUSTOMER_ACCESS_TOKEN, {
      customerAccessToken: token,
    });

    const errors = response.customerAccessTokenRenew?.userErrors;
    if (errors && errors.length > 0) {
      return NextResponse.json(
        { error: errors[0].message },
        { status: 401 }
      );
    }

    const { accessToken, expiresAt } = response.customerAccessTokenRenew.customerAccessToken;

    // Set new cookie
    const nextResponse = NextResponse.json({ success: true });

    const expiryDate = new Date(expiresAt);
    nextResponse.cookies.set(COOKIE_NAME, accessToken, {
      httpOnly: true,
      secure: COOKIE_SECURE,
      sameSite: 'lax',
      expires: expiryDate,
      path: '/',
    });

    return nextResponse;
  } catch (error: any) {
    console.error('Token renewal error:', error);
    return NextResponse.json(
      { error: error.message || 'Token renewal failed' },
      { status: 500 }
    );
  }
}
