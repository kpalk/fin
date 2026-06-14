import { Box } from '@mui/material';
import FinLogo from './FinLogo';

interface AppHeaderProps {
    onLogoClick?: () => void;
    right?: React.ReactNode;
}

const AppHeader = ({ onLogoClick, right }: AppHeaderProps) => {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 36 }}>
            <FinLogo size={40} sx={{ color: 'primary.main' }} onClick={onLogoClick} />
            {right && <Box sx={{ display: 'flex', alignItems: 'center' }}>{right}</Box>}
        </Box>
    );
};

export default AppHeader;
