import { addLolly } from "./addLolly";

exports.handler = async (event: any, context: any) => {
    console.log(event);
    switch (event.source) {
        case "appsync-add-event":
            const lolly = {
                id: event.detail.id,
                sender: event.detail.sender,
                reciever: event.detail.reciever,
                message: event.detail.message,
                lollyTop: event.detail.lollyTop,
                lollyMiddle: event.detail.lollyMiddle,
                lollyBottom: event.detail.lollyBottom,
            }
            await addLolly(lolly)
            context.succeed(event)
        default:
            return null;
    }
}