import {Routes, Route} from 'react-router-dom';
import App  from './App';
import CreateMeeting from './CreateMeeting';
import { NotFound } from './NotFound';
import MeetingDisplay from './MeetingDisplay';
import DeviceSetting from './DeviceSetting';
import JoinMeeting from './JoinMeeting';

export const AppRoutes = () => {
    return (
        <Routes>
            <Route path='/' element={<App />} />
            <Route path='/createMeeting' element={<CreateMeeting />} />
            <Route path='/joinMeeting' element={<JoinMeeting />} />
            <Route path='/meeting' element={<MeetingDisplay meeting={''} selectedMicrophoneId={''} selectedSpeakerId={''} />} />
            <Route path='/deviceSetting' element={<DeviceSetting meeting={''} />} />
            <Route path='*' element={<NotFound/>} />
        </Routes>
    );
};
