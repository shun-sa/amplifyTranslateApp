import { Flex, Button, TextField } from '@aws-amplify/ui-react';
import { type Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { useEffect, useState} from "react";
import { useNavigate } from 'react-router-dom';

function CreateMeeting() {

    const client = generateClient<Schema>();

    const [meetings, setMeetings] = useState<Schema['MeetingManagement']['type'][]>([]);
    const [createMeetingIdString, setCreateMeetingIdString] = useState<string>('');
    const [inputMeetingPassword, setMeetingPassword] = useState<string>('');

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

        if(inputMeetingPassword === '') {
            alert('ミーティングパスワードを入力してください。');
            return;
        }

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
        //deleteMeeting('000004');
    }

    // ミーティングを削除
    // const deleteMeeting = async (meetingID: string) => {
    //     await client.models.MeetingManagement.delete({id: meetingID});
    //     fetchMeetings();
    // }

    return (

    <Flex
        direction="column"
        alignItems="center"
        gap="2rem"
    >

        <TextField
            width="20rem"
            label="ミーティングパスワードを入力してください。"
            isDisabled={false}
            labelHidden={false}
            onChange={(event) => { setMeetingPassword(event.target.value) }}
        />
        
        <Button
            width="15rem"
            height="3rem"
            shrink="0"
            isDisabled={false}
            variation="primary"
            onClick={createMeeting}
        >
            ミーティング登録
        </Button>
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