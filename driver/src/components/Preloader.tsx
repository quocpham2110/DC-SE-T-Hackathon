import React, { useEffect, useState } from 'react';
import { CircularProgress, Typography, Box, Fade } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';

const theme = createTheme({
    palette: {
        primary: {
            main: '#3a86ff', // Bright blue, matching other components
            light: '#e6f0ff',
        },
        background: {
            default: '#f8f9fa',
        },
        text: {
            primary: '#333333',
            secondary: '#6c757d',
        },
    },
    typography: {
        fontFamily: '"Segoe UI", "Roboto", "Helvetica", sans-serif',
        h4: {
            fontWeight: 600,
        },
    },
});

const Preloader: React.FC = () => {
    const [loadingMessage, setLoadingMessage] = useState('Loading App...');
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Simulate loading progress
        const timer = setInterval(() => {
            setProgress((prevProgress) => {
                const newProgress = prevProgress + 5;

                // Update loading message based on progress
                if (newProgress === 30) {
                    setLoadingMessage('Connecting to server...');
                } else if (newProgress === 60) {
                    setLoadingMessage('Preparing your dashboard...');
                } else if (newProgress === 85) {
                    setLoadingMessage('Almost ready...');
                }

                return newProgress >= 100 ? 100 : newProgress;
            });
        }, 150);

        return () => {
            clearInterval(timer);
        };
    }, []);

    return (
        <ThemeProvider theme={theme}>
            <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center z-50"
                style={{
                    background: 'linear-gradient(135deg, #e6f0ff 0%, #f2f7ff 100%)'
                }}>
                <Fade in={true} timeout={800}>
                    <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        sx={{
                            textAlign: 'center',
                            p: 3
                        }}
                    >
                        <Box
                            sx={{
                                position: 'relative',
                                mb: 4,
                                height: 120,
                                width: 120,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                        >
                            <CircularProgress
                                variant="determinate"
                                value={progress}
                                size={120}
                                thickness={3}
                                sx={{
                                    color: theme.palette.primary.main,
                                    position: 'absolute'
                                }}
                            />

                            <DirectionsBusIcon
                                sx={{
                                    fontSize: 60,
                                    color: theme.palette.primary.main,
                                    animation: 'pulse 2s infinite ease-in-out'
                                }}
                            />
                        </Box>

                        <Box sx={{ mb: 1 }}>
                            <Typography variant="h4" color="primary" fontWeight="bold" gutterBottom>
                                Bus Buddy
                            </Typography>
                            <Typography variant="h6" color="textSecondary">
                                Driver Portal
                            </Typography>
                        </Box>

                        <Typography
                            variant="body1"
                            color="textSecondary"
                            sx={{ mt: 2 }}
                        >
                            {loadingMessage}
                        </Typography>

                        <Typography
                            variant="caption"
                            color="textSecondary"
                            sx={{
                                position: 'absolute',
                                bottom: 24,
                                opacity: 0.7
                            }}
                        >
                            © 2025 Bus Buddy Transport System
                        </Typography>
                    </Box>
                </Fade>

                <style jsx global>{`
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
        `}</style>
            </div>
        </ThemeProvider>
    );
};

export default Preloader;