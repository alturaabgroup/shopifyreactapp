import { NextRequest, NextResponse } from 'next/server';
import { shopifyRequest } from '@/api/shopifyClient';
import { UPDATE_CUSTOMER_ADDRESS } from '@/api/mutations';

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

    const { id, address } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Address ID is required' },
        { status: 400 }
      );
    }

    const response: any = await shopifyRequest(
      UPDATE_CUSTOMER_ADDRESS,
      {
        customerAccessToken: token,
        id,
        address,
      },
      token
    );

    const errors = response.customerAddressUpdate?.customerUserErrors;
    if (errors && errors.length > 0) {
      return NextResponse.json(
        { error: errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      address: response.customerAddressUpdate.customerAddress,
    });
  } catch (error: any) {
    console.error('Address update error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update address' },
      { status: 500 }
    );
  }
}
