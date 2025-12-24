import { NextRequest, NextResponse } from 'next/server';
import { shopifyRequest } from '@/api/shopifyClient';
import { CREATE_CUSTOMER, CREATE_CUSTOMER_ACCESS_TOKEN } from '@/api/mutations';
import { GET_CUSTOMER } from '@/api/queries';

const COOKIE_NAME = process.env.COOKIE_NAME || 'cust_token';
const COOKIE_SECURE = process.env.COOKIE_SECURE === 'true';

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Create customer
    const createResponse: any = await shopifyRequest(CREATE_CUSTOMER, {
      input: {
        email,
        password,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
      },
    });

    const errors = createResponse.customerCreate?.customerUserErrors;
    if (errors && errors.length > 0) {
      return NextResponse.json(
        { error: errors[0].message },
        { status: 400 }
      );
    }

    // Create access token
    const tokenResponse: any = await shopifyRequest(CREATE_CUSTOMER_ACCESS_TOKEN, {
      input: { email, password },
    });

    const tokenErrors = tokenResponse.customerAccessTokenCreate?.customerUserErrors;
    if (tokenErrors && tokenErrors.length > 0) {
      return NextResponse.json(
        { error: tokenErrors[0].message },
        { status: 401 }
      );
    }

    const { accessToken, expiresAt } = tokenResponse.customerAccessTokenCreate.customerAccessToken;

    // Get customer details
    const customerResponse: any = await shopifyRequest(
      GET_CUSTOMER,
      { customerAccessToken: accessToken },
      accessToken
    );

    const customer = customerResponse.customer;
    if (!customer) {
      return NextResponse.json(
        { error: 'Failed to fetch customer details' },
        { status: 500 }
      );
    }

    // Set http-only cookie
    const response = NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
      },
    });

    const expiryDate = new Date(expiresAt);
    response.cookies.set(COOKIE_NAME, accessToken, {
      httpOnly: true,
      secure: COOKIE_SECURE,
      sameSite: 'lax',
      expires: expiryDate,
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: error.message || 'Signup failed' },
      { status: 500 }
    );
  }
}
