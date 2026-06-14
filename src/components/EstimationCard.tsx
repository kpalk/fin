import { Box, Typography } from '@mui/material';
import { keyframes } from '@mui/system';
import type { CardValue } from '../types';

const sparkle = keyframes`
  0%   { box-shadow: 0 0 0px 0px rgba(108,99,255,0); }
  25%  { box-shadow: 0 0 20px 8px rgba(108,99,255,0.6), 0 0 40px 12px rgba(72,176,247,0.3); }
  50%  { box-shadow: 0 0 30px 12px rgba(67,217,178,0.5), 0 0 60px 20px rgba(108,99,255,0.2); }
  75%  { box-shadow: 0 0 20px 8px rgba(247,201,72,0.5), 0 0 40px 12px rgba(247,123,67,0.3); }
  100% { box-shadow: 0 0 0px 0px rgba(108,99,255,0); }
`;

const flipIn = keyframes`
  from { transform: rotateY(90deg); opacity: 0; }
  to   { transform: rotateY(0deg);  opacity: 1; }
`;

export type CardVariant = 'player' | 'center' | 'joiner';

interface EstimationCardProps {
    value?: CardValue;
    name?: string;
    faceDown?: boolean;
    active?: boolean; // player has picked (but still face-down on host)
    selected?: boolean; // host has selected this card post-reveal
    accepted?: boolean; // accepted estimate — sparkles
    disabled?: boolean;
    onClick?: () => void;
    variant?: CardVariant;
    /** Override card dimensions (joiner responsive sizing) */
    cardW?: number;
    cardH?: number;
}

const SIZE = {
    player: { w: 108, h: 156, fontSize: '2.1rem', nameSize: '1rem' },
    center: { w: 140, h: 200, fontSize: '3rem', nameSize: '0' },
    joiner: { w: 68, h: 98, fontSize: '1.4rem', nameSize: '0' },
};

const EstimationCard = ({
    value,
    name,
    faceDown = false,
    active = false,
    selected = false,
    accepted = false,
    disabled = false,
    onClick,
    variant = 'player',
    cardW,
    cardH,
}: EstimationCardProps) => {
    const s = SIZE[variant];
    const w = cardW ?? s.w;
    const h = cardH ?? s.h;
    const fontSize = cardW ? `${(1.4 * cardW / 68).toFixed(2)}rem` : s.fontSize;

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
            <Box
                onClick={!disabled ? onClick : undefined}
                sx={{
                    width: w,
                    height: h,
                    borderRadius: 1,
                    cursor: disabled ? 'default' : onClick ? 'pointer' : 'default',
                    position: 'relative',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                    animation: !faceDown ? `${flipIn} 0.35s ease both` : undefined,
                    ...(accepted && {
                        animation: `${sparkle} 1.6s ease infinite`,
                    }),
                    '&:hover':
                        !disabled && onClick
                            ? {
                                  transform: 'translateY(-4px)',
                              }
                            : {},
                    background: faceDown
                        ? 'linear-gradient(135deg, #6C63FF 0%, #48B0F7 100%)'
                        : selected
                          ? 'linear-gradient(135deg, #6C63FF 0%, #43D9B2 100%)'
                          : 'background.paper',
                    border: selected ? '2px solid transparent' : active && faceDown ? '2px solid #43D9B2' : '2px solid',
                    borderColor: faceDown ? 'transparent' : selected ? 'transparent' : 'divider',
                    boxShadow: selected
                        ? '0 4px 20px rgba(108,99,255,0.4)'
                        : active && faceDown
                          ? '0 4px 16px rgba(67,217,178,0.4)'
                          : 2,
                    opacity: disabled && !active && faceDown ? 0.45 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                {/* Inner card frame */}
                <Box
                    sx={{
                        position: 'absolute',
                        inset: 3,
                        border: '1.5px solid',
                        borderColor: faceDown ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.06)',
                        borderRadius: 1,
                        pointerEvents: 'none',
                    }}
                />
                {faceDown ? (
                    <svg width={w * 0.55} height={w * 0.55} viewBox="0 0 100 100" fill="none">
                        <path
                            d="M18 90 L26 16 C28 6, 40 4, 56 20 C68 34, 76 60, 82 90 C70 86, 55 84, 40 85 Z"
                            fill="rgba(255,255,255,0.28)"
                        />
                    </svg>
                ) : (
                    <Typography
                        sx={{
                            fontSize: fontSize,
                            fontWeight: 800,
                            color: selected ? 'white' : 'text.primary',
                            lineHeight: 1,
                        }}
                    >
                        {value ?? '?'}
                    </Typography>
                )}
            </Box>
            {name && (
                <Typography
                    variant="caption"
                    sx={{
                        fontSize: s.nameSize !== '0' ? s.nameSize : undefined,
                        color: 'text.secondary',
                        maxWidth: w,
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textAlign: 'center',
                    }}
                >
                    {name}
                </Typography>
            )}
        </Box>
    );
};

export default EstimationCard;
