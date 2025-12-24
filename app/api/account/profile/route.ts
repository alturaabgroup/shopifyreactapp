import { NextRequest, NextResponse } from 'next/server';
import { shopifyRequest } from '@/api/shopifyClient';
import { GET_CUSTOMER } from '@/api/queries';

const COOKIE_NAME = process.env.COOKIE_NAME || 'cust_token';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const response: any = await shopifyRequest(
      GET_CUSTOMER,
      { customerAccessToken: token },
      token
    );

    const customer = response.customer;
    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      customer: {
        id: customer.id,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: customer.phone,
        defaultAddress: customer.defaultAddress,
      },
    });
  } catch (error: any) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}
