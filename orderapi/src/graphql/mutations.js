/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const addOrder = `mutation AddOrder($input: CreateOrderInput!) {
  addOrder(input: $input) {
    userId
    status
    orderDateTime
    details
    orderId
  }
}
`;
export const cancelOrder = `mutation CancelOrder($input: DeleteOrderInput!) {
  cancelOrder(input: $input) {
    userId
    status
    orderDateTime
    details
    orderId
  }
}
`;
