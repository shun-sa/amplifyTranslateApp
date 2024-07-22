import { Handler } from 'aws-lambda';
import { Chime } from 'aws-sdk';

export const handler: Handler = async (event: any) => {

    // plese let chime-sdk use registe meeting function.
    // Chime設定
    const chime = new Chime({
        region: 'us-east-1',
        endpoint: 'service.chime.aws.amazon.com',
    });

    // ミーティングを作成
    const meeting = await chime.createMeeting({
        ClientRequestToken: Date.now().toString(),
        MediaRegion: 'ap-northeast-1',
    }).promise();

    // ミーティングIDを取得
    const innerMeetingId = meeting.Meeting?.MeetingId;

    // 参加者を作成
    const attendee = await chime.createAttendee({
        MeetingId: innerMeetingId!,
        ExternalUserId: Date.now().toString(),
    }).promise();

    // 参加者IDを取得
    const attendeeId = attendee.Attendee?.AttendeeId;

    return {message: innerMeetingId + 'Lambda関数からの返信'}
}