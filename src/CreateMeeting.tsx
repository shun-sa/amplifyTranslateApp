import { Flex, View, Text, Button, Icon, TextField } from '@aws-amplify/ui-react';
import { type Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { useEffect, useState} from "react";
import { useNavigate } from 'react-router-dom';

function CreateMeeting() {

    const client = generateClient<Schema>();

    const [meetings, setMeetings] = useState<Schema['MeetingManagement']['type'][]>([]);
    const [createMeetingIdString, setCreateMeetingIdString] = useState<string>('');
    const [inputMeetingPassword, setMeetingPassword] = useState<string>('default');

    // 画面遷移設定
    const navigate = useNavigate();
    const handleMenu = () => navigate('/');

    // ミーティング一覧を取得
    const fetchMeetings = async () => {
        const {data: items, errors } = await client.models.MeetingManagement.list();
        setMeetings(items);
        console.log(errors);
    }

    useEffect(() => {
        fetchMeetings();
    }, []);

    // ミーティングを作成
    const createMeeting = async () => {

        // ミーティング情報を取得
        await fetchMeetings();

        // ミーティングIDを生成
        if(meetings.length !== 0) {
            // meeting.idの最大値を求める
            const maxMeetingId = Math.max(...meetings.map((meeting) => Number(meeting.id)));

            // 最大値に1を加えて新しいmeeting.idを生成
            var createMeetingIdNumber = maxMeetingId+ 1;

            // 6桁の文字列に変換
            setCreateMeetingIdString(createMeetingIdNumber.toString().padStart(6, '0'));
        }
        else {
            setCreateMeetingIdString('000001');
        }
        console.log(meetings);
        console.log(createMeetingIdString);
        console.log(inputMeetingPassword);

        if (createMeetingIdString === '') {
            alert('登録に失敗しました。もう一度登録を行ってください。');
            return;
        }
        else {
            // ミーティングを登録
            await client.models.MeetingManagement.create({
                id: createMeetingIdString,
                meetingPassword: inputMeetingPassword,
            });

            // メニュー画面に遷移
            handleMenu();
        }

        // ミーティング削除（デバック用）
        // deleteMeeting('000001');
    }

    // ミーティングを削除
    // const deleteMeeting = async (meetingID: string) => {
    //     await client.models.MeetingManagement.delete({id: meetingID});
    //     fetchMeetings();
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
        <Button
            width="245px"
            height="37px"
            shrink="0"
            isDisabled={false}
            variation="primary"
            onClick={createMeeting}
        >
            ミーティング登録
        </Button>
        <TextField
            width="329px"
            label="Meeting Password"
            position="absolute"
            top="calc(50% - 20px - 49px)"
            left="24.36%"
            right="25.87%"
            placeholder=""
            isDisabled={false}
            labelHidden={false}
            onChange={(event) => {setMeetingPassword(event.target.value)}}
        />
        <Text
            fontFamily="Inter"
            fontSize="16px"
            fontWeight="400"
            color="rgba(0,0,0,1)"
            lineHeight="24px"
            textAlign="center"
            display="block"
            position="absolute"
            top="calc(50% - 12px - 90px)"
            left="calc(50% - 167.5px - 5px)"
            whiteSpace="pre-wrap"
        >
            ミーティングパスワードを入力してください。
        </Text>
        <ul>
            {meetings.map((meeting) => (
                <li key={meeting.id}>{meeting.id}</li>
            ))}
        </ul>
        <ul>
            {meetings.map((meeting) => (
                <li key={meeting.meetingPassword}>{meeting.meetingPassword}</li>
            ))}
        </ul>
    </Flex>
    )
}

export default CreateMeeting;