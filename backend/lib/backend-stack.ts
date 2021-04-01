import * as cdk from '@aws-cdk/core';
import * as appsync from '@aws-cdk/aws-appsync';
import * as lambda from '@aws-cdk/aws-lambda';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as events from '@aws-cdk/aws-events';
import * as targets from '@aws-cdk/aws-events-targets';
import * as s3 from '@aws-cdk/aws-s3';
import * as s3Deployment from '@aws-cdk/aws-s3-deployment';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as CodeBuild from '@aws-cdk/aws-codebuild';
import * as CodePipeline from '@aws-cdk/aws-codepipeline';
import * as CodePipelineAction from '@aws-cdk/aws-codepipeline-actions';
import { PolicyStatement } from '@aws-cdk/aws-iam';

export class BackendStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, "VirtualLollyBucket", {
      publicReadAccess: true,
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "404.html"
    })

    new s3Deployment.BucketDeployment(this, "VirtualLollyBucketDeployemnt", {
      sources: [s3Deployment.Source.asset("../frontend/public")],
      destinationBucket: bucket
    })

    new cloudfront.CloudFrontWebDistribution(this, "VirtualLollySiteDeploy", {
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: bucket
          },
          behaviors: [{
            isDefaultBehavior: true
          }]
        }
      ]
    })

    const s3Build = new CodeBuild.PipelineProject(this, 's3Build', {
      buildSpec: CodeBuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: {
            "runtime-versions": {
              "nodejs": 12
            },
            commands: [
              'cd frontend', 
              'npm install -g gatsby',
              "npm install -g yarn"
            ],
          },
          pre_build: {
            commands: [
              "yarn",
            ]
          },
          build: {
            commands: [
              'gatsby build',
            ],
          },
        },
        artifacts: {
          'base-directory': './frontend/public',   ///outputting our generated Gatsby Build files to the public directory
          "files": [
            '**/*'
          ]
        },
      }),
      environment: {
        buildImage: CodeBuild.LinuxBuildImage.STANDARD_3_0,   ///BuildImage version 3 because we are using nodejs environment 12
      },
    });

    const policy = new PolicyStatement();
    policy.addActions("s3:*")
    policy.addResources("*")
    s3Build.addToRolePolicy(policy)

    const sourceOutput = new CodePipeline.Artifact();

    const s3Output = new CodePipeline.Artifact();

    const pipeline = new CodePipeline.Pipeline(this, "VirtualLollyDeploymentPipeline", {
      crossAccountKeys: false,
      restartExecutionOnUpdate: true
    })

    pipeline.addStage({
      stageName: "Source",
      actions: [
        new CodePipelineAction.GitHubSourceAction({
          actionName: "Checkout",
          owner: "shariqanwar20",
          repo: "VirtualLolly-With-AWSEventBridge",
          oauthToken: cdk.SecretValue.plainText("0dde5ef459a6e527b809458ee9759910acec1dab"),
          output: sourceOutput,
          branch: "master"
        })
      ]
    })

    pipeline.addStage({
      stageName: "Build",
      actions: [
        new CodePipelineAction.CodeBuildAction({
          actionName: "s3Build",
          project: s3Build,
          input: sourceOutput,
          outputs: [s3Output]
        })
      ]
    })

    pipeline.addStage({
      stageName: "Deploy",
      actions: [
        new CodePipelineAction.S3DeployAction({
          actionName: "DeployToS3",
          input: s3Output,
          bucket: bucket
        })
      ]
    })

    const api = new appsync.GraphqlApi(this, "VirtualLollyGraphqlApi", {
      name: "VirtualLollyGraphqlApi",
      schema: appsync.Schema.fromAsset("graphql/schema.gql"),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,
          apiKeyConfig: {
            expires: cdk.Expiration.after(cdk.Duration.days(7))
          }
        }
      },
    })

    const httpDataSource = api.addHttpDataSource("HttpDataSource", `https://events.${this.region}.amazonaws.com/`, {
      name: "VirtualLollyHttpDataSource",
      description: "Appsync to Eventbridge to lambda",
      authorizationConfig: {
        signingRegion: this.region,
        signingServiceName: "events"
      }
    })
    events.EventBus.grantAllPutEvents(httpDataSource)

    const virtualLollyLambda = new lambda.Function(this, "VirtualLollyFunction", {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset("functions"),
      handler: "main.handler",
      timeout: cdk.Duration.seconds(10)
    })
    events.EventBus.grantAllPutEvents(virtualLollyLambda);

    const table = new dynamodb.Table(this, "VirtualLollyTable", {
      tableName: "VirtualLollyTable",
      partitionKey: {
        name: "id",
        type: dynamodb.AttributeType.STRING
      }
    })
    table.grantFullAccess(virtualLollyLambda)
    virtualLollyLambda.addEnvironment("TABLE_NAME", table.tableName)

    const dynamoDataSource = api.addDynamoDbDataSource("DyanmoDataSource", table)

    dynamoDataSource.createResolver({
      typeName: "Query",
      fieldName: "getLollyById",
      requestMappingTemplate: appsync.MappingTemplate.fromFile("vtl/getLollyById/request.vtl"),
      responseMappingTemplate: appsync.MappingTemplate.fromFile("vtl/getLollyById/response.vtl")
    })

    dynamoDataSource.createResolver({
      typeName: "Query",
      fieldName: "getLolly",
      requestMappingTemplate: appsync.MappingTemplate.fromFile("vtl/getLolly/request.vtl"),
      responseMappingTemplate: appsync.MappingTemplate.fromFile("vtl/getLolly/response.vtl")
    })

    httpDataSource.createResolver({
      typeName: "Mutation",
      fieldName: "createLolly",
      requestMappingTemplate: appsync.MappingTemplate.fromFile("vtl/createLolly/request.vtl"),
      responseMappingTemplate: appsync.MappingTemplate.fromFile("vtl/createLolly/response.vtl")
    })

    const rebuildPipelineRule = new events.Rule(this, "RebuildPipelineRule", {
      eventPattern: {
        source: ["rebuild-pipeline"]
      },
      targets: [new targets.CodePipeline(pipeline)]
    })

    const virtualLollyRule = new events.Rule(this, "VirtualLollyRule", {
      eventPattern: {
        source: ["appsync-add-event"]
      },
      targets: [new targets.LambdaFunction(virtualLollyLambda)]
    })
  }
}
