import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Typography,
    Stack,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
} from '@mui/material';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import LocalFireDepartmentOutlinedIcon from '@mui/icons-material/LocalFireDepartmentOutlined';
import HourglassBottomRoundedIcon from '@mui/icons-material/HourglassBottomRounded';
import ThumbUpAltRoundedIcon from '@mui/icons-material/ThumbUpAltRounded';
import ThumbDownAltRoundedIcon from '@mui/icons-material/ThumbDownAltRounded';
import type { CardValue, GameState, EmoteType } from '../../types';
import JoinerLayout from '../../layouts/JoinerLayout';
import EstimationCard from '../../components/EstimationCard';
import FibonacciLoader from '../../components/FibonacciLoader';

const EMOTE_COOLDOWN_MS = 2000;

const EMOTE_BUTTONS: { type: EmoteType; Icon: React.ElementType }[] = [
    { type: 'up', Icon: ArrowUpwardRoundedIcon },
    { type: 'down', Icon: ArrowDownwardRoundedIcon },
    { type: 'fire', Icon: LocalFireDepartmentOutlinedIcon },
    { type: 'hourGlass', Icon: HourglassBottomRoundedIcon },
    { type: 'thumbUp', Icon: ThumbUpAltRoundedIcon },
    { type: 'thumbDown', Icon: ThumbDownAltRoundedIcon },
];

interface JoinerCardsProps {
    state: GameState;
    myId: string;
    onPickCard: (value: CardValue) => void;
    onDeselectCard: () => void;
    onSendEmote: (emote: EmoteType) => void;
}

const JoinerCards = ({ state, myId, onPickCard, onDeselectCard, onSendEmote }: JoinerCardsProps) => {
    const { availableCards, players, phase, acceptedEstimate } = state;
    const me = players.find((p) => p.id === myId);
    const picked = me?.pickedCard;
    const isRevealed = phase === 'revealed';

    const navigate = useNavigate();
    const [confirmLeave, setConfirmLeave] = useState(false);
    const lastSentRef = useRef<Partial<Record<EmoteType, number>>>({});
    const [coolingDown, setCoolingDown] = useState<Partial<Record<EmoteType, boolean>>>({});

    const handleCardTap = (card: CardValue) => {
        if (isRevealed) return;
        if (picked === card) {
            onDeselectCard();
        } else {
            onPickCard(card);
        }
    };

    const handleEmote = (type: EmoteType) => {
        const now = Date.now();
        if ((lastSentRef.current[type] ?? 0) + EMOTE_COOLDOWN_MS > now) return;
        lastSentRef.current[type] = now;
        onSendEmote(type);
        setCoolingDown((prev) => ({ ...prev, [type]: true }));
        setTimeout(() => setCoolingDown((prev) => ({ ...prev, [type]: false })), EMOTE_COOLDOWN_MS);
    };

    const showEmotes = (phase === 'estimating' && !!picked) || isRevealed;

    return (
        <JoinerLayout myName={me?.name} onLogoClick={() => setConfirmLeave(true)}>
            <Box
                sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                    width: '100%',
                }}
            >
                {isRevealed ? (
                    <>
                        {acceptedEstimate ? (
                            <>
                                <Typography variant="h6" fontWeight={700} textAlign="center">
                                    ✨ estimated ✨
                                </Typography>
                                <Box sx={{ mt: 2 }}>
                                    <EstimationCard value={acceptedEstimate} variant="center" accepted />
                                </Box>
                            </>
                        ) : (
                            <>
                                <FibonacciLoader size={60} />
                                <Typography variant="body1" color="text.secondary" textAlign="center">
                                    Host is reviewing the results…
                                </Typography>
                            </>
                        )}
                    </>
                ) : (
                    <>
                        <Typography variant="body2" color="text.secondary" textAlign="center">
                            {picked ? `You picked ${picked} — tap again to deselect` : 'Pick your estimate'}
                        </Typography>

                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: `repeat(${availableCards.length <= 4 ? 2 : availableCards.length <= 6 ? 3 : 4}, 68px)`,
                                gap: { xs: 1, sm: 1.5 },
                            }}
                        >
                            {availableCards.map((card) => (
                                <Box key={card} sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <EstimationCard
                                        value={card}
                                        variant="joiner"
                                        selected={picked === card}
                                        onClick={() => handleCardTap(card)}
                                    />
                                </Box>
                            ))}
                        </Box>
                    </>
                )}
            </Box>

            <Dialog open={confirmLeave} onClose={() => setConfirmLeave(false)}>
                <DialogTitle>Leave session?</DialogTitle>
                <DialogContent>
                    <DialogContentText>You'll be disconnected from the session.</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmLeave(false)}>Stay</Button>
                    <Button variant="contained" onClick={() => navigate('/')}>
                        Leave
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Emote bar — always rendered to reserve space, visibility toggled to prevent layout shift */}
            <Stack
                direction="row"
                justifyContent="center"
                gap={0.5}
                sx={{ visibility: showEmotes ? 'visible' : 'hidden' }}
            >
                {EMOTE_BUTTONS.map(({ type, Icon }) => (
                    <IconButton
                        key={type}
                        onClick={() => handleEmote(type)}
                        disabled={!!coolingDown[type]}
                        size="large"
                        sx={{
                            opacity: coolingDown[type] ? 0.35 : 1,
                            transition: 'opacity 0.2s ease',
                            color: 'text.secondary',
                            '&:hover': { color: 'primary.main' },
                        }}
                    >
                        <Icon fontSize="medium" />
                    </IconButton>
                ))}
            </Stack>
        </JoinerLayout>
    );
};

export default JoinerCards;
