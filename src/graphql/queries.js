/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getPaymentAccounts = `query GetPaymentAccounts($userId: ID!) {
  getPaymentAccounts(userId: $userId) {
    userId
    type
    details
  }
}
`;
export const getUserInfo = `query GetUserInfo($userName: ID!) {
  getUserInfo(userName: $userName) {
    userName
    email
    phoneNumber
  }
}
`;
export const listRecentOrders = `query ListRecentOrders($userId: ID!, $orderDateTime: String!) {
  listRecentOrders(userId: $userId, orderDateTime: $orderDateTime) {
    userId
    status
    orderDateTime
    details
    orderId
  }
}
`;
export const listRecentOrdersByStatus = `query ListRecentOrdersByStatus(
  $userId: ID!
  $orderDateTime: String!
  $status: OrderStatus!
) {
  listRecentOrdersByStatus(
    userId: $userId
    orderDateTime: $orderDateTime
    status: $status
  ) {
    userId
    status
    orderDateTime
    details
    orderId
  }
}
`;
