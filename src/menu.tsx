import { useState } from 'react';
import { Flex, View, Text, Button, Icon } from '@aws-amplify/ui-react';
import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';
import { fetchAuthSession } from 'aws-amplify/auth';

import output from '../amplify_outputs.json';

export default function Menu( { signOut }) {

    const [text, setText] = useState('翻訳する');
    const initialFormState = { Text: '' };
    
    const [formState, setFormState] =  useState(initialFormState);

    async function invokeSendTranslate() {
        // アクセスキー、シークレットアクセス、セッショントークンを取得
        const { credentials } = await fetchAuthSession();

        const setInput = (key, value) => {
            setFormState({ ...formState, [key]: value });
        }

        setInput('text', text);
        //setText('翻訳中...');

        // リージョンと関数名を取得
        const awsResion = output.auth.aws_region;
        const functionName = output.custom.sendTranslateFunctionName;

        //Lamda関数を呼び出す
        const lambda = new LambdaClient({ credentials: credentials, region: awsResion });
        const command =new InvokeCommand({ 
            FunctionName: functionName, 
            Payload: Buffer.from(JSON.stringify('text : テスト'))
         });
        const apiResponse = await lambda.send(command);

        if(apiResponse.Payload){
            const payload = JSON.parse(new TextDecoder().decode(apiResponse.Payload));
            setText(payload.message + 'success');
            console.log(payload.message);
        }
        else{
            setText('エラーが発生しました');
            console.log('エラーが生しました');
        }
    }

    return (
        <Flex
        width="661px"
        height="622px"
        overflow="hidden"
        position="relative"
        backgroundColor="rgba(255,255,255,1)"
        >
            <View
            width="397px"
            height="509px"
            display="block"
            position="absolute"
            top="calc(50% - 254.5px - 28.5px)"
            left="calc(50% - 198.5px - 0px)"
            border="1px SOLID rgba(0,0,0,1)"
            backgroundColor="rgba(217,217,217,0)"
            />
            <Flex
            gap="115px"
            direction="row"
            width="329px"
            justifyContent="flex-start"
            alignItems="flex-start"
            position="absolute"
            top="calc(50% - 20px - 248px)"
            left="calc(50% - 164.5px - 0px)"
            >
                <Text
                fontFamily="Inter"
                fontSize="16px"
                fontWeight="500"
                color="rgba(0,0,0,1)"
                lineHeight="24px"
                textAlign="left"
                display="block"
                width="132px"
                shrink="0"
                alignSelf="stretch"
                position="relative"
                whiteSpace="pre-wrap"
                >
                AI翻訳アプリ
                </Text>
                <Button
                shrink="0"
                isDisabled={false}
                variation="primary"
                onClick={signOut}
                >
                Sign out
                </Button>
            </Flex>
            <Flex
            gap="0"
            direction="row"
            justifyContent="flex-start"
            alignItems="flex-start"
            position="absolute"
            top="322px"
            left="calc(50% - 122.5px - 5px)"
            > 
                <Button
                width="245px"
                height="37px"
                shrink="0"
                isDisabled={false}
                variation="primary"
                onClick={invokeSendTranslate}
                >
                {text}
                </Button>
            </Flex>
            
            <Flex
            gap="0"
            direction="row"
            justifyContent="flex-start"
            alignItems="flex-start"
            position="absolute"
            top="221px"
            left="calc(50% - 122.5px - 5px)"
            >
                <Button
                width="245px"
                height="37px"
                shrink="0"
                //size="default"
                isDisabled={false}
                variation="primary"
                >
                ミーティング登録
                </Button>
            </Flex>
            <Icon
            width="396px"
            height="1px"
            viewBox={{"minX":0,"minY":0,"width":396.0000002344659,"height":0.9999999316742105}}
            paths={[{"d":"M0 0 L396.001 0 L396.001 -0.5 L0 -0.5 L0 0 Z","stroke":"rgba(0,0,0,1)","fillRule":"nonzero","strokeWidth":0}]}
            display="block"
            position="absolute"
            top="98px"
            left="133px"
            transformOrigin="top left"
            transform="rotate(0.14deg)"
            />
        </Flex>
    )
}