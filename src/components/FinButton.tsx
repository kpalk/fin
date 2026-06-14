import { Button, type ButtonProps } from '@mui/material';

/**
 * App-wide action button — defaults to size="large" so all primary actions
 * get consistent height from the theme without per-button overrides.
 */
const FinButton = ({ size = 'large', children, ...props }: ButtonProps) => {
    return (
        <Button size={size} {...props}>
            {children}
        </Button>
    );
};

export default FinButton;
