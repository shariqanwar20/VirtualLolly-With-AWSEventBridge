const path = require("path");
require("dotenv").config();

exports.createPages = async function ({ actions, graphql }) {
  try {
      const data = await graphql(`
      query MyQuery {
        Lollies {
          getLolly {
            id
            lollyBottom
            lollyMiddle
            lollyTop
            reciever
            message
            sender
          }
        }
      }
      `)
      // const lollies  = data.data.Lollies.getLollies
      data!== null && data.data.Lollies.getLolly.forEach((lolly) => {
        console.log(lolly);
        actions.createPage({
          path: `lolly/${lolly.id}`,
          component: require.resolve(`./src/components/LollyTemplate.tsx`),
          context: {
            // Data passed to context is available
            // in pageContext props of the template component
            id: lolly.id,
            sender: lolly.sender,
            reciever: lolly.reciever,
            message: lolly.message,
            lollyTop: lolly.lollyTop,
            lollyMiddle: lolly.lollyMiddle,
            lollyBottom: lolly.lollyBottom,
          },
        });
      });
  } catch (error) {
    console.log(error);
  }
};
