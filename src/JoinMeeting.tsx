import { Flex, View, Icon, TextField, Text, Button } from '@aws-amplify/ui-react';
import { json, useNavigate } from 'react-router-dom';
//import { Chime } from 'aws-sdk';
import { type Schema } from '../amplify/data/resource';
import { generateClient } from "aws-amplify/data";
import { useEffect, useState} from "react";
import { InvokeCommand, LambdaClient } from "@aws-sdk/client-lambda";
import { fetchAuthSession } from 'aws-amplify/auth';
import { Buffer } from 'buffer';

import outputs from '../amplify_outputs.json';

export default function JoinMeeting() {

    // @ts-ignore
    window.Buffer = Buffer;

    // 画面遷移設定
    const navigate = useNavigate();
    const handleDeviceSetting  = (chimeMeetingInfo, attendee) => navigate('/deviceSetting', {state: {chimeMeetingInfo: chimeMeetingInfo, attendee: attendee}});

    // Schemaクライアントを生成
    const client = generateClient<Schema>();

    // ミーティング情報を保持
    const [meetings, setMeetings] = useState<Schema['MeetingManagement']['type'][]>([]);
    const [inputMeetingId, setInputMeetingId] = useState<string>('');
    const [inputMeetingPassword, setInputMeetingPassword] = useState<string>('');

    // Chime設定
    //let chime;

    // ミーティング一覧を取得
    const fetchMeetings = async () => {
        const {data: items, errors } = await client.models.MeetingManagement.list();
        setMeetings(items);
    }

    useEffect(() => {
        fetchMeetings();
    }, []);

    // meetingIdとmeetingPasswordをチェック
    function checkMeetigInfomation() {

        // ミーティング情報を取得
        fetchMeetings();

        // ミーティング番号とパスワードが一致するミーティングを探す
        for (const meeting of meetings) {
            if (inputMeetingId === meeting.meetingId && inputMeetingPassword === meeting.meetingPassword) {
                if (meeting.chimeMeetingStatus === 'unused' || meeting.chimeMeetingStatus === 'using') {
                    // Lambda関数を呼び出す
                    invokeRegisterMeeting(meeting);
                    return;
                }
                else if(meeting.chimeMeetingStatus === 'end') {
                    alert('ミーティングが終了しています。');
                    return;
                }
                console.log(meeting.meetingId);
                console.log(meeting.meetingPassword);
                console.log(meeting.chimeMeetingStatus);
                console.log(inputMeetingId);
                console.log(inputMeetingPassword);
                console.log(meeting.meetingId === inputMeetingId);
                console.log(meeting.meetingPassword === inputMeetingPassword);
                console.log(meeting.chimeMeetingStatus === 'unused');
            }
        }

        // ミーティング番号とパスワードが一致しない場合
        alert('ミーティング番号またはパスワードが違います。もう一度入力してください。');
    }

    // Chimeミーティング登録用のLambda関数を呼び出す
    async function invokeRegisterMeeting(meeting: any) {
        var { credentials } = await fetchAuthSession();

        var awsRegion = outputs.auth.aws_region;
        //var functionName = outputs.custom.registerMeetingFunctionName;

        // Lambda関数を呼び出す
        var lambda = new LambdaClient({ credentials: credentials, region: awsRegion });

        // var command = new InvokeCommand({
        //     FunctionName: functionName,
        //     Payload: Buffer.from(JSON.stringify({
        //         id: meeting.id,
        //         meetingId: meeting.meetingId,
        //         meetingChimeInfo: meeting.chimeMeetingInfo,
        //         meetingStatus: meeting.chimeMeetingStatus,
        //     })),
        // });

        var meetingInfo = JSON.stringify({
            id : meeting.id,
            meetingId : meeting.meetingId,
            meetingChimeInfo : meeting.chimeMeetingInfo,
            meetingStatus : meeting.chimeMeetingStatus,
        });


        var apiResponse = await client.queries.registerMeeting({
            id: meeting.id,
            meetingId: meeting.meetingId,
            chimeMeetingInfo: meeting.chimeMeetingInfo,
            chimeMeetingStatus: 'using',
        });
        console.log(apiResponse);

        // var apiResponse = await lambda.send(command);

        // // Lambda関数の戻り値を取得
        // if (apiResponse.Payload) {
        //     var payload = JSON.parse(new TextDecoder().decode(apiResponse.Payload));
        //     console.log(payload.meeting);
        //     //handleDeviceSetting(payload.meeting, payload.attendee);
        // }
        // else {
        //     alert('通信が失敗しました。再度時間をおいてお試しください。');
        // }

    }

    // chimeSDKを使ってミーティングを作成（最初の人がミーティング参加する際のみ起動。）
    // async function createMeeting(id ,meetingId: string) {

    //     chime = new Chime({
    //         region: 'us-east-1',
    //         endpoint: 'service.chime.aws.amazon.com',
    //     });

    //     // ミーティングを作成
    //     var meeting = await chime.createMeeting({
    //         ClientRequestToken: Date.now().toString(),
    //         MediaRegion: 'ap-northeast-1',
    //     }).promise();

    //     // idをキーにして、ミーティングIDを更新
    //     await client.models.MeetingManagement.update({
    //         id: id,
    //         meetingId: meetingId,
    //         chimeMeetingInfo: meeting,
    //         chimeMeetingStatus: 'using',
    //     });

    //     joinMeeting(meeting);
    // }

    // // ミーティングに参加
    // async function joinMeeting(chimeMeetingInfo) {
    //     // 参加者を作成
    //     const attendee = await chime.createAttendee({
    //         MeetingId: chimeMeetingInfo.Meeting.MeetingId,
    //         ExternalUserId: Date.now().toString(),
    //     }).promise();

    //     // デバイス設定画面に遷移
    //     handleDeviceSetting(chimeMeetingInfo, attendee);
    // }



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
        <TextField
            width="329px"
            label="ミーティングパスワードを入力してください。"
            position="absolute"
            top="calc(50% - 20px - -20px)"
            left="25.11%"
            right="25.11%"
            placeholder=""
            isDisabled={false}
            labelHidden={false}
            onChange={(event) => {setInputMeetingPassword(event.target.value)}}
        />
        <TextField
            width="329px"
            label="ミーティング番号を入力してください。"
            position="absolute"
            top="calc(50% - 20px - 71px)"
            left="25.11%"
            right="25.11%"
            placeholder=""
            isDisabled={false}
            labelHidden={false}
            onChange={(event) => {setInputMeetingId(event.target.value)}}
        />
        <Button onClick={checkMeetigInfomation}>ミーティングに参加</Button>
    </Flex>
    )
}
