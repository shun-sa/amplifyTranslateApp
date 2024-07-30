import React, { useEffect, useState } from 'react';
import { SpeechRecognizer, AudioConfig, SpeechConfig, SpeakerAudioDestination } from 'microsoft-cognitiveservices-speech-sdk';

// 引数受け取りのためのインターフェースを定義
interface MeetingDisplayProps { 
    selectedMicrophoneId: string;
    selectedSpeakerId: string;
}

const MeetingDisplay: React.FC<MeetingDisplayProps> = (MeetingDisplayProps) => {

    const [isMicrophoneOn, setMicrophoneOn] = useState(false);
    const [isTranslationOn, setTranslationOn] = useState(false);
    const [speechText, setSpeechText] = useState<string>('');

    useEffect(() => {
        invokeSendSpeechToText();
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

    const handleMicrophoneToggle = () => {
        setMicrophoneOn((prev) => !prev);
    };

    const handleTranslationToggle = () => {
        setTranslationOn((prev) => !prev);
    };

    const handleBackButtonClick = () => {
        // Handle back button click logic here
    };

    return (
        <div>
            <div>
                <button onClick={handleMicrophoneToggle}>
                    {isMicrophoneOn ? 'Turn Microphone Off' : 'Turn Microphone On'}
                </button>
                <button onClick={invokeSendSpeechToText}>Send</button>

                <button onClick={handleBackButtonClick}>Back</button>
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