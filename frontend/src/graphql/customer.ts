import { storefrontClient } from '../lib/storefrontClient';

/**
 * Customer login with email and password
 */
export async function customerLogin(email: string, password: string) {
  const mutation = `
    mutation CustomerLogin($input: CustomerAccessTokenCreateInput!) {
      customerAccessTokenCreate(input: $input) {
        customerAccessToken {
          accessToken
          expiresAt
        }
        customerUserErrors {
          code
          field
          message
        }
      }
    }
  `;

  const variables = {
    input: {
      email,
      password,
    },
  };

  const data = await storefrontClient.query<any>(mutation, variables);

  if (data.customerAccessTokenCreate.customerUserErrors?.length > 0) {
    throw new Error(data.customerAccessTokenCreate.customerUserErrors[0].message);
  }

  return data.customerAccessTokenCreate.customerAccessToken;
}

/**
 * Create a new customer account
 */
export async function customerRegister(input: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  acceptsMarketing?: boolean;
}) {
  const mutation = `
    mutation CustomerCreate($input: CustomerCreateInput!) {
      customerCreate(input: $input) {
        customer {
          id
          email
          firstName
          lastName
        }
        customerUserErrors {
          code
          field
          message
        }
      }
    }
  `;

  const variables = { input };

  const data = await storefrontClient.query<any>(mutation, variables);

  if (data.customerCreate.customerUserErrors?.length > 0) {
    throw new Error(data.customerCreate.customerUserErrors[0].message);
  }

  return data.customerCreate.customer;
}

/**
 * Get customer information
 */
export async function getCustomer(accessToken: string) {
  const query = `
    query GetCustomer($accessToken: String!) {
      customer(customerAccessToken: $accessToken) {
        id
        email
        firstName
        lastName
        displayName
        phone
        acceptsMarketing
        defaultAddress {
          id
          address1
          address2
          city
          province
          country
          zip
        }
        addresses(first: 10) {
          edges {
            node {
              id
              address1
              address2
              city
              province
              country
              zip
            }
          }
        }
        orders(first: 10) {
          edges {
            node {
              id
              name
              orderNumber
              processedAt
              financialStatus
              fulfillmentStatus
              totalPrice {
                amount
                currencyCode
              }
              lineItems(first: 50) {
                edges {
                  node {
                    title
                    quantity
                    variant {
                      id
                      title
                      image {
                        url
                        altText
                      }
                      price {
                        amount
                        currencyCode
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const data = await storefrontClient.query<any>(query, { accessToken });
  if (!data.customer) return null;

  return {
    ...data.customer,
    addresses: data.customer.addresses.edges.map((edge: any) => edge.node),
    orders: data.customer.orders.edges.map((edge: any) => ({
      ...edge.node,
      lineItems: edge.node.lineItems.edges.map((lineEdge: any) => lineEdge.node),
    })),
  };
}

/**
 * Customer logout
 */
export async function customerLogout(accessToken: string) {
  const mutation = `
    mutation CustomerLogout($customerAccessToken: String!) {
      customerAccessTokenDelete(customerAccessToken: $customerAccessToken) {
        deletedAccessToken
        deletedCustomerAccessTokenId
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables = {
    customerAccessToken: accessToken,
  };

  const data = await storefrontClient.query<any>(mutation, variables);

  if (data.customerAccessTokenDelete.userErrors?.length > 0) {
    throw new Error(data.customerAccessTokenDelete.userErrors[0].message);
  }

  return true;
}

/**
 * Password reset request
 */
export async function customerRecover(email: string) {
  const mutation = `
    mutation CustomerRecover($email: String!) {
      customerRecover(email: $email) {
        customerUserErrors {
          code
          field
          message
        }
      }
    }
  `;

  const variables = { email };

  const data = await storefrontClient.query<any>(mutation, variables);

  if (data.customerRecover.customerUserErrors?.length > 0) {
    throw new Error(data.customerRecover.customerUserErrors[0].message);
  }

  return true;
}
