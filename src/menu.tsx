import { useState } from 'react';
import { Flex, View, Text, Button, Icon } from '@aws-amplify/ui-react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';

import { useNavigate } from 'react-router-dom';

export default function Menu( { signOut }) {

    const nagigate = useNavigate();
    const handleCreateMeeting = () => nagigate('/createMeeting');

    const [mytext, setText] = useState('吾輩は猫である。名前はまだない。');

    // 翻訳APIを呼び出す
    async function invokeSendTranslate() {
        // スキーマを定義
        const client = generateClient<Schema>();

        const { data } = await client.queries.translate({
            text: mytext,
            sourceLanguage: 'ja',
            targetLanguage: 'en'
        });

        setText(data || '翻訳できませんでした');
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
                {mytext}
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
                isDisabled={false}
                variation="primary"
                onClick={handleCreateMeeting}
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