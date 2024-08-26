import { Schema } from '../../data/resource';
import { ChimeSDKMeetingsClient, CreateMeetingCommand, CreateAttendeeCommand, CreateAttendeeCommandInput, CreateAttendeeCommandOutput } from '@aws-sdk/client-chime-sdk-meetings';

const chimeClient = new ChimeSDKMeetingsClient({ 
    region: 'us-east-1',
});

export const handler: Schema['registerMeeting']['functionHandler'] = async (event) => {

    const chimeMeetingInfo: any | undefined = event.arguments.chimeMeetingInfo;
    const chimeMeetingStatus = event.arguments.chimeMeetingStatus;
    var meeting: any;
    var attendee: CreateAttendeeCommandOutput | undefined;


    if(chimeMeetingStatus === 'unused') {

        // ミーティングを作成
        const meetingInfoResponse = await chimeClient.send(
            new CreateMeetingCommand({
                ClientRequestToken: Date.now().toString(),
                MediaRegion: 'ap-northeast-1',
                ExternalMeetingId: 'test',
        }));

        meeting = meetingInfoResponse.Meeting;

        try {
            // 参加者を作成
            attendee = await createAttendee(meeting.MeetingId);
        } catch (error) {
            console.log(error);
            return { meeting: error, attendee: error };
        }

        return { meeting: meeting, attendee: attendee };
    }
    else if(chimeMeetingStatus === 'using') {

        try {
            // 参加者を作成
            attendee = await createAttendee(chimeMeetingInfo.MeetingId);
        } catch (error) {
            console.log(error);
            return { meeting: error, attendee: error };
        }

        return { meeting: chimeMeetingInfo, attendee: attendee };
    }

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