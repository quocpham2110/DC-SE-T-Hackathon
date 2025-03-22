import React, { useState } from 'react';
import {
    TextField, Button, Snackbar, Alert, CircularProgress, Box, Paper,
    Typography, InputAdornment, Card, Divider
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import KeyIcon from '@mui/icons-material/Key';
import BadgeIcon from '@mui/icons-material/Badge';
import VpnKeyIcon from '@mui/icons-material/VpnKey';

const theme = createTheme({
    palette: {
        primary: {
            main: '#3a86ff', // Bright blue, more visible
            light: '#e6f0ff', // Light blue for backgrounds
        },
        secondary: {
            main: '#38b000', // Green for active status
        },
        error: {
            main: '#d00000', // Red for errors
        },
        background: {
            default: '#f8f9fa',
            paper: '#ffffff',
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
        button: {
            fontWeight: 500,
            textTransform: 'none', // More readable button text
        },
    },
    shape: {
        borderRadius: 12, // Softer corners
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    },
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 8,
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                },
            },
        },
    },
});

interface LoginProps {
    onLogin: (apiKey: string, vehicleId: string, driverName: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [apiKey, setApiKey] = useState('');
    const [vehicleId, setVehicleId] = useState('');
    const [driverName, setDriverName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);
        setLoading(true);

        if (!apiKey.trim() || !vehicleId.trim()) {
            setError('API Key and Vehicle ID are required');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('http://127.0.0.1:8000/api/v1/passanger/update_Status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': apiKey
                },
                body: JSON.stringify({
                    vehicle_id: vehicleId,
                    status: true
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData?.message || `Login failed: HTTP ${response.status}`;
                throw new Error(errorMessage);
            }

            // If login is successful
            onLogin(apiKey, vehicleId, driverName);
        } catch (e: any) {
            setError(e.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <Box
                className="min-h-screen flex flex-col justify-center items-center"
                sx={{
                    background: 'linear-gradient(135deg, #e6f0ff 0%, #f2f7ff 100%)',
                    p: 2
                }}
            >
                <Box sx={{ maxWidth: 450, width: '100%', mb: 4, textAlign: 'center' }}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 2
                        }}
                    >
                        <DirectionsBusIcon
                            sx={{
                                fontSize: 60,
                                color: theme.palette.primary.main,
                                mr: 2
                            }}
                        />
                        <Typography
                            variant="h3"
                            component="h1"
                            sx={{
                                fontWeight: 'bold',
                                color: theme.palette.primary.main
                            }}
                        >
                            Bus Buddy
                        </Typography>
                    </Box>
                    <Typography variant="h5" sx={{ color: theme.palette.text.secondary }}>
                        Driver Portal
                    </Typography>
                </Box>

                <Card
                    elevation={0}
                    sx={{
                        maxWidth: 450,
                        width: '100%',
                        borderRadius: 4,
                        border: '1px solid rgba(0,0,0,0.08)'
                    }}
                >
                    <Box sx={{ p: 4, pb: 1 }}>
                        <Typography variant="h5" fontWeight="bold" align="center" gutterBottom>
                            Driver Login
                        </Typography>
                        <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 3 }}>
                            Enter your credentials to access your account
                        </Typography>
                    </Box>

                    <Divider sx={{ mx: 4 }} />

                    <Box sx={{ p: 4 }}>
                        <form onSubmit={handleSubmit}>
                            <TextField
                                label="API Key"
                                variant="outlined"
                                fullWidth
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                required
                                margin="normal"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <VpnKeyIcon color="primary" />
                                        </InputAdornment>
                                    ),
                                }}
                                placeholder="Enter your API key"
                            />

                            <TextField
                                label="Vehicle ID"
                                variant="outlined"
                                fullWidth
                                value={vehicleId}
                                onChange={(e) => setVehicleId(e.target.value)}
                                required
                                margin="normal"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <DirectionsBusIcon color="primary" />
                                        </InputAdornment>
                                    ),
                                }}
                                placeholder="Enter your bus ID"
                            />

                            <TextField
                                label="Driver Name"
                                variant="outlined"
                                fullWidth
                                value={driverName}
                                onChange={(e) => setDriverName(e.target.value)}
                                margin="normal"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <BadgeIcon color="primary" />
                                        </InputAdornment>
                                    ),
                                }}
                                placeholder="Enter your name (optional)"
                            />

                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                size="large"
                                fullWidth
                                disabled={loading}
                                sx={{
                                    mt: 3,
                                    mb: 2,
                                    py: 1.5,
                                    fontSize: '16px',
                                    borderRadius: '8px'
                                }}
                            >
                                {loading ? (
                                    <CircularProgress size={24} color="inherit" />
                                ) : (
                                    'Sign In'
                                )}
                            </Button>
                        </form>
                    </Box>
                </Card>

                <Typography
                    variant="caption"
                    color="textSecondary"
                    sx={{ mt: 3, opacity: 0.7 }}
                >
                    © 2025 Bus Buddy Transport System • Driver Portal v2.1
                </Typography>

                {error && (
                    <Snackbar
                        open={true}
                        autoHideDuration={6000}
                        onClose={() => setError(null)}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                    >
                        <Alert
                            severity="error"
                            onClose={() => setError(null)}
                            variant="filled"
                            sx={{ width: '100%' }}
                        >
                            {error}
                        </Alert>
                    </Snackbar>
                )}
            </Box>
        </ThemeProvider>
    );
};

export default Login;