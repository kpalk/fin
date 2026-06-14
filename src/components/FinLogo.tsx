import { Box, type SxProps, type Theme } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface FinLogoProps {
    size?: number;
    sx?: SxProps<Theme>;
    onClick?: () => void;
}

const FinLogo = ({ size = 48, sx, onClick }: FinLogoProps) => {
    const navigate = useNavigate();
    return (
        <Box
            onClick={onClick ?? (() => navigate('/'))}
            sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, cursor: 'pointer', ...sx }}
        >
            <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Orca dorsal fin — steep leading edge, swept trailing edge */}
                <path
                    d="M18 90 L26 16 C28 6, 40 4, 56 20 C68 34, 76 60, 82 90 C70 86, 55 84, 40 85 Z"
                    fill="currentColor"
                    opacity="0.9"
                />
                {/* Shine on leading edge */}
                <path
                    d="M24 60 C22 45, 23 28, 27 18 C28 14, 31 13, 32 18 C33 28, 30 46, 28 62 Z"
                    fill="white"
                    opacity="0.25"
                />
            </svg>
            <Box
                component="span"
                sx={{
                    fontFamily: '"Inter", "Roboto", sans-serif',
                    fontWeight: 800,
                    fontSize: size * 0.5,
                    letterSpacing: '-0.03em',
                    color: 'currentcolor',
                }}
            >
                fin
            </Box>
        </Box>
    );
};

export default FinLogo;
