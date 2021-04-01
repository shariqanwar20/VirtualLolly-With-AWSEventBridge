import * as AWS from 'aws-sdk';
// import { randomBytes } from 'crypto';
const docClient = new AWS.DynamoDB.DocumentClient();
const events = new AWS.EventBridge();

export const addLolly = async (lolly: Lolly) => {
    // const id = {
    //     id: randomBytes(32).toString("hex")
    // }
    // const newLolly = {...lolly, ...id}
    const params = {
        TableName: process.env.TABLE_NAME || "VirtualLollyTable",
        Item: lolly
    }

    const e = await events.putEvents({
        Entries: [
            {
                EventBusName: "default",
                Source: "rebuild-pipeline",
                DetailType: "rebuild pipeline when lolly is added",
                Detail: `{"action" : "codeBuild"}`
            }
        ]
    }).promise();
    console.log(JSON.stringify(e));
    await docClient.put(params).promise();
}