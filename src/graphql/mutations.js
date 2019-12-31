/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const addPaymentAccount = `mutation AddPaymentAccount(
  $userId: ID!
  $paymentAccountType: String!
  $paymentAccountDetails: String!
) {
  addPaymentAccount(
    userId: $userId
    paymentAccountType: $paymentAccountType
    paymentAccountDetails: $paymentAccountDetails
  ) {
    userId
    type
    details
  }
}
`;
export const addOrder = `mutation AddOrder($userId: ID!, $orderDateTime: String!, $details: String!) {
  addOrder(userId: $userId, orderDateTime: $orderDateTime, details: $details) {
    userId
    status
    orderDateTime
    details
    orderId
  }
}
`;
