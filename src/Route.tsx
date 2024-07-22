import {Routes, Route} from 'react-router-dom';
import App  from './App';
import CreateMeeting from './CreateMeeting';
import { NotFound } from './NotFound';

export const AppRoutes = () => {
    return (
        <Routes>
            <Route path='/' element={<App />} />
            <Route path='/createMeeting' element={<CreateMeeting />} />
            <Route path='*' element={<NotFound/>} />
        </Routes>
    );
};
