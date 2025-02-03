import React, { useEffect, useState, useRef } from 'react';
import { Flex, Button, TextField } from '@aws-amplify/ui-react';
import { SpeechRecognizer, AudioConfig, SpeechConfig} from 'microsoft-cognitiveservices-speech-sdk';
import { generateClient } from 'aws-amplify/data';
import { type Schema } from '../amplify/data/resource';
import { 
    AudioVideoFacade,
    ConsoleLogger, 
    DefaultDeviceController, 
    DefaultMeetingSession, 
    LogLevel, 
    MeetingSessionConfiguration, 
    MeetingSessionStatusCode,
    DataMessage,
    VideoTileState
} from 'amazon-chime-sdk-js'
import { useLocation, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// 引数受け取りのためのインターフェースを定義
interface MeetingDisplayProps { 
    meeting: string;
    selectedMicrophoneId: string;
    selectedSpeakerId: string;
    selectedCameraId: string;
    participantName: string;
}

const MeetingDisplay: React.FC<MeetingDisplayProps> = () => {

    // マイクのON/OFFを管理
    const [isMicrophoneOn, setMicrophoneOn] = useState(true);

    // 会話内容を保持
    const [speechText, setSpeechText] = useState<string>('');

    // meetingSessionをuseRefで保持
    const meetingSession = useRef<DefaultMeetingSession | null>(null);

    // スキーマを定義
    const client = generateClient<Schema>();

    // DeviceSetting.tsxからの引数を取得
    const location = useLocation();
    const meeting = JSON.parse(location.state.meeting).meeting;
    const attendee = JSON.parse(location.state.meeting).attendee;
    const selectedMicrophoneId = location.state.selectedMicrophoneId;
    const selectedSpeakerId = location.state.selectedSpeakerId;
    const selectedCameraId = location.state.selectedCameraId;
    const participantName = location.state.participantName;

    // 画面遷移設定
    const navigate = useNavigate();
    const handleJoinMeeting = () => navigate('/');

    // 初回レンダリング時にSpeechToTextとChimeミーティングに参加する
    useEffect(() => {
        invokeSendSpeechToText();
        joinChimeMeeting();
    }, []);

    // マイクからの音声入力をazure cognitive speech serviceに送信してテキストに変換する
    async function invokeSendSpeechToText() {

        // Azure Cognitive Speech Serviceの資格情報を設定
        var subscriptionKey = "ea98e591f4f94719b753e27624bc6f16";
        var subscriptionRegion = "japaneast";

        // Azure Cognitive Speech ServiceのSpeechConfigを生成
        var speechConfig = SpeechConfig.fromSubscription(subscriptionKey, subscriptionRegion); 

        // 言語を設定
        speechConfig.speechRecognitionLanguage = 'ja-JP';

        // マイクからの音声入力を取得する
        const audioConfig = AudioConfig.fromMicrophoneInput(selectedMicrophoneId);

        
        // 音声認識を行うSpeechRecognizerを生成
        const speechRecognizer = new SpeechRecognizer(speechConfig, audioConfig);
        

        if(speechRecognizer !== undefined) {
            // 音声認識の途中結果を取得
            speechRecognizer.recognizing = (_s, _e) => {
                //console.log(`Recognizing: ${e.result.text}`);
            };

            // 音声認識が完了した際の処理
            speechRecognizer.recognized = (_s, e) => {
                //setSpeechText(e.result.text);
                sendTranslate(e.result.text);
            };

            // 音声認識が中断された際の処理
            speechRecognizer.canceled = (_s, e) => {
                console.log(`Canceled: ${e.reason}`);
                //alert('音声認識が中断されました。翻訳ボタンを再度押下してください。');
            };

            // 音声認識セッションが終了したときの処理
            speechRecognizer.sessionStopped = (_s, _e) => {
                console.log('Session stopped');
            };

            // 音声認識を開始
            if(isMicrophoneOn){
                speechRecognizer.startContinuousRecognitionAsync();
            }
            else {
                speechRecognizer.stopContinuousRecognitionAsync();
            }
        }
    }

    // 翻訳APIを呼び出す
    async function sendTranslate(speakingText: string) {
        
        try{
            if(speakingText !== undefined && speakingText !== null && speakingText !== '') { 
                const { data } = await client.queries.translate({
                    text: speakingText,
                    sourceLanguage: 'ja',
                    targetLanguage: 'en'
                });
                if (data) {
                    setSpeechText(prevText => prevText + '\n' + '[' + participantName + ' ] : ' + speakingText + ' (' + data + ')');
                    sendDataMessage(`[${participantName} ] : ${speakingText} (${data})`);
                }
                console.log(speakingText);
            }
        } catch (error) {
            console.log(error);
            console.log(speakingText);
        }   
    }

    // Chimeミーティングに参加する
    async function joinChimeMeeting() {
        var logger = new ConsoleLogger('MyLogger', LogLevel.INFO);
        var deviceController = new DefaultDeviceController(logger);
        console.log('deviceController', deviceController);

        //ミーティングセッションの設定
        const configuration = new MeetingSessionConfiguration(meeting, attendee);
        meetingSession.current = new DefaultMeetingSession(configuration, logger, deviceController);     

        // DataMessageを受信するリスナー
        meetingSession.current.audioVideo.realtimeSubscribeToReceiveDataMessage('chat', (dataMessage: DataMessage) => {
            if (dataMessage.text()) {
            console.log('Received message: ', dataMessage.text());
            // UIにメッセージを表示する処理など
            setSpeechText(prevText => prevText + '\n' + dataMessage.text());
            }
        });

        // AudioVideoFacadeを取得(たくさん使うのでコンパクトに宣言)
        const audioVideo : AudioVideoFacade = meetingSession.current.audioVideo;

        // デバイスのラベルを設定(オーディオの設定)
        audioVideo.setDeviceLabelTrigger(async (): Promise<MediaStream> => {
            return await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        });

        //const audioInputDevices = await audioVideo.listAudioInputDevices();

        console.log('selectedMicrophoneId', selectedMicrophoneId);
        console.log('selectedSpeakerId', selectedSpeakerId);
        console.log('selectedCameraId', selectedCameraId);

        // 入出力デバイスの設定
        try {
            await audioVideo.startAudioInput(selectedMicrophoneId);
            await audioVideo.chooseAudioOutput(selectedSpeakerId);
            await audioVideo.startVideoInput(selectedCameraId);
            
        } catch (error) {
            console.log('startAudioError : ' +  error);
        }
        
        // ミーティングセッションの音声をバインド
        await audioVideo.bindAudioElement(document.getElementById('meeting-audio') as HTMLAudioElement);
        
        // ミーティングセッションを開始
        audioVideo.start();

        // ミーティングセッションのビデオをバインド
        audioVideo.startLocalVideoTile();
        audioVideo.bindVideoElement(1, document.getElementById('localVideo') as HTMLVideoElement);

        // observerの設定
        audioVideo.addObserver({
            audioVideoDidStart: () => {
                console.log('audioVideoDidStart');
            },
            audioVideoDidStop: (sessionStatus) => {
                console.log('audioVideoDidStop', sessionStatus);
            },
            audioVideoDidStartConnecting: (reconnecting) => {
                console.log('audioVideoDidStartConnecting', reconnecting);
            },
            videoTileDidUpdate: (tileState : VideoTileState) => {
                if(!tileState.boundAttendeeId || !tileState.localTile) return;
                const remoteVideoElement = document.getElementById('remoteVideo') as HTMLVideoElement;
                if (tileState.tileId !== null) {
                    audioVideo.bindVideoElement(tileState.tileId, remoteVideoElement);
                }
            }
        });

        

        

        // ミーティングセッションのイベントを監視
        audioVideo.realtimeSubscribeToAttendeeIdPresence((attendeeId, present, externalUserId) => {
            console.log('realtimeSubscribeToAttendeeIdPresence', attendeeId, present, externalUserId);
        });

        // ミーティングセッションの音量を監視
        audioVideo.realtimeSubscribeToVolumeIndicator(attendee, (volume, muted) => {
            console.log('realtimeSubscribeToVolumeIndicator', `音量: ${volume}, ミュート: ${muted}`);
        });

        toast.success('会議を開始しました。');
    }

    // DataMessageを送信する関数
    function sendDataMessage(text: string) {
        const topic = 'chat'; // トピック名
        const lifetimeMs = 300000; // メッセージの生存時間（ミリ秒）
        
        // メッセージをバイト配列として送信
        meetingSession.current?.audioVideo.realtimeSendDataMessage(topic, text, lifetimeMs);
    }
  
    
  

    // Chimeミーティングから退室する
    function leaveChimeMeeting() {
        //observerの設定
        const observer = {
            audioVideoDidStop: (sessionStatus) => {
                var sessionStatusCode = sessionStatus.statusCode();
                if (sessionStatusCode === MeetingSessionStatusCode.Left) {
                    alert('ミーティングを退室しました。');
                    handleJoinMeeting();
                    console.log('meeting left');
                } else {
                    alert('セッションが切れました。ステータスコード： ' + sessionStatusCode);
                    console.log('Session status code: ', sessionStatusCode);
                }
            }
        };
        console.log(observer);

        // menu画面に戻る
        handleJoinMeeting();
    }

    const handleMicrophoneToggle = () => {
        setMicrophoneOn((prev) => !prev);
    };

    // const handleTranslationToggle = () => {
    //     //setTranslationOn((prev) => !prev);
    // };

    return (
        <Flex direction="column" gap="2rem" marginTop="4rem">
            <div>
                <audio id="meeting-audio" style={{ display: 'none' }}></audio>
                <Button onClick={handleMicrophoneToggle} style={{ marginRight: '1rem'}}>
                    {isMicrophoneOn ? 'Turn Microphone Off' : 'Turn Microphone On'}
                </Button>
                {/* <button onClick={invokeSendSpeechToText}>Send</button> */}

                <Button onClick={leaveChimeMeeting}>退室する</Button>
                {/* <Button onClick={handleTranslationToggle}>
                    {isTranslationOn ? 'Turn Translation Off' : 'Turn Translation On'}
                </Button>          */}
            </div>

            <TextField
                label="会話内容"
                // width='50vh'
                labelHidden={true}
                value={speechText}
                readOnly
                style={{ height: '50vh' ,width: '60vh' ,whiteSpace: 'pre-wrap'}} 
            />

            <video id="localVideo" autoPlay playsInline></video>
            <video id="remoteVideo" autoPlay playsInline></video>

            <ToastContainer />
        </Flex>
    );
};

export default MeetingDisplay;