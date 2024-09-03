import { Schema } from '../../data/resource';
import { ChimeSDKMeetingsClient, CreateMeetingCommand, CreateMeetingCommandInput,CreateAttendeeCommand, CreateAttendeeCommandInput, CreateAttendeeCommandOutput } from '@aws-sdk/client-chime-sdk-meetings';

const chimeClient = new ChimeSDKMeetingsClient({ 
    region: 'us-east-1',
});

export const handler: Schema['registerMeeting']['functionHandler'] = async (event) => {

    // クライアントからのリクエストを受け取る
    const id: string =  event.arguments.id;
    const chimeMeetingInfo: string | null = event.arguments.chimeMeetingInfo;
    const chimeMeetingStatus: string = event.arguments.chimeMeetingStatus;

    // ミーティング情報を保持
    var meeting: any;
    var attendee: CreateAttendeeCommandOutput | undefined;

    // ミーティングが未使用の場合
    if(chimeMeetingStatus === 'unused') {

        // ミーティング作成用の入力情報を設定
        var createMeetingCommandInput : CreateMeetingCommandInput = {
            ClientRequestToken: '',
            MediaRegion: '',
            ExternalMeetingId: '',
        };

        createMeetingCommandInput.ClientRequestToken = Date.now().toString();
        createMeetingCommandInput.MediaRegion = 'ap-northeast-1';
        createMeetingCommandInput.ExternalMeetingId = id;

        // ミーティングを作成
        const meetingInfoResponse = await chimeClient.send(
            new CreateMeetingCommand(
                createMeetingCommandInput
            )
        );

        meeting = meetingInfoResponse.Meeting;

        try {
            // 参加者を作成
            attendee = await createAttendee(meeting?.MeetingId);
        } catch (error) {
            console.log(error);
            return { meeting: error, attendee: error };
        }

        return { meeting: meetingInfoResponse, attendee: attendee };
    }
    // ミーティングが使用中の場合
    else if(chimeMeetingStatus === 'using') {
        // ミーティング情報をJSON形式に変換
        const chimeMeetingInfoJson = JSON.parse(chimeMeetingInfo);

        try {
            // 参加者を作成
            attendee = await createAttendee(chimeMeetingInfoJson.meeting.Meeting.MeetingId);
        } catch (error) {
            console.log(error);
            return { meeting: error, attendee: error };
        }

        return { meeting: chimeMeetingInfoJson.meeting, attendee: attendee };
    }

    // ミーティングが終了している場合
    return { message: undefined, attendee: undefined };
}

// 参加者を作成
async function createAttendee(meetingId : string | undefined) {

    var createAttendeeCommandInput : CreateAttendeeCommandInput = {
        MeetingId: '',
        ExternalUserId: '',
    };

    // attendee取得のための入力情報を設定
    createAttendeeCommandInput.MeetingId = meetingId;
    createAttendeeCommandInput.ExternalUserId = Date.now().toString();

    const attendeeInfoResponse : CreateAttendeeCommandOutput = await chimeClient.send(
        new CreateAttendeeCommand(
            createAttendeeCommandInput
    ));

    return attendeeInfoResponse;
}