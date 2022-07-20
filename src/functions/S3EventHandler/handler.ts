import { middyfy } from "@libs/lambda";
import S3 from "aws-sdk/clients/s3";

import { S3Event } from "aws-lambda";
import * as csv from "@fast-csv/parse";
import { Readable } from "stream";

const s3: S3 = new S3({ apiVersion: "2006-03-01", region: "eu-west-1" });

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

export const main = middyfy(s3EventHandler);

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
          persist(parsedData);
        } else {
          console.log("No parsed data to upload");
        }
        resolve("done importing");
      });
  });
};
const persist = (data: any[]) => {
  data.forEach((item) => {
    console.log(item);
  });
};
