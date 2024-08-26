import React, { useEffect, useState } from 'react';
import { SpeechRecognizer, AudioConfig, SpeechConfig} from 'microsoft-cognitiveservices-speech-sdk';
import { generateClient } from 'aws-amplify/data';
import { type Schema } from '../amplify/data/resource';
import { ConsoleLogger, DefaultDeviceController, DefaultMeetingSession, LogLevel, MeetingSessionConfiguration, MeetingSessionStatusCode } from 'amazon-chime-sdk-js'
import { useLocation, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// 引数受け取りのためのインターフェースを定義
interface MeetingDisplayProps { 
    meeting: string;
    selectedMicrophoneId: string;
    selectedSpeakerId: string;
}

const MeetingDisplay: React.FC<MeetingDisplayProps> = () => {

    // マイクのON/OFFを管理
    const [isMicrophoneOn, setMicrophoneOn] = useState(true);

    // 会話内容を保持
    const [speechText, setSpeechText] = useState<string>('');

    // DeviceSetting.tsxからの引数を取得
    const location = useLocation();
    const meeting = JSON.parse(location.state.meeting).meeting;
    const attendee = JSON.parse(location.state.meeting).attendee;
    const selectedMicrophoneId = location.state.selectedMicrophoneId;
    const selectedSpeakerId = location.state.selectedSpeakerId;

    // 画面遷移設定
    const navigate = useNavigate();
    const handleJoinMeeting = () => navigate('/');

    // 初回レンダリング時にSpeechToTextとChimeミーティングに参加する
    useEffect(() => {
        console.log('useEffect called');
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
        var audioConfig = AudioConfig.fromMicrophoneInput(selectedMicrophoneId);
        
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
        // スキーマを定義
        const client = generateClient<Schema>();
        try{
            if(speakingText !== undefined && speakingText !== null && speakingText !== '') { 
                const { data } = await client.queries.translate({
                    text: speakingText,
                    sourceLanguage: 'ja',
                    targetLanguage: 'en'
                });
                if (data) {
                    setSpeechText(prevText => prevText + '\n' + data);
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
        var configuration = new MeetingSessionConfiguration(meeting, attendee);
        var meetingSession = new DefaultMeetingSession(configuration, logger, deviceController);

        // 入出力デバイスの設定
        await meetingSession.audioVideo.startAudioInput(selectedMicrophoneId);
        await meetingSession.audioVideo.chooseAudioOutput(selectedSpeakerId);

        // observerの設定
        meetingSession.audioVideo.addObserver({
            audioVideoDidStart: () => {
                console.log('audioVideoDidStart');
            },
            audioVideoDidStop: (sessionStatus) => {
                console.log('audioVideoDidStop', sessionStatus);
            },
            audioVideoDidStartConnecting: (reconnecting) => {
                console.log('audioVideoDidStartConnecting', reconnecting);
            },
        });

        // ミーティングセッションを開始
        await meetingSession.audioVideo.start();
        toast.success('会議を開始しました。');
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
    }

    const handleMicrophoneToggle = () => {
        setMicrophoneOn((prev) => !prev);
    };

    const handleTranslationToggle = () => {
        //setTranslationOn((prev) => !prev);
    };

    return (
        <div>
            <div>
                <button onClick={handleMicrophoneToggle}>
                    {isMicrophoneOn ? 'Turn Microphone Off' : 'Turn Microphone On'}
                </button>
                {/* <button onClick={invokeSendSpeechToText}>Send</button> */}

                <button onClick={leaveChimeMeeting}>退室する</button>
                <button onClick={handleTranslationToggle}>
                    {/* {isTranslationOn ? 'Turn Translation Off' : 'Turn Translation On'} */}
                </button>         
            </div>
            <div>
                <textarea value={speechText} readOnly/>
            </div>
            <ToastContainer />
        </div>
    );
};

export default MeetingDisplay;