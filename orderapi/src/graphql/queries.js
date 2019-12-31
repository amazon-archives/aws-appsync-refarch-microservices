/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getOrder = `query GetOrder($userId: ID!, $orderDateTime: String!, $status: Status!) {
  getOrder(userId: $userId, orderDateTime: $orderDateTime, status: $status) {
    userId
    status
    orderDateTime
    details
    orderId
  }
}
`;
export const listOrders = `query ListOrders(
  $userId: ID
  $orderDateTimeStatus: ModelOrderPrimaryCompositeKeyConditionInput
  $filter: ModelOrderFilterInput
  $limit: Int
  $nextToken: String
  $sortDirection: ModelSortDirection
) {
  listOrders(
    userId: $userId
    orderDateTimeStatus: $orderDateTimeStatus
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    sortDirection: $sortDirection
  ) {
    items {
      userId
      status
      orderDateTime
      details
      orderId
    }
    nextToken
  }
}
`;
