import { Flex, Button } from '@aws-amplify/ui-react';

import { useNavigate } from 'react-router-dom';

export default function Menu() {

    const navigate = useNavigate();
    const handleJoinMeeting = () => navigate('/joinMeeting');
    const handleCreateMeeting = () => navigate('/createMeeting');

    return (

        <Flex direction="column" alignItems="center" gap="4rem">
            <Button
                width="100%"
                height="3rem"
                shrink="0"
                isDisabled={false}
                variation="primary"
                onClick={handleCreateMeeting}
            >
                ミーティングを登録
            </Button>
            <Button
                width="15rem"
                height="3rem"
                shrink="0"
                isDisabled={false}
                variation="primary"
                onClick={handleJoinMeeting}
            >
                ミーティングに参加
            </Button>
        </Flex>

    )
}