import { middyfy } from "@libs/lambda";
import S3 from "aws-sdk/clients/s3";
import DynamoDB from "aws-sdk/clients/dynamodb";

import { S3Event } from "aws-lambda";
import * as csv from "@fast-csv/parse";
import { Readable } from "stream";

const s3: S3 = new S3({ apiVersion: "2006-03-01", region: "eu-west-1" });
const ddb = new DynamoDB({ apiVersion: "2012-08-10" });

interface Item {
  key: string;
  value1: string;
  value2: string;
}

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

    const stream = await s3.getObject(params).createReadStream();
    console.log(`Stream: ${stream}`);
    await parseCSV(stream);
  } catch (err) {
    console.log(err);
  }
};

const parseCSV = async (csvStream: Readable) => {
  return new Promise((resolve, reject) => {
    const parsedData = [];
    csvStream
      .pipe(csv.parse({ headers: false, delimiter: "," }))
      .on("error", function (data) {
        console.error(`Got an error: ${data}`);
        reject("Error parsing \n" + data);
      })
      .on("data", (data) => {
        console.log("data received");
        parsedData.push(data);
      })
      .on("end", async () => {
        if (parsedData.length > 0) {
          await persist(parsedData);
        } else {
          console.log("No parsed data to upload");
        }
        resolve("done importing");
      });
  });
};
const persist = async (data: any[]) => {
  try {
    for (const item of data) {
      await insertData(convert(item));
    }
  } catch (e) {
    console.log(e);
  }
};

const insertData = async (item: Item) => {
  console.log(`Inserting ${JSON.stringify(item)} in DB`);
  const putParams = {
    TableName: process.env.RESOURCE_TABLE,
    Item: {
      id: { S: item.key },
      ID1: { S: item.value1 },
      ID2: { S: item.value2 },
    },
  };

  await ddb.putItem(putParams).promise();
};

const convert = (item: any): Item => {
  var result = {
    key: item[0],
    value1: item[1],
    value2: item[2],
  };

  return result;
};

export const main = middyfy(s3EventHandler);
