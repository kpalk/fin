import { ReactNode } from 'react';
import { Box } from '@mui/material';
import AppHeader from '../components/AppHeader';

interface HostLayoutProps {
    children: ReactNode;
    onLogoClick?: () => void;
    headerRight?: ReactNode;
}

const HostLayout = ({ children, onLogoClick, headerRight }: HostLayoutProps) => {
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
            <AppHeader onLogoClick={onLogoClick} right={headerRight} />
            {children}
        </Box>
    );
};

export default HostLayout;
