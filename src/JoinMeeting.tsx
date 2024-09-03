import { Flex, View, Icon, TextField, Button } from '@aws-amplify/ui-react';
import { useNavigate } from 'react-router-dom';
import { type Schema } from '../amplify/data/resource';
import { generateClient } from "aws-amplify/data";
import { useEffect, useState} from "react";
import { Buffer } from 'buffer';

export default function JoinMeeting() {

    // @ts-ignore
    window.Buffer = Buffer;

    // 画面遷移設定
    const navigate = useNavigate();
    const handleDeviceSetting  = (meeting : string) => 
        navigate('/deviceSetting', {state: {
            meeting: meeting
        }
    });

    // Schemaクライアントを生成
    const client = generateClient<Schema>();

    // ミーティング情報を保持
    const [meetings, setMeetings] = useState<Schema['MeetingManagement']['type'][]>([]);
    const [inputMeetingId, setInputMeetingId] = useState<string>('');
    const [inputMeetingPassword, setInputMeetingPassword] = useState<string>('');

    // ミーティング一覧を取得
    const fetchMeetings = async () => {
        const {data: items, errors } = await client.models.MeetingManagement.list();
        setMeetings(items);
        console.log('fetchMeetingError :' + errors);
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
            if (inputMeetingId === meeting.id && inputMeetingPassword === meeting.meetingPassword) {
                if (meeting.chimeMeetingStatus === 'unused' || meeting.chimeMeetingStatus === 'using') {
                    // Lambda関数を呼び出す
                    invokeRegisterMeeting(meeting);
                    return;
                }
                else if(meeting.chimeMeetingStatus === 'end') {
                    alert('ミーティングが終了しています。');
                    return;
                }
            }
        }

        // ミーティング番号とパスワードが一致しない場合
        alert('ミーティング番号またはパスワードが違います。もう一度入力してください。');
    }

    // Chimeミーティング登録用のLambda関数を呼び出す
    async function invokeRegisterMeeting(meeting: any) {

        const apiResponse = await client.queries.registerMeeting({
            id: meeting.id,
            chimeMeetingInfo: meeting.chimeMeetingInfo,
            chimeMeetingStatus: meeting.chimeMeetingStatus,
        });

        console.log('id : ' + meeting.id);
        console.log('chimeMeetingInfo : ' + meeting.chimeMeetingInfo);
        console.log('chimeMeetingStatus : ' + meeting.chimeMeetingStatus);

        const stringResponse = JSON.parse(JSON.stringify(apiResponse.data));
        
        console.log('stringResponse : ' + stringResponse);
        console.log(JSON.parse(stringResponse));

        // ミーティング情報を更新
        if( stringResponse !== null && stringResponse !== undefined && meeting.chimeMeetingStatus === 'unused') {

            const meetingInfo = {
                id: meeting.id,
                chimeMeetingInfo: stringResponse,
                chimeMeetingStatus: 'using',
            }


            // ミーティング情報を更新
            const { data: updatedMeeting , errors } = await client.models.MeetingManagement.update(meetingInfo);

            console.log('updateMeeting : ' + updatedMeeting);
            console.log('MeetingManagementUpdateError : ' + errors);
        }

        handleDeviceSetting(stringResponse);
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
