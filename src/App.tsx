import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { FIBONACCI_CARDS, type CardValue } from './types';
import { useHostPeer, useJoinerPeer } from './hooks/usePeer';
import FinLogo from './components/FinLogo';
import FinButton from './components/FinButton';

// Host pages
import HostCardConfig from './pages/host/HostCardConfig';
import HostLobby from './pages/host/HostLobby';
import HostEstimation from './pages/host/HostEstimation';

// Joiner pages
import JoinerEntry from './pages/joiner/JoinerEntry';
import JoinerWaiting from './pages/joiner/JoinerWaiting';
import JoinerCards from './pages/joiner/JoinerCards';

// ─── HOST FLOW ────────────────────────────────────────────────────────────────

const HostApp = ({ onGoHome }: { onGoHome: () => void }) => {
    const [screen, setScreen] = useState<'config' | 'lobby' | 'estimation'>('config');
    const [configuredCards, setConfiguredCards] = useState<CardValue[]>([...FIBONACCI_CARDS]);
    const { peerId, state, lastEmote, beginEstimation, reveal, acceptEstimate, reEstimate, startNewEstimate } =
        useHostPeer();

    const handleBeginSession = (cards: CardValue[]) => {
        setConfiguredCards(cards);
        setScreen('lobby');
    };

    const handleBeginEstimation = () => {
        beginEstimation(configuredCards);
        setScreen('estimation');
    };

    if (screen === 'config') {
        return <HostCardConfig onBegin={handleBeginSession} />;
    }

    if (screen === 'lobby') {
        return (
            <HostLobby
                peerId={peerId ?? '…'}
                players={state.players}
                onBegin={handleBeginEstimation}
                onGoHome={onGoHome}
            />
        );
    }

    return (
        <HostEstimation
            state={state}
            peerId={peerId ?? ''}
            lastEmote={lastEmote}
            onReveal={reveal}
            onAcceptEstimate={acceptEstimate}
            onReEstimate={reEstimate}
            onStartNew={() => startNewEstimate(configuredCards)}
            onReconfigure={(cards) => {
                setConfiguredCards(cards);
                reEstimate(cards);
            }}
            onGoHome={onGoHome}
        />
    );
};

// ─── JOINER FLOW ──────────────────────────────────────────────────────────────

const JoinerApp = ({ hostId }: { hostId: string }) => {
    const {
        connected,
        gameState,
        myId,
        nameTaken,
        sessionNotFound,
        hostLeft,
        join,
        pickCard,
        deselectCard,
        sendEmote,
    } = useJoinerPeer(hostId);

    if (sessionNotFound) {
        return (
            <Box
                sx={{
                    minHeight: '100dvh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 4,
                    gap: 3,
                    textAlign: 'center',
                }}
            >
                <FinLogo size={48} sx={{ color: 'text.disabled' }} />
                <Box>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                        Session not found
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ display: 'flex', justifyContent: 'center', columnGap: 0.5, flexWrap: 'wrap' }}
                    >
                        <span>This session no longer exists.</span>
                        <span>Ask the host for a new link.</span>
                    </Typography>
                </Box>
            </Box>
        );
    }

    if (hostLeft) {
        return (
            <Box
                sx={{
                    minHeight: '100dvh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 4,
                    gap: 3,
                    textAlign: 'center',
                }}
            >
                <FinLogo size={48} sx={{ color: 'text.disabled' }} />
                <Box>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                        Session ended
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        The host disconnected.
                    </Typography>
                </Box>
                <FinButton variant="contained" onClick={() => window.location.replace(import.meta.env.BASE_URL)}>
                    Fin
                </FinButton>
            </Box>
        );
    }

    const accepted = !!myId && !!gameState?.players.find((p) => p.id === myId);

    if (!accepted || nameTaken) {
        return <JoinerEntry connected={connected} onJoin={join} nameTaken={nameTaken} />;
    }

    if (!gameState || gameState.phase === 'lobby') {
        return <JoinerWaiting players={gameState?.players ?? []} myId={myId} />;
    }

    return (
        <JoinerCards
            state={gameState}
            myId={myId ?? ''}
            onPickCard={pickCard}
            onDeselectCard={deselectCard}
            onSendEmote={sendEmote}
        />
    );
};

// ─── ROOT ─────────────────────────────────────────────────────────────────────

const App = () => {
    const [searchParams] = useSearchParams();
    const [resetKey, setResetKey] = useState(0);
    const hostId = searchParams.get('join');

    if (hostId) {
        return <JoinerApp hostId={hostId} />;
    }

    return <HostApp key={resetKey} onGoHome={() => setResetKey((k) => k + 1)} />;
};

export default App;
