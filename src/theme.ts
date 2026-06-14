import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#6C63FF',
        },
        secondary: {
            main: '#43D9B2',
        },
        background: {
            default: '#0F0F1A',
            paper: '#1A1A2E',
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", sans-serif',
        fontWeightBold: 700,
        body1: {
            fontSize: '1.25rem',
        },
        body2: {
            fontSize: '1rem',
        },
    },
    shape: {
        borderRadius: 12,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    fontSize: '0.85rem',
                    padding: '6px 8px',
                },
                sizeSmall: {
                    padding: '4px 5px',
                },
                sizeLarge: {
                    fontSize: '0.95rem',
                    padding: '8px 11px',
                },
            },
        },
        MuiDialogActions: {
            styleOverrides: {
                root: {
                    padding: '8px 24px 16px',
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    fontWeight: 600,
                },
            },
        },
        MuiTooltip: {
            styleOverrides: {
                tooltip: {
                    fontSize: '1rem',
                    maxWidth: 400,
                },
            },
        },
    },
});
