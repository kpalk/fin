import { useEffect, useState } from 'react';

/** Cycles 1 → 2 → 3 → 1 lit dots at 500 ms intervals. */
const AnimatedDots = () => {
    const [count, setCount] = useState(1);

    useEffect(() => {
        const id = setInterval(() => setCount((c) => (c % 3) + 1), 500);
        return () => clearInterval(id);
    }, []);

    return (
        <span aria-hidden>
            {[1, 2, 3].map((i) => (
                <span key={i} style={{ opacity: i <= count ? 1 : 0.15, transition: 'opacity 0.15s' }}>
                    .
                </span>
            ))}
        </span>
    );
};

export default AnimatedDots;
