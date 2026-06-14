import { Box } from '@mui/material';
import { keyframes } from '@mui/system';

const spin = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

// Fibonacci spiral built from quarter-circle arcs
// Each arc's radius follows the Fibonacci sequence: 1, 1, 2, 3, 5, 8, 13
const ARCS = [
    { r: 13, cx: 0, cy: 0, startAngle: 180, color: '#6C63FF', delay: '0s' },
    { r: 8, cx: 13, cy: 0, startAngle: 90, color: '#48B0F7', delay: '0.1s' },
    { r: 5, cx: 13, cy: -8, startAngle: 0, color: '#43D9B2', delay: '0.2s' },
    { r: 3, cx: 8, cy: -8, startAngle: 270, color: '#F7C948', delay: '0.3s' },
    { r: 2, cx: 8, cy: -5, startAngle: 180, color: '#F77B43', delay: '0.4s' },
    { r: 1, cx: 6, cy: -5, startAngle: 90, color: '#F74358', delay: '0.5s' },
];

const arcPath = (cx: number, cy: number, r: number, startAngle: number) => {
    const toRad = (d: number) => (d * Math.PI) / 180;
    const x1 = cx + r * Math.cos(toRad(startAngle));
    const y1 = cy + r * Math.sin(toRad(startAngle));
    const x2 = cx + r * Math.cos(toRad(startAngle + 90));
    const y2 = cy + r * Math.sin(toRad(startAngle + 90));
    return `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`;
};

interface FibonacciLoaderProps {
    size?: number;
}

const FibonacciLoader = ({ size = 80 }: FibonacciLoaderProps) => {
    return (
        <Box
            sx={{
                animation: `${spin} 3s linear infinite`,
                display: 'inline-flex',
            }}
        >
            <svg width={size} height={size} viewBox="-16 -22 34 34" xmlns="http://www.w3.org/2000/svg">
                {ARCS.map((arc, i) => (
                    <path
                        key={i}
                        d={arcPath(arc.cx, arc.cy, arc.r, arc.startAngle)}
                        stroke={arc.color}
                        strokeWidth="1.4"
                        fill="none"
                        strokeLinecap="round"
                        style={{
                            animation: `${fadeIn} 0.4s ease ${arc.delay} both`,
                        }}
                    />
                ))}
            </svg>
        </Box>
    );
};

export default FibonacciLoader;
