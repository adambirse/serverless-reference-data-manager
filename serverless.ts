import type { AWS } from "@serverless/typescript";
import dynamoDbTables from "./resources/dynamodb-tables";

import hello from "./src/functions/hello";
import items from "./src/functions/items";
import s3EventHandler from "./src/functions/S3EventHandler";


const serverlessConfiguration: AWS = {
  service: "reference-data-manager",
  frameworkVersion: "3",
  plugins: ["serverless-esbuild", "serverless-offline"],
  provider: {
    name: "aws",
    region: "eu-west-1",
    runtime: "nodejs14.x",
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
      RESOURCE_TABLE: "resource-table",
    },
    iam: {
      role: {
        statements: [
          {
            Effect: "Allow",
            Action: [
              "dynamodb:DescribeTable",
              "dynamodb:Query",
              "dynamodb:Scan",
              "dynamodb:GetItem",
              "dynamodb:PutItem",
              "dynamodb:UpdateItem",
              "dynamodb:DeleteItem",
            ],
            Resource: [{ "Fn::GetAtt": ["ResourceTable", "Arn"] }],
          },
        ],
      },
    },
  },
  // import the function via paths
  functions: { hello, items, s3EventHandler },
  resources: {
    Resources: {
      ...dynamoDbTables,
    },
  },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ["aws-sdk"],
      target: "node14",
      define: { "require.resolve": undefined },
      platform: "node",
      concurrency: 10,
    },
  },
};

module.exports = serverlessConfiguration;
