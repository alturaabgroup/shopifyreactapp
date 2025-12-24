import { NextRequest, NextResponse } from 'next/server';
import { shopifyRequest } from '@/api/shopifyClient';
import { DELETE_CUSTOMER_ADDRESS } from '@/api/mutations';

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

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Address ID is required' },
        { status: 400 }
      );
    }

    const response: any = await shopifyRequest(
      DELETE_CUSTOMER_ADDRESS,
      {
        customerAccessToken: token,
        id,
      },
      token
    );

    const errors = response.customerAddressDelete?.customerUserErrors;
    if (errors && errors.length > 0) {
      return NextResponse.json(
        { error: errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      deletedAddressId: response.customerAddressDelete.deletedCustomerAddressId,
    });
  } catch (error: any) {
    console.error('Address deletion error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete address' },
      { status: 500 }
    );
  }
}
