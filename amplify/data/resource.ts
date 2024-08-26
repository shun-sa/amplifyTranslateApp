import { type ClientSchema, a, defineData, defineFunction } from '@aws-amplify/backend';
import { registerMeeting } from '../functions/register-meeting/resource';
import { ChimeSDKMeetings } from '@aws-sdk/client-chime-sdk-meetings';

// スキーマを定義
const schema = a.schema({
  // MeetingManagementモデルを定義
  MeetingManagement: a
    .model({
      id: a.string(),
      chimeMeetingInfo: a.json(),
      chimeMeetingStatus: a.string().default('unused'),
      meetingPassword: a.string(),
    })
    .authorization((allow) => [allow.publicApiKey()]),
  // ChimeMeeting登録Lambda関数を定義
  registerMeeting: a
    .query()
    .arguments({
      chimeMeetingInfo: a.json().required(),
      chimeMeetingStatus: a.string().required(),
    })
    .returns(a.json())
    .authorization((allow) => [allow.publicApiKey()])
    .handler(a.handler.function(registerMeeting)),
  // translateAPIを定義
  translate: a
    .query()
    .arguments({
      sourceLanguage: a.string().required(),
      targetLanguage: a.string().required(),
      text: a.string().required()
    })
    .returns(a.string())
    .authorization(allow => [allow.publicApiKey()])
    .handler(a.handler.custom({
      dataSource: 'TranslateDataSource',
      entry: './translate.js'
    })),
});

// スキーマをエクスポート
export type Schema = ClientSchema<typeof schema>;

// データを定義
export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'apiKey',
    apiKeyAuthorizationMode: {
      expiresInDays: 30
    },
  },
});