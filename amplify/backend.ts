import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { registerMeeting } from './functions/register-meeting/resource';
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Stack } from "aws-cdk-lib";

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
const backend = defineBackend({
  auth,
  data,
  registerMeeting,
});

// dataStackを取得
const dataStack = Stack.of(backend.data);

// 翻訳機能のデータソースを追加
const translateDataSources = backend.data.addHttpDataSource(
  'TranslateDataSource',
  `https://translate.${dataStack.region}.amazonaws.com`, {
    authorizationConfig: {
      signingRegion: dataStack.region,
      signingServiceName: 'translate'
    },
  }
);

// 翻訳機能のデータソースにポリシーを追加
translateDataSources.grantPrincipal.addToPrincipalPolicy(
  new PolicyStatement({
    actions: ['translate:TranslateText'],
    resources: ['*'],
  })
);

// ミーティング登録Lambda関数を取得
const registerMeetingFunction = backend.registerMeeting.resources.lambda;

// 認証済みユーザーのIAMロールを取得
const authenticatedUserIamRole = backend.auth.resources.authenticatedUserIamRole;

//認証済みユーザーにLambda関数を実行する権限を付与
registerMeetingFunction.grantInvoke(authenticatedUserIamRole);

// lambda関数にchime:CreateMeetingの権限を付与
const statement = new PolicyStatement({
  actions: ['chime:CreateMeeting', 'chime:CreateAttendee'],
  resources: ['*'],
});

registerMeetingFunction.addToRolePolicy(statement); 

//認証済みユーザーに翻訳機能を使用する権限を付与
authenticatedUserIamRole.addToPrincipalPolicy(
  new PolicyStatement({
    actions: ['translate:TranslateText'],
    resources: ['*'],
  })
);



//翻訳機能を追加
backend.addOutput({
  custom: {
    Predictions: {
      convert:{
        // 翻訳機能のデフォルト設定
        translateText: {
          defaults: {
            sourceLanguage: 'ja',
            tragetLanguage: 'en',
          },
          proxy: false,
          region: Stack.of(backend.auth.resources.authenticatedUserIamRole).region,
        }
      }
    }
  }
})


