import { useState } from 'react';
import {
    Box,
    Button,
    Chip,
    Stack,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
} from '@mui/material';
import EastRoundedIcon from '@mui/icons-material/EastRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import { QRCodeSVG } from 'qrcode.react';
import type { Player } from '../../types';
import HostLayout from '../../layouts/HostLayout';
import FinButton from '../../components/FinButton';
import AnimatedDots from '../../components/AnimatedDots';

interface HostLobbyProps {
    peerId: string;
    players: Player[];
    onBegin: () => void;
    onGoHome: () => void;
}

const HostLobby = ({ peerId, players, onBegin, onGoHome }: HostLobbyProps) => {
    const joinUrl = `${window.location.origin}${import.meta.env.BASE_URL}?join=${peerId}`;
    const [copied, setCopied] = useState(false);
    const [confirmHome, setConfirmHome] = useState(false);

    const handleCopy = () => {
        const confirm = () => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        };
        if (navigator.clipboard) {
            navigator.clipboard.writeText(joinUrl).then(confirm).catch(() => {
                const el = document.createElement('textarea');
                el.value = joinUrl;
                document.body.appendChild(el);
                el.select();
                document.execCommand('copy');
                document.body.removeChild(el);
                confirm();
            });
        } else {
            const el = document.createElement('textarea');
            el.value = joinUrl;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
            confirm();
        }
    };

    const handleLogoClick = () => {
        if (players.length > 0) {
            setConfirmHome(true);
        } else {
            onGoHome();
        }
    };

    return (
        <HostLayout onLogoClick={handleLogoClick}>
            <Box
                sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: { xs: 2, sm: 3 },
                }}
            >
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        Join with QR or{' '}
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={handleCopy}
                            startIcon={<ContentCopyRoundedIcon />}
                            sx={{
                                textTransform: 'none',
                                color: 'text.secondary',
                                borderColor: 'divider',
                            }}
                        >
                            {copied ? 'Copied!' : 'Copy link'}
                        </Button>
                    </Typography>
                </Box>

                <Box sx={{ p: 2, borderRadius: 1, background: 'white', boxShadow: 4 }}>
                    <QRCodeSVG value={joinUrl} size={200} />
                </Box>

                <FinButton
                    variant="contained"
                    disabled={players.length === 0}
                    onClick={onBegin}
                    endIcon={<EastRoundedIcon />}
                    sx={{ px: 3 }}
                >
                    Begin
                </FinButton>

                <Box sx={{ textAlign: 'center', width: '100%' }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
                        {players.length === 0 ? (
                            <>
                                <span>Waiting for teammates</span>
                                <AnimatedDots />
                            </>
                        ) : (
                            <>
                                <span>
                                    {players.length} teammate{players.length !== 1 ? 's' : ''} joined — waiting for
                                    more
                                </span>
                                <AnimatedDots />
                            </>
                        )}
                    </Typography>
                    <Stack
                        direction="row"
                        flexWrap="wrap"
                        gap={1}
                        justifyContent="center"
                        mt={1}
                        sx={{
                            maxHeight: 150,
                            overflowY: 'auto',
                            scrollbarWidth: 'none',
                            '&::-webkit-scrollbar': { display: 'none' },
                            maskImage: 'linear-gradient(to bottom, black 120px, transparent 150px)',
                        }}
                    >
                        {[...players].reverse().map((p) => (
                            <Chip
                                key={p.id}
                                label={p.name}
                                color="primary"
                                variant="outlined"
                                sx={{ fontSize: '1rem' }}
                            />
                        ))}
                    </Stack>
                </Box>
            </Box>

            <Dialog open={confirmHome} onClose={() => setConfirmHome(false)}>
                <DialogTitle>End session?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {players.length} teammate{players.length !== 1 ? 's are' : ' is'} waiting in the lobby. Going
                        back will disconnect them.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmHome(false)}>Stay</Button>
                    <Button variant="contained" onClick={onGoHome}>
                        End session
                    </Button>
                </DialogActions>
            </Dialog>
        </HostLayout>
    );
};

export default HostLobby;
