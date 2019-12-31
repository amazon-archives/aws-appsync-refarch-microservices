import json 
import os
import boto3
import sys
import logging

from flask import Flask, make_response, request
from flask.logging import create_logger


app = Flask(__name__)
log = create_logger(app)



ddb_client = boto3.client('dynamodb', region_name=os.environ['AWS_REGION'])

@app.route("/payments/health", methods=['GET'] )
def checkHealth():
    response = make_response(json.dumps({"message" : "ok"}), 200)
    response.headers['Content-Type'] = 'application/json'
    return response 

@app.route("/payments/accounts/<string:userId>", methods=['GET'] )
def getPaymentMethod(userId):
    log.info('Incoming Params: {0}'.format(request))

    # default is 404: No Records Found
    response_code=404
    response_body=None
    try:
        query_response = ddb_client.query(
            TableName=os.environ['PaymentAccountTableName'],
            Limit=10,
            ConsistentRead=False,
            KeyConditionExpression='userId = :userId',
            ExpressionAttributeValues={
                ":userId": {"S": userId}
            }
        )
        
        log.info('query_response: {0}'.format(query_response))

        if query_response['ResponseMetadata']['HTTPStatusCode'] == 200 and len(query_response['Items']) > 0:
            response_code = 200
            response_body = []
            for item in query_response['Items']:
                response_body.append (
                    {
                        "userId" : item['userId']['S'],
                        "type" : item['type']['S'],
                        "details" : item['details']['S']
                    }
                )
    except:
        log.error('Unknown Exceptions: {0}'.format(sys.exc_info()))
        response_code = 500

    
    response = make_response(json.dumps(response_body), response_code)
    response.headers['Content-Type'] = 'application/json'
    return response 

@app.route("/payments/account", methods=['POST'] )
def addPaymentMethod():
    log.info('Incoming Params: {0}'.format(request))

    try:
        payload = request.get_json()

        response_code = 400
        response_body= payload

        log.info('put_item_request: {0}'.format(payload))

        put_item_response = ddb_client.put_item(
            TableName=os.environ['PaymentAccountTableName'],
            Item={
                'userId': {
                    'S': payload['userId']
                },
                'type' : {
                    'S': payload['type']
                },
                'details' : {
                    'S' : payload['details']
                }
            }
        )
        log.info('put_item_response: {0}'.format(put_item_response))


        if put_item_response['ResponseMetadata']['HTTPStatusCode'] == 200:
            response_code = 200

    except:
        log.error('Exceptions: {0}'.format(sys.exc_info()))
        response_code = 500

    
    response = make_response(json.dumps(response_body), response_code)
    response.headers['Content-Type'] = 'application/json'

    return response 

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=7000)







