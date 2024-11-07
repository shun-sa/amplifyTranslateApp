import { Text, Button } from '@aws-amplify/ui-react';

export default function Header({ signOut }) {

    return (
        <header style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            position: 'fixed', 
            top: 0, 
            left: 0,
            width: '100%', 
            backgroundColor: 'white', 
            zIndex: 1000, 
            padding: '10px 20px', 
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
        }}>
            <Text 
                fontSize="1.5rem"
                fontWeight="500"
                color="rgba(0,0,0,1)"
            >
                AI翻訳アプリ
            </Text>
            <Button
                shrink="0"
                isDisabled={false}
                variation="primary"
                onClick={signOut}
            >
                Sign Out
            </Button>
        </header>
    );
};
