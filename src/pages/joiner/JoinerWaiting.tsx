import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Typography,
    Chip,
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
} from '@mui/material';
import type { Player } from '../../types';
import JoinerLayout from '../../layouts/JoinerLayout';
import FibonacciLoader from '../../components/FibonacciLoader';
import AnimatedDots from '../../components/AnimatedDots';

interface JoinerWaitingProps {
    players: Player[];
    myId: string;
}

const JoinerWaiting = ({ players, myId }: JoinerWaitingProps) => {
    const navigate = useNavigate();
    const [confirmLeave, setConfirmLeave] = useState(false);
    const me = players.find((p) => p.id === myId);

    return (
        <JoinerLayout myName={me?.name} onLogoClick={() => setConfirmLeave(true)}>
            <Box
                sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                }}
            >
                <FibonacciLoader size={80} />

                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                        Waiting for the host to begin
                        <AnimatedDots />
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {players.length} teammate{players.length !== 1 ? 's' : ''} in the room
                    </Typography>
                </Box>

                {(() => {
                    const others = [...players].reverse().filter((p) => p.id !== myId);
                    const visible = [...(me ? [me] : []), ...others.slice(0, 2)];
                    const hiddenCount = players.length - visible.length;
                    return (
                        <Stack direction="row" flexWrap="wrap" gap={1} justifyContent="center">
                            {visible.map((p) => (
                                <Chip
                                    key={p.id}
                                    label={p.name}
                                    color={p.id === myId ? 'primary' : 'default'}
                                    variant={p.id === myId ? 'filled' : 'outlined'}
                                    sx={{ fontSize: '1rem' }}
                                />
                            ))}
                            {hiddenCount > 0 && (
                                <Chip label={`+${hiddenCount}`} variant="outlined" sx={{ fontSize: '1rem' }} />
                            )}
                        </Stack>
                    );
                })()}
            </Box>

            <Dialog open={confirmLeave} onClose={() => setConfirmLeave(false)}>
                <DialogTitle>Leave session?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        You'll be disconnected from the session and the host will see you leave.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmLeave(false)}>Stay</Button>
                    <Button variant="contained" onClick={() => navigate('/')}>
                        Leave
                    </Button>
                </DialogActions>
            </Dialog>
        </JoinerLayout>
    );
};

export default JoinerWaiting;
