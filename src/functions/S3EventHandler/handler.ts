import { middyfy } from "@libs/lambda";
var AWS = require("aws-sdk");

import { S3Event } from "aws-lambda";

const s3 = new AWS.S3({});

const s3EventHandler = async (event: S3Event) => {
  for (const record of event.Records) {
    await handle(record);
  }
};

const handle = async (record) => {
  const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));
  const bucketName = record.s3.bucket.name;

  console.log(" File name -->  ", key);
  console.log(`Bucket: ${bucketName}`);

  const params = {
    Bucket: bucketName,
    Key: key,
  };

  try {
    console.log(`getting data from s3 bucket ${bucketName} with key ${key}.`);

    const { ContentType } = await s3.getObject(params).promise();
    console.log("CONTENT TYPE:", ContentType);
  } catch (err) {
    console.log(err);
  }
};
export const main = middyfy(s3EventHandler);
