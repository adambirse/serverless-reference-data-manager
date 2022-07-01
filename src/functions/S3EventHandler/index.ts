import { handlerPath } from "@libs/handler-resolver";

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      s3: {
        bucket: "rdm-unique-bucket-name",
        event: "s3:ObjectCreated:*",
      },
    },
  ],
};
