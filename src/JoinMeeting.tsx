import { Flex, TextField, Button } from '@aws-amplify/ui-react';
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
        direction="column" 
        alignItems="center" 
        gap="3rem"
    >
        <TextField
            width="20rem"
            label="ミーティング番号を入力してください。"
            isDisabled={false}
            labelHidden={false}
            onChange={(event) => {setInputMeetingId(event.target.value)}}
        />
        <TextField
            width="20rem"
            label="ミーティングパスワードを入力してください。"
            
            isDisabled={false}
            labelHidden={false}
            onChange={(event) => {setInputMeetingPassword(event.target.value)}}
        />
        
        <Button 
            width="15rem"
            height="3rem"
            shrink="0"
            isDisabled={false}
            variation="primary"
            onClick={checkMeetigInfomation}
        >
            ミーティングに参加
        </Button>
    </Flex>
    )
}
