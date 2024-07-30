import {Routes, Route} from 'react-router-dom';
import App  from './App';
import CreateMeeting from './CreateMeeting';
import { NotFound } from './NotFound';
import MeetingDisplay from './MeetingDisplay';
import DeviceSetting from './DeviceSetting';

export const AppRoutes = () => {
    return (
        <Routes>
            <Route path='/' element={<App />} />
            <Route path='/createMeeting' element={<CreateMeeting />} />
            <Route path='/meeting' element={<MeetingDisplay selectedMicrophoneId={''} selectedSpeakerId={''} />} />
            <Route path='/deviceSetting' element={<DeviceSetting />} />
            <Route path='*' element={<NotFound/>} />
        </Routes>
    );
};
