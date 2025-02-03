import { Flex, SelectField, Button, TextField } from '@aws-amplify/ui-react';
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

    // カメラの一覧を保持する
    const [cameras, setCameras] = useState<string[]>([]);

    // ミーティング情報を取得
    const meeting = location.state.meeting;

    // 選択されたマイクとスピーカーを保持する
    const [selectedMicrophone, setSelectedMicrophone] = useState<string>('');
    const [selectedSpeaker, setSelectedSpeaker] = useState<string>('');

    // 選択されたカメラを保持する
    const [selectedCamera, setSelectedCamera] = useState<string>('');

     // 参加名を保持する
     const [participantName, setParticipantName] = useState<string>('');

     // 画面遷移設定
    const navigate = useNavigate();
    const handleMeetingDisplay = (selectedMicrophoneId , selectedSpeakerId, selectedCameraId) => 
        navigate('/meeting', {state: {
            meeting: meeting, 
            selectedMicrophoneId: selectedMicrophoneId, 
            selectedSpeakerId: selectedSpeakerId,
            selectedCameraId: selectedCameraId,
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

        // カメラが選択されていない場合はアラートを表示する
        if (!selectedCamera) {
            alert('カメラを選択してください。');
            return;
        }

        // マイクとスピーカーのデバイスIDをデバイス名から検索する
        var selectedMicrophoneId = devices.find(device => device.label === selectedMicrophone)?.deviceId;
        var selectedSpeakerId = devices.find(device => device.label === selectedSpeaker)?.deviceId;

        // カメラのデバイスIDをデバイス名から検索する
        var selectedCameraId = devices.find(device => device.label === selectedCamera)?.deviceId;

        // マイクとスピーカーのデバイスIDをコンソールに表示する（デバッグ用）
        console.log(' selectedMicrophone : ' + selectedMicrophoneId);
        console.log(' selectedSpeaker : ' + selectedSpeakerId);

        // カメラのデバイスIDをコンソールに表示する（デバッグ用）
        console.log(' selectedCamera : ' + selectedCameraId);

        // ミーティング情報をコンソールに表示する（デバッグ用）
        console.log('DeviceSetting');
        console.log(meeting);

        console.log(JSON.parse(meeting));

        // マイクとスピーカーのデバイスIDを渡してミーティング画面に遷移する
        handleMeetingDisplay(selectedMicrophoneId, selectedSpeakerId, selectedCameraId);
    } 
    
    // マイクとスピーカーの一覧を取得する
    useEffect(() => {
        // マイクの許可設定を取得
        let option = {video: true, audio: {echoCancellation: true, noiseSuppression: false}};
        navigator.mediaDevices.getUserMedia(option).then((stream) => {
            return stream;
        });
            
        // マイクとスピーカー、カメラの一覧を取得
        const fetchAudioDevices = async () => {
            var devices = await navigator.mediaDevices.enumerateDevices();
            setDevices(devices);

            var microphones = devices.filter(device => device.kind === 'audioinput').map(device => device.label);
            var speakers = devices.filter(device => device.kind === 'audiooutput').map(device => device.label);
            var cameras = devices.filter(device => device.kind === 'videoinput').map(device => device.label);

            setMicrophones(microphones);
            setSpeakers(speakers);
            setCameras(cameras);
        }
        fetchAudioDevices();
    }, []);

    return (
        <Flex
            direction="column" 
            alignItems="center" 
            gap="4rem"
        >

            <SelectField
                width="15rem"
                label="マイク"
                placeholder="マイクを選択してください。"
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
                width="15rem"
                label="スピーカー"
                placeholder="スピーカーを選択してください。"
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

            <SelectField
                width="15rem"
                label="カメラ"
                placeholder="カメラを選択してください。"
                size="small"
                isDisabled={false}
                labelHidden={false}
                value={selectedCamera} onChange={(e: any) => setSelectedCamera(e.target.value)}
            >
                {/* カメラの一覧を表示する */}
                {cameras.map((camera) => (
                    <option key={camera} value={camera}>
                        {camera}
                    </option>
                ))}
            </SelectField>

            <TextField
                width="15rem"
                label="参加名"
                placeholder="参加名を入力してください。"
                size="small"
                isDisabled={false}
                labelHidden={false}
                value={participantName} onChange={(e: any) => setParticipantName(e.target.value)}
            />

            <Button
            width="15rem"
            height="3rem"
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