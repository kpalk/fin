import { useState } from 'react';
import { Box, TextField, Typography } from '@mui/material';
import EastRoundedIcon from '@mui/icons-material/EastRounded';
import FinLogo from '../../components/FinLogo';
import FinButton from '../../components/FinButton';
import AnimatedDots from '../../components/AnimatedDots';

interface JoinerEntryProps {
    connected: boolean;
    onJoin: (name: string) => void;
    nameTaken?: boolean;
}

const JoinerEntry = ({ connected, onJoin, nameTaken }: JoinerEntryProps) => {
    const [name, setName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) onJoin(name.trim());
    };

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
                minHeight: '100dvh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                p: 4,
                gap: 4,
            }}
        >
            <FinLogo size={56} sx={{ color: 'primary.main' }} />

            <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" fontWeight={700} gutterBottom>
                    Join the session
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Enter your name so the team knows who you are
                </Typography>
            </Box>

            <TextField
                autoFocus
                fullWidth
                label="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                slotProps={{ htmlInput: { maxLength: 32 } }}
                sx={{ maxWidth: 320 }}
                disabled={!connected}
                error={nameTaken}
                helperText={nameTaken ? 'That name is already taken — pick another' : undefined}
            />

            <FinButton
                type="submit"
                variant="contained"
                disabled={!connected || !name.trim()}
                endIcon={connected ? <EastRoundedIcon /> : undefined}
                sx={{ px: 3 }}
            >
                {connected ? (
                    'Join'
                ) : (
                    <>
                        Connecting
                        <AnimatedDots />
                    </>
                )}
            </FinButton>
        </Box>
    );
};

export default JoinerEntry;
