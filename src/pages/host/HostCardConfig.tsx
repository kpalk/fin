import { useState } from 'react';
import { Box, Chip, Typography } from '@mui/material';
import EastRoundedIcon from '@mui/icons-material/EastRounded';
import { FIBONACCI_CARDS, type CardValue } from '../../types';
import HostLayout from '../../layouts/HostLayout';
import FinButton from '../../components/FinButton';

interface HostCardConfigProps {
    onBegin: (cards: CardValue[]) => void;
}

const HostCardConfig = ({ onBegin }: HostCardConfigProps) => {
    const [selected, setSelected] = useState<Set<CardValue>>(new Set(FIBONACCI_CARDS));

    const toggle = (card: CardValue) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(card)) {
                if (next.size > 2) next.delete(card);
            } else {
                next.add(card);
            }
            return next;
        });
    };

    const orderedSelected = FIBONACCI_CARDS.filter((c) => selected.has(c));

    return (
        <HostLayout>
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
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight={700} gutterBottom>
                        Configure your deck
                    </Typography>
                    <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ display: 'flex', justifyContent: 'center', columnGap: 0.5, flexWrap: 'wrap' }}
                    >
                        <span>Toggle off any cards you don't need.</span>
                        <span>All are on by default.</span>
                    </Typography>
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, auto)', gap: 1.5 }}>
                    {FIBONACCI_CARDS.map((card) => (
                        <Chip
                            key={card}
                            label={card}
                            onClick={() => toggle(card)}
                            variant="filled"
                            sx={{
                                fontSize: '1.1rem',
                                fontWeight: 700,
                                px: 1,
                                height: 44,
                                minWidth: 56,
                                transition: 'background 0.15s ease, color 0.15s ease',
                                border: '1px solid',
                                borderColor: selected.has(card) ? 'primary.main' : 'text.secondary',
                                bgcolor: selected.has(card) ? 'primary.main' : 'transparent',
                                color: selected.has(card) ? 'primary.contrastText' : 'text.secondary',
                                '&:hover': {
                                    bgcolor: selected.has(card) ? 'primary.dark' : 'rgba(255,255,255,0.06)',
                                },
                            }}
                        />
                    ))}
                </Box>

                <FinButton
                    variant="contained"
                    onClick={() => onBegin(orderedSelected)}
                    endIcon={<EastRoundedIcon />}
                    sx={{ px: 3 }}
                >
                    Start session
                </FinButton>
            </Box>
        </HostLayout>
    );
};

export default HostCardConfig;
