import { Flex, View, Icon, SelectField, Button, TextField } from '@aws-amplify/ui-react';
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// 引数受け取りのためのインターフェースを定義
interface DeviceSettingProps {
    meeting: string; 
}

const DeviceSetting: React.FC<DeviceSettingProps> = () => {
    
    // マイクとスピーカーの一覧を保持する
    const [microphones, setMicrophones] = useState<string[]>([]);
    const [speakers, setSpeakers] = useState<string[]>([]);
    const location = useLocation();

    // ミーティング情報を取得
    const meeting = location.state.meeting;

    // 選択されたマイクとスピーカーを保持する
    const [selectedMicrophone, setSelectedMicrophone] = useState<string>('');
    const [selectedSpeaker, setSelectedSpeaker] = useState<string>('');

     // 参加名を保持する
     const [participantName, setParticipantName] = useState<string>('');

    const navigate = useNavigate();
    const handleMeetingDisplay = (selectedMicrophoneId , selectedSpeakerId) => 
        navigate('/meeting', {state: {
            meeting: meeting, 
            selectedMicrophoneId: selectedMicrophoneId, 
            selectedSpeakerId: selectedSpeakerId,
            participantName: participantName,
        }
    });

    // デバイスの一覧を保持する
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

    // ミーティング画面に遷移する
    function setMeetingDevice () {

        // マイクとスピーカーが選択されていない場合はアラートを表示する
        if (!selectedMicrophone || !selectedSpeaker) {
            alert('マイクとスピーカーを選択してください。');
            return;
        }

        // 参加名が入力されていない場合はアラートを表示する
        if (!participantName) {
            alert('参加名を入力してください。');
            return;
        }

        // マイクとスピーカーのデバイスIDをデバイス名から検索する
        var selectedMicrophoneId = devices.find(device => device.label === selectedMicrophone)?.deviceId;
        var selectedSpeakerId = devices.find(device => device.label === selectedSpeaker)?.deviceId;

        // マイクとスピーカーのデバイスIDをコンソールに表示する（デバッグ用）
        console.log(selectedMicrophoneId);
        console.log(selectedSpeakerId);

        // ミーティング情報をコンソールに表示する（デバッグ用）
        console.log('DeviceSetting');
        console.log(meeting);

        console.log(JSON.parse(meeting));

        // マイクとスピーカーのデバイスIDを渡してミーティング画面に遷移する
        handleMeetingDisplay(selectedMicrophoneId, selectedSpeakerId);
    } 
    
    // マイクとスピーカーの一覧を取得する
    useEffect(() => {
        // マイクの許可設定を取得
        let option = {video: false, audio: {echoCancellation: true, noiseSuppression: false}};
        navigator.mediaDevices.getUserMedia(option).then((stream) => {
            return stream;
        });
            
        // マイクとスピーカーの一覧を取得
        const fetchAudioDevices = async () => {
            var devices = await navigator.mediaDevices.enumerateDevices();
            setDevices(devices);
            var microphones = devices.filter(device => device.kind === 'audioinput').map(device => device.label);
            var speakers = devices.filter(device => device.kind === 'audiooutput').map(device => device.label);

            setMicrophones(microphones);
            setSpeakers(speakers);
        }
        fetchAudioDevices();
    }, []);

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
            <SelectField
                width="240px"
                label="マイク"
                placeholder="マイクを選択してください。"
                position="absolute"
                top="150px"
                left="211px"
                size="small"
                isDisabled={false}
                labelHidden={false}
                value={selectedMicrophone} onChange={(e: any) => setSelectedMicrophone(e.target.value)}
            >
                {/* マイクの一覧を表示する */}
                {microphones.map((microphone) => (
                    <option key={microphone} value={microphone}>
                        {microphone}
                    </option>
                ))}
            </SelectField>

            <SelectField
                width="240px"
                label="スピーカー"
                placeholder="スピーカーを選択してください。"
                position="absolute"
                top="259px"
                left="211px"
                size="small"
                isDisabled={false}
                labelHidden={false}
                value={selectedSpeaker} onChange={(e: any) => setSelectedSpeaker(e.target.value)}
            >
                {/* スピーカーの一覧を表示する */}
                {speakers.map((speaker) => (
                    <option key={speaker} value={speaker}>
                        {speaker}
                    </option>
                ))}
            </SelectField>

            <TextField
                width="240px"
                label="参加名"
                placeholder="参加名を入力してください。"
                position="absolute"
                top="368px"
                left="211px"
                size="small"
                isDisabled={false}
                labelHidden={false}
                value={participantName} onChange={(e: any) => setParticipantName(e.target.value)}
            />

            <Button
            width="245px"
            height="37px"
            shrink="0"
            isDisabled={false}
            variation="primary"
            onClick={setMeetingDevice}
            >
            ミーティングに参加
            </Button>
        </Flex>
    );
}

export default DeviceSetting;