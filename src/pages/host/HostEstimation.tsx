import { useState, useMemo, useEffect, ElementType } from 'react';
import {
    Box,
    Button,
    Chip,
    IconButton,
    Typography,
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Tooltip,
} from '@mui/material';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import QrCode2RoundedIcon from '@mui/icons-material/QrCode2Rounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import { QRCodeSVG } from 'qrcode.react';
import { keyframes } from '@mui/system';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import LocalFireDepartmentOutlinedIcon from '@mui/icons-material/LocalFireDepartmentOutlined';
import HourglassBottomRoundedIcon from '@mui/icons-material/HourglassBottomRounded';
import ThumbUpAltRoundedIcon from '@mui/icons-material/ThumbUpAltRounded';
import ThumbDownAltRoundedIcon from '@mui/icons-material/ThumbDownAltRounded';
import type { CardValue, GameState, EmoteType } from '../../types';
import { FIBONACCI_CARDS } from '../../types';
import HostLayout from '../../layouts/HostLayout';
import EstimationCard from '../../components/EstimationCard';
import FinButton from '../../components/FinButton';

interface FloatingEmote {
    id: number;
    type: EmoteType;
    x: number;
    y: number;
    size: number;
}

const EMOTE_ICONS: Record<EmoteType, ElementType> = {
    up: ArrowUpwardRoundedIcon,
    down: ArrowDownwardRoundedIcon,
    fire: LocalFireDepartmentOutlinedIcon,
    hourGlass: HourglassBottomRoundedIcon,
    thumbUp: ThumbUpAltRoundedIcon,
    thumbDown: ThumbDownAltRoundedIcon,
};

const floatFade = keyframes`
  0%   { opacity: 0; transform: scale(0.4) rotate(-8deg); }
  12%  { opacity: 1; transform: scale(1.15) rotate(6deg); }
  25%  { transform: scale(1) rotate(-4deg); }
  40%  { transform: scale(1.05) rotate(3deg); }
  60%  { transform: scale(1) rotate(-2deg); opacity: 1; }
  85%  { opacity: 0.6; }
  100% { opacity: 0; transform: scale(0.9) translateY(-18px) rotate(0deg); }
`;

interface HostEstimationProps {
    state: GameState;
    peerId: string;
    lastEmote: { emote: EmoteType; key: number } | null;
    onReveal: () => void;
    onAcceptEstimate: (value: CardValue) => void;
    onReEstimate: (cards: CardValue[]) => void;
    onStartNew: () => void;
    onReconfigure: (cards: CardValue[]) => void;
    onGoHome: () => void;
}

const HostEstimation = ({
    state,
    peerId,
    lastEmote,
    onReveal,
    onAcceptEstimate,
    onReEstimate,
    onStartNew,
    onReconfigure,
    onGoHome,
}: HostEstimationProps) => {
    const [selectedCards, setSelectedCards] = useState<Set<CardValue>>(new Set());
    const [confirmReveal, setConfirmReveal] = useState(false);
    const [configOpen, setConfigOpen] = useState(false);
    const [dialogCards, setDialogCards] = useState<Set<CardValue>>(new Set());
    const [pendingAction, setPendingAction] = useState<'startNew' | 'openConfig' | 'goHome' | null>(null);
    const [floatingEmotes, setFloatingEmotes] = useState<FloatingEmote[]>([]);
    const [joinOpen, setJoinOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const joinUrl = `${window.location.origin}${import.meta.env.BASE_URL}?join=${peerId}`;

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

    const { players, phase, availableCards, acceptedEstimate } = state;

    const activeCount = players.filter((p) => p.pickedCard !== undefined).length;
    const allActive = activeCount === players.length && players.length > 0;
    const isRevealed = phase === 'revealed';
    const isUnanimous =
        isRevealed &&
        players.length > 0 &&
        !!players[0]?.pickedCard &&
        players.every((p) => p.pickedCard === players[0]!.pickedCard);

    const sortedPlayers = useMemo(() => {
        if (!isRevealed) return players;
        const order = [...availableCards].reverse();
        return [...players].sort((a, b) => {
            const ai = a.pickedCard ? order.indexOf(a.pickedCard) : 999;
            const bi = b.pickedCard ? order.indexOf(b.pickedCard) : 999;
            return ai - bi;
        });
    }, [players, isRevealed, availableCards]);

    const toggleCard = (value: CardValue) => {
        if (!isRevealed) return;
        setSelectedCards((prev) => {
            const next = new Set(prev);
            next.has(value) ? next.delete(value) : next.add(value);
            return next;
        });
    };

    useEffect(() => {
        if (!lastEmote) return;
        const id = lastEmote.key;
        const newEmote: FloatingEmote = {
            id,
            type: lastEmote.emote,
            x: 8 + Math.random() * 82,
            y: 15 + Math.random() * 60,
            size: 36 + Math.floor(Math.random() * 36),
        };
        setFloatingEmotes((prev) => [...prev.slice(-7), newEmote]);
        const t = setTimeout(() => {
            setFloatingEmotes((prev) => prev.filter((e) => e.id !== id));
        }, 5000);
        return () => clearTimeout(t);
    }, [lastEmote]);

    useEffect(() => {
        if (!isRevealed || acceptedEstimate) return;
        const firstCard = players[0]?.pickedCard;
        if (!firstCard) return;
        if (players.every((p) => p.pickedCard === firstCard)) {
            const t = setTimeout(() => onAcceptEstimate(firstCard), 300);
            return () => clearTimeout(t);
        }
    }, [isRevealed, acceptedEstimate, players, onAcceptEstimate]);

    const handleReveal = () => {
        if (!allActive) {
            setConfirmReveal(true);
        } else {
            onReveal();
        }
    };

    const handleAccept = () => {
        const vals = Array.from(selectedCards);
        if (vals.length === 1 && vals[0]) {
            onAcceptEstimate(vals[0]);
        }
    };

    const handleReEstimate = () => {
        const cards = availableCards.filter((c) => selectedCards.has(c));
        onReEstimate(cards.length >= 2 ? cards : [...availableCards]);
        setSelectedCards(new Set());
    };

    const openConfigDialog = () => {
        setDialogCards(new Set(availableCards));
        setConfigOpen(true);
    };

    const toggleDialogCard = (card: CardValue) => {
        setDialogCards((prev) => {
            const next = new Set(prev);
            if (next.has(card)) {
                if (next.size > 2) next.delete(card);
            } else {
                next.add(card);
            }
            return next;
        });
    };

    const handleApplyConfig = () => {
        const ordered = FIBONACCI_CARDS.filter((c) => dialogCards.has(c));
        onReconfigure(ordered);
        setConfigOpen(false);
        setSelectedCards(new Set());
    };

    const singleSelected = selectedCards.size === 1;
    const multiSelected = selectedCards.size > 1;

    const centerValue: CardValue | undefined =
        acceptedEstimate ?? (singleSelected ? Array.from(selectedCards)[0] : undefined);

    const headerRight = (
        <Stack direction="row" gap={0.5}>
            <Tooltip title="Show join QR">
                <IconButton size="large" onClick={() => setJoinOpen(true)}>
                    <QrCode2RoundedIcon fontSize="medium" />
                </IconButton>
            </Tooltip>
            <Tooltip title="Start new estimate">
                <IconButton
                    size="large"
                    onClick={() => {
                        if (activeCount > 0 && !acceptedEstimate) {
                            setPendingAction('startNew');
                        } else {
                            onStartNew();
                            setSelectedCards(new Set());
                        }
                    }}
                >
                    <RestartAltRoundedIcon fontSize="medium" />
                </IconButton>
            </Tooltip>
            <Tooltip title="Configure deck">
                <IconButton
                    size="large"
                    onClick={() => {
                        if (activeCount > 0 && !acceptedEstimate) {
                            setPendingAction('openConfig');
                        } else {
                            openConfigDialog();
                        }
                    }}
                >
                    <TuneRoundedIcon fontSize="medium" />
                </IconButton>
            </Tooltip>
        </Stack>
    );

    return (
        <HostLayout
            onLogoClick={() => {
                if (players.length > 0) {
                    setPendingAction('goHome');
                } else {
                    onGoHome();
                }
            }}
            headerRight={headerRight}
        >
            {/* Center area */}
            <Box
                sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 5,
                }}
            >
                {players.length === 0 ? (
                    <Box
                        sx={{
                            textAlign: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 2,
                        }}
                    >
                        <Typography variant="h6" fontWeight={700}>
                            No participants
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Everyone left. Share the link again to continue.
                        </Typography>
                        <FinButton variant="outlined" onClick={() => setJoinOpen(true)} sx={{ mt: 1 }}>
                            Share link
                        </FinButton>
                    </Box>
                ) : (
                    <Box sx={{ width: 200, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <EstimationCard value={centerValue} variant="center" accepted={!!acceptedEstimate} />
                    </Box>
                )}

                {/* Reserved button area — fixed height prevents layout shift */}
                <Box
                    sx={{
                        minHeight: 52,
                        display: players.length === 0 ? 'none' : 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {!isRevealed && (
                        <FinButton
                            variant="contained"
                            onClick={handleReveal}
                            disabled={activeCount === 0}
                            sx={{ px: 2.5 }}
                        >
                            Reveal ({activeCount}/{players.length})
                        </FinButton>
                    )}

                    {isRevealed && !acceptedEstimate && !isUnanimous && (
                        <Stack direction="row" gap={2}>
                            <Tooltip
                                title={!singleSelected ? 'Select exactly one card to accept' : ''}
                                disableHoverListener={singleSelected}
                            >
                                <span>
                                    <FinButton variant="contained" disabled={!singleSelected} onClick={handleAccept}>
                                        Accept estimate
                                    </FinButton>
                                </span>
                            </Tooltip>
                            <Tooltip
                                title={!multiSelected ? 'Select 2+ cards to re-estimate with those options' : ''}
                                disableHoverListener={multiSelected}
                            >
                                <span>
                                    <FinButton variant="outlined" disabled={!multiSelected} onClick={handleReEstimate}>
                                        Re-estimate
                                    </FinButton>
                                </span>
                            </Tooltip>
                        </Stack>
                    )}

                    {isRevealed && acceptedEstimate && (
                        <FinButton
                            variant="contained"
                            onClick={() => {
                                onStartNew();
                                setSelectedCards(new Set());
                            }}
                            sx={{ px: 2.5 }}
                        >
                            Start new estimate
                        </FinButton>
                    )}
                </Box>
            </Box>

            {/* Player cards row */}
            <Box sx={{ display: players.length === 0 ? 'none' : undefined }}>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        mb: 1,
                        display: 'block',
                        textAlign: 'center',
                        visibility: !isRevealed || (!acceptedEstimate && !isUnanimous) ? 'visible' : 'hidden',
                    }}
                >
                    {isRevealed ? 'Tap cards to select' : `${activeCount} of ${players.length} voted`}
                </Typography>
                <Stack
                    direction="row"
                    gap={1.5}
                    justifyContent="safe center"
                    sx={{
                        pb: 1,
                        overflowX: 'auto',
                        // hide scrollbar visually but keep it functional
                        scrollbarWidth: 'none',
                        '&::-webkit-scrollbar': { display: 'none' },
                        // fade edges to hint scrollability
                        maskImage:
                            'linear-gradient(to right, transparent 0%, black 24px, black calc(100% - 24px), transparent 100%)',
                        px: 3,
                    }}
                >
                    {sortedPlayers.map((player) => (
                        <EstimationCard
                            key={player.id}
                            value={isRevealed ? player.pickedCard : undefined}
                            name={player.name}
                            faceDown={!isRevealed}
                            active={player.pickedCard !== undefined}
                            selected={
                                isRevealed &&
                                !!player.pickedCard &&
                                (selectedCards.has(player.pickedCard) ||
                                    (!!acceptedEstimate && player.pickedCard === acceptedEstimate))
                            }
                            disabled={!isRevealed && player.pickedCard === undefined}
                            onClick={
                                isRevealed && !acceptedEstimate && player.pickedCard
                                    ? () => toggleCard(player.pickedCard!)
                                    : undefined
                            }
                            variant="player"
                        />
                    ))}
                </Stack>
            </Box>

            {/* Floating emotes */}
            {floatingEmotes.map((e) => {
                const Icon = EMOTE_ICONS[e.type];
                return (
                    <Box
                        key={e.id}
                        sx={{
                            position: 'fixed',
                            left: `${e.x}vw`,
                            top: `${e.y}vh`,
                            pointerEvents: 'none',
                            zIndex: 1300,
                            color: 'primary.main',
                            animation: `${floatFade} 5s ease forwards`,
                        }}
                    >
                        <Icon sx={{ fontSize: e.size }} />
                    </Box>
                );
            })}

            {/* Confirm reveal with missing votes */}
            <Dialog open={confirmReveal} onClose={() => setConfirmReveal(false)}>
                <DialogTitle>Not everyone has voted</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {players.length - activeCount} teammate
                        {players.length - activeCount !== 1 ? 's haven\u2019t' : ' hasn\u2019t'} picked a card yet.
                        Reveal anyway?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmReveal(false)}>Wait</Button>
                    <Button
                        variant="contained"
                        onClick={() => {
                            setConfirmReveal(false);
                            onReveal();
                        }}
                    >
                        Reveal anyway
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Join QR dialog */}
            <Dialog open={joinOpen} onClose={() => setJoinOpen(false)}>
                <DialogTitle>Join the session</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, pt: 1 }}>
                        <Box sx={{ p: 2, borderRadius: 2, background: 'white' }}>
                            <QRCodeSVG value={joinUrl} size={180} />
                        </Box>
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
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setJoinOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Discard / end session warning */}
            <Dialog open={!!pendingAction} onClose={() => setPendingAction(null)}>
                <DialogTitle>{pendingAction === 'goHome' ? 'End session?' : 'Picks will be lost'}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {pendingAction === 'goHome'
                            ? `This will end the session and disconnect all ${players.length} player${players.length !== 1 ? 's' : ''}.`
                            : `${activeCount} player${activeCount !== 1 ? 's have' : ' has'} already picked a card. This will reset the round.`}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPendingAction(null)}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={() => {
                            if (pendingAction === 'goHome') {
                                onGoHome();
                            } else if (pendingAction === 'startNew') {
                                onStartNew();
                                setSelectedCards(new Set());
                            } else {
                                openConfigDialog();
                            }
                            setPendingAction(null);
                        }}
                    >
                        {pendingAction === 'goHome' ? 'End session' : 'Continue anyway'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Configure deck dialog */}
            <Dialog open={configOpen} onClose={() => setConfigOpen(false)}>
                <DialogTitle>Configure deck</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        Select the cards for the next round. Changes apply immediately.
                    </DialogContentText>
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4, auto)',
                            gap: 1.5,
                            justifyContent: 'start',
                        }}
                    >
                        {FIBONACCI_CARDS.map((card) => (
                            <Chip
                                key={card}
                                label={card}
                                onClick={() => toggleDialogCard(card)}
                                variant="filled"
                                sx={{
                                    fontSize: '1rem',
                                    fontWeight: 700,
                                    height: 40,
                                    minWidth: 52,
                                    border: '1px solid',
                                    borderColor: dialogCards.has(card) ? 'primary.main' : 'text.secondary',
                                    bgcolor: dialogCards.has(card) ? 'primary.main' : 'transparent',
                                    color: dialogCards.has(card) ? 'primary.contrastText' : 'text.secondary',
                                    '&:hover': {
                                        bgcolor: dialogCards.has(card) ? 'primary.dark' : 'rgba(255,255,255,0.06)',
                                    },
                                }}
                            />
                        ))}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfigOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleApplyConfig}>
                        Apply &amp; re-estimate
                    </Button>
                </DialogActions>
            </Dialog>
        </HostLayout>
    );
};

export default HostEstimation;
