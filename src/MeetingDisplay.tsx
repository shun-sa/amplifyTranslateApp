import React, { useEffect, useState } from 'react';
import { SpeechRecognizer, AudioConfig, SpeechConfig, SpeakerAudioDestination } from 'microsoft-cognitiveservices-speech-sdk';
import { generateClient } from 'aws-amplify/data';
import { type Schema } from '../amplify/data/resource';
import { ConsoleLogger, DefaultDeviceController, DefaultMeetingSession, LogLevel, MeetingSessionConfiguration, MeetingSessionStatusCode } from 'amazon-chime-sdk-js'


// 引数受け取りのためのインターフェースを定義
interface MeetingDisplayProps { 
    chimeMeetingInfo: Object;
    attendee: Object;
    selectedMicrophoneId: string;
    selectedSpeakerId: string;
}

const MeetingDisplay: React.FC<MeetingDisplayProps> = (MeetingDisplayProps) => {

    const [isMicrophoneOn, setMicrophoneOn] = useState(false);
    const [isTranslationOn, setTranslationOn] = useState(false);
    const [speechText, setSpeechText] = useState<string>('');

    // Chime設定
    // const chime = new Chime({
    //     region: 'us-east-1',
    //     endpoint: 'service.chime.aws.amazon.com',
    // });

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
        var audioConfig = AudioConfig.fromMicrophoneInput(MeetingDisplayProps.selectedMicrophoneId);
        //const speakerAudioDestination = new SpeakerAudioDestination();
        
        // 音声認識を行うSpeechRecognizerを生成
        var speechRecognizer = new SpeechRecognizer(speechConfig, audioConfig);

        // 音声認識の途中結果を取得
        speechRecognizer.recognizing = (s, e) => {
            //console.log(`Recognizing: ${e.result.text}`);
        };

        // 音声認識が完了した際の処理
        speechRecognizer.recognized = (s, e) => {
            //console.log(`Recognized: ${e.result.text}`);
            setSpeechText(e.result.text);
            sendTranslate(e.result.text);
        };

        // 音声認識が中断された際の処理
        speechRecognizer.canceled = (s, e) => {
            console.log(`Canceled: ${e.reason}`);
            alert('音声認識が中断されました。翻訳ボタンを再度押下してください。');
        };

        // 音声認識セッションが終了したときの処理
        speechRecognizer.sessionStopped = (s, e) => {
            console.log('Session stopped');
        };

        // 音声認識を開始
        speechRecognizer.startContinuousRecognitionAsync(); 
    }

    // 翻訳APIを呼び出す
    async function sendTranslate(speakingText: string) {
        // スキーマを定義
        const client = generateClient<Schema>();

        const { data } = await client.queries.translate({
            text: speakingText,
            sourceLanguage: 'ja',
            targetLanguage: 'en'
        });

        //setText(data || '翻訳できませんでした');
    }

    // Chimeミーティングに参加する
    async function joinChimeMeeting() {
        //let response = await $axios.get(createMeetingUrl);
        var logger = new ConsoleLogger('MyLogger', LogLevel.INFO);
        var deviceController = new DefaultDeviceController(logger);
        console.log('deviceController', deviceController);

        //ミーティングセッションの設定
        var configuration = new MeetingSessionConfiguration(MeetingDisplayProps.chimeMeetingInfo, MeetingDisplayProps.attendee);
        var meetingSession = new DefaultMeetingSession(configuration, logger, deviceController);

        // 入出力デバイスの設定
        meetingSession.audioVideo.chooseAudioOutput(MeetingDisplayProps.selectedSpeakerId);

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
        meetingSession.audioVideo.start();
    }

    // Chimeミーティングから退室する
    function leaveChimeMeeting() {
        //observerの設定
        var observer = {
            audioVideoDidStop: (sessionStatus) => {
                var sessionStatusCode = sessionStatus.statusCode();
                if (sessionStatusCode === MeetingSessionStatusCode.Left) {
                    alert('ミーティングを退室しました。');
                } else {
                    alert('セッションが切れました。ステータスコード： ' + sessionStatusCode);
                }
            }
        };
    }

    const handleMicrophoneToggle = () => {
        setMicrophoneOn((prev) => !prev);
    };

    const handleTranslationToggle = () => {
        setTranslationOn((prev) => !prev);
    };

    return (
        <div>
            <div>
                <button onClick={handleMicrophoneToggle}>
                    {isMicrophoneOn ? 'Turn Microphone Off' : 'Turn Microphone On'}
                </button>
                <button onClick={invokeSendSpeechToText}>Send</button>

                <button onClick={leaveChimeMeeting}>退室する</button>
                <button onClick={handleTranslationToggle}>
                    {isTranslationOn ? 'Turn Translation Off' : 'Turn Translation On'}
                </button>         
            </div>
            <div>
                <textarea value={speechText} />
            </div>
        </div>
    );
};

export default MeetingDisplay;