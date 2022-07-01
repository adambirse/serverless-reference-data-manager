import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { S3Event } from "aws-lambda";
import * as AWS from "aws-sdk";

const s3EventHandler = async (event: S3Event) => {
  console.log(
    `File uploaded, do your thang with event ${JSON.stringify(event)}`
  );

  var ddb = new AWS.DynamoDB({ apiVersion: "2012-08-10" });

  await insertData(ddb, "ItemY", "value1", "value2");

  return formatJSONResponse({
    message: `S3 event handler invoked with ${event}`,
  });


};

  async function insertData(ddb, key, value1, value2) {
    const putParams = {
      TableName: process.env.RESOURCE_TABLE,
      Item: {
        id: { S: key },
        ID1: { S: value1 },
        ID2: { S: value2 },
      },
    };

    await ddb.putItem(putParams).promise();
  }

export const main = middyfy(s3EventHandler);
