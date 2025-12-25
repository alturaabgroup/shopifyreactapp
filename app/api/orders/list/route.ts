import { NextRequest, NextResponse } from 'next/server';
import { shopifyRequest } from '@/api/shopifyClient';
import { GET_CUSTOMER_ORDERS } from '@/api/queries';

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
      GET_CUSTOMER_ORDERS,
      { customerAccessToken: token, first: 50 },
      token
    );

    const customer = response.customer;
    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    const orders = customer.orders.edges.map((edge: any) => edge.node);

    return NextResponse.json({ orders });
  } catch (error: any) {
    console.error('Orders fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
