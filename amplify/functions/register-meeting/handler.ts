//import { Handler } from 'aws-lambda';
//import { Chime } from 'aws-sdk';
import { Schema } from '../../data/resource';
//import { useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import { ChimeSDKMeetingsClient, CreateMeetingCommand, ListAttendeesCommand } from '@aws-sdk/client-chime-sdk-meetings';

//const [meetings, setMeetings] = useState<Schema['MeetingManagement']['type'][]>([]);

// Chime設定
// const chime = new Chime({
//     region: 'us-east-1',
//     endpoint: 'service.chime.aws.amazon.com',
// });

const client = new ChimeSDKMeetingsClient({ region: 'us-east-1' });

let attendee: any;

export const handler: Schema['registerMeeting']['functionHandler'] = async (event) => {

    const id = event.arguments.id;
    const meetingId = event.arguments.meetingId;
    const chimeMeetingInfo = event.arguments.chimeMeetingInfo;
    const chimeMeetingStatus = event.arguments.chimeMeetingStatus;

    const meetingInfoResponse = await client.send(new CreateMeetingCommand({
        ClientRequestToken: Date.now().toString(),
        MediaRegion: 'ap-northeast-1',
        ExternalMeetingId: 'your-external-meeting-id',
    }));

    //var meetingInfoObject = JSON.parse(meetingInfo);

    return `Hello ${id}!`;

    // if(event.meetingStatus === 'unused') {

    //     // Schemaクライアントを生成
    //     const client = generateClient<Schema>();

    //     // ミーティングを作成
    //     const meeting = await chime.createMeeting({
    //         ClientRequestToken: Date.now().toString(),
    //         MediaRegion: 'ap-northeast-1',
    //     }).promise();


    //     // idをキーにして、ミーティングIDを更新
    //     await client.models.MeetingManagement.update({
    //         id: event.id,
    //         meetingId: event.meetingId,
    //         chimeMeetingInfo: meeting,
    //         chimeMeetingStatus: 'using',
    //     });

    //     attendee = createMeeting(meeting);

    //     // meetingとattendeeを返す
    //     return { meeting: meeting, attendee: attendee };
    // }
    // else if(event.meetingStatus === 'using') {
    //     attendee = createMeeting(event.chimeMeetingInfo);

    //     // meetingとattendeeを返す
    //     return { meeting: event.chimeMeetingInfo, attendee: attendee };
    // }
    // else {
    //     // エラーを返す
    //     return 'error';
    // }
}

// 参加者を作成
async function createMeeting(chimeMeetingInfo: any) {

    // const attendee = await chime.createAttendee({
    //     MeetingId: chimeMeetingInfo.Meeting.MeetingId,
    //     ExternalUserId: Date.now().toString(),
    // }).promise();

    const attendee = await client.send(new ListAttendeesCommand({
        MeetingId: chimeMeetingInfo.Meeting.MeetingId,
    }));

    return attendee;
}