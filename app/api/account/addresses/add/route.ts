import { NextRequest, NextResponse } from 'next/server';
import { shopifyRequest } from '@/api/shopifyClient';
import { CREATE_CUSTOMER_ADDRESS } from '@/api/mutations';

const COOKIE_NAME = process.env.COOKIE_NAME || 'cust_token';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const address = await request.json();

    const response: any = await shopifyRequest(
      CREATE_CUSTOMER_ADDRESS,
      {
        customerAccessToken: token,
        address,
      },
      token
    );

    const errors = response.customerAddressCreate?.customerUserErrors;
    if (errors && errors.length > 0) {
      return NextResponse.json(
        { error: errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      address: response.customerAddressCreate.customerAddress,
    });
  } catch (error: any) {
    console.error('Address creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create address' },
      { status: 500 }
    );
  }
}
