import { Handler } from 'aws-lambda';
import { Translate } from 'aws-sdk';

export const handler: Handler = async (event, context) => {

  //return { message : 'Lambda関数からの返信' };

  // const translatedText = await new Translate().translateText({
  //   //Text: event['text'],
  //   SourceLanguageCode: 'auto',
  //   TargetLanguageCode: 'en'
  // }, (err, data) => {
  //   if (err) {
  //     console.log(err);
  //     return {message : 'エラー'};
  //   } else {
  //     return {message : 'data'};
  //     console.log(data);
  //   }
  // }).promise();

  return {message: event.Text + 'Lambda関数からの返信'}
}