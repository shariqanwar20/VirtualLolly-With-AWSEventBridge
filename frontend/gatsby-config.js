// var baseUrl =
//   process.env.NODE_ENV === "development"
//     ? "http://localhost:8000"
//     : "https://d12rrdaf0p9eaa.cloudfront.net";
//serverstack-virtuallollywebsitebucket4eac0052-7kvwjni44zbn.s3.us-east-2.amazonaws.com

module.exports = {
  plugins: [
    "gatsby-plugin-typescript",
    {
      resolve: "gatsby-source-graphql",
      options: {
        // Arbitrary name for the remote schema Query type
        typeName: "LOLLIES",
        // Field under which the remote schema will be accessible. You'll use this in your Gatsby query
        fieldName: "Lollies",
        // Url to query from
        url: `https://2x66f3k7s5gfvgm56b4ok77eb4.appsync-api.us-east-2.amazonaws.com/graphql`,
        headers: {
          // Learn about environment variables: https://gatsby.dev/env-vars
          "x-api-key": "da2-hivqnzdcozddlpok337h72k3g4",
        },
      },
    },
  ],
};
