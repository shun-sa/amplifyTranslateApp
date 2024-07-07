import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { sendTranslate } from './functions/send-translate/resource';

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
const backend = defineBackend({
  auth,
  data,
  sendTranslate,
});

const authenticatedUserIamRole = backend.auth.resources.authenticatedUserIamRole;
backend.sendTranslate.resources.lambda.grantInvoke(authenticatedUserIamRole);

backend.addOutput({
  custom: {
    sendTranslateFunctionName: backend.sendTranslate.resources.lambda.functionName,
  }
})


