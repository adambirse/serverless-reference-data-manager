import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import * as AWS from "aws-sdk";

import schema from "./schema";

const items: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  event
) => {
  var ddb = new AWS.DynamoDB({ apiVersion: "2012-08-10" });

  const getItemParams = {
    TableName: process.env.RESOURCE_TABLE,
    Key: {
      id: {
        S: event.body.name,
      },
    },
  };

  try {
    const result = await ddb.getItem(getItemParams).promise();
    return { statusCode: 200, body: JSON.stringify(result) };
  } catch (error) {
    console.log(error);
  }
};

export const main = middyfy(items);
