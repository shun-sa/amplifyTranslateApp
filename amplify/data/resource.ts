import { type ClientSchema, a, defineData, defineFunction } from '@aws-amplify/backend';

// 翻訳機能のLambda関数を定義
const translateHandler = defineFunction({
  entry: './translate-handler/handler.ts',
})

// スキーマを定義
const schema = a.schema({
  MeetingManagement: a
    .model({
      id: a.string(),
      innerMeetingID: a.string().default('000000'),
      chimeMeetingStatus: a.string().default('unused'),
      meetingPassword: a.string(),
    })
    .authorization((allow) => [allow.publicApiKey()]),
  //translateAPIを定義
  translate: a.query()
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