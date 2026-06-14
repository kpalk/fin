import { Box, Chip } from '@mui/material';
import AppHeader from '../components/AppHeader';

interface JoinerLayoutProps {
    children: React.ReactNode;
    /** Name chip shown top-right once the joiner has joined. */
    myName?: string;
    onLogoClick?: () => void;
}

const JoinerLayout = ({ children, myName, onLogoClick }: JoinerLayoutProps) => {
    return (
        <Box
            sx={{
                minHeight: '100dvh',
                display: 'flex',
                flexDirection: 'column',
                px: 2,
                pt: 2,
                pb: 3,
                gap: 2,
            }}
        >
            <AppHeader
                onLogoClick={onLogoClick}
                right={
                    myName ? (
                        <Chip label={myName} color="primary" variant="outlined" sx={{ fontSize: '1rem' }} />
                    ) : undefined
                }
            />
            {children}
        </Box>
    );
};

export default JoinerLayout;
