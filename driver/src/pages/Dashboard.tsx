import React, { useState, useEffect } from 'react';
import {
    Button, Typography, Box, Snackbar, CircularProgress, Alert, Grid,
    AppBar, Toolbar, Avatar, Paper, Chip, Divider
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import PersonIcon from '@mui/icons-material/Person';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import LogoutIcon from '@mui/icons-material/Logout';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

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
            main: '#d00000', // Red for logout/inactive
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
        MuiPaper: {
            styleOverrides: {
                root: {
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                },
            },
        },
    },
});

interface DashboardProps {
    apiKey: string;
    vehicleId: string;
    driverName: string;
    onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ apiKey, vehicleId, driverName, onLogout }) => {
    const [isActive, setIsActive] = useState<boolean>(false);
    const [loadingStatusUpdate, setLoadingStatusUpdate] = useState(false);
    const [statusUpdateError, setStatusUpdateError] = useState<string | null>(null);
    const [currentTime, setCurrentTime] = useState<string>('');
    const [currentDate, setCurrentDate] = useState<string>('');

    // Update time every minute
    useEffect(() => {
        const updateDateTime = () => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
            setCurrentDate(now.toLocaleDateString([], { month: 'long', day: 'numeric' }));
        };

        updateDateTime();
        const interval = setInterval(updateDateTime, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Fetch initial status from API on dashboard load
        const fetchStatus = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/v1/passenger/status?vehicle_id=${vehicleId}`, {
                    headers: {
                        'api-key': apiKey,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setIsActive(!!data.status); // Convert to boolean
                }
            } catch (error) {
                console.error("Failed to fetch initial status:", error);
            }
        };

        fetchStatus();
    }, [apiKey, vehicleId]);

    const toggleActive = async () => {
        setStatusUpdateError(null);
        setLoadingStatusUpdate(true);
        const newStatus = !isActive;

        try {
            const response = await fetch('http://127.0.0.1:8000/api/v1/passanger/update_Status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': apiKey,
                },
                body: JSON.stringify({
                    vehicle_id: vehicleId,
                    status: newStatus,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData?.message || `Status update failed: HTTP ${response.status}`;
                throw new Error(errorMessage);
            }

            setIsActive(newStatus);
        } catch (e: any) {
            setStatusUpdateError(e.message || 'Failed to update status.');
        } finally {
            setLoadingStatusUpdate(false);
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <Box className="min-h-screen bg-slate-50">
                {/* App Bar */}
                <AppBar position="static" elevation={0} color="primary">
                    <Toolbar>
                        <DirectionsBusIcon fontSize="large" sx={{ mr: 2 }} />
                        <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                            Portal
                        </Typography>
                        <Box display="flex" alignItems="center">
                            <Box mr={3} textAlign="right">
                                <Typography variant="body2" color="inherit">
                                    {currentDate}
                                </Typography>
                                <Typography variant="h6" color="inherit" fontWeight="bold">
                                    {currentTime}
                                </Typography>
                            </Box>
                            <Button
                                variant="contained"
                                color="error"
                                startIcon={<LogoutIcon />}
                                onClick={onLogout}
                                size="small"
                                sx={{
                                    bgcolor: 'rgba(255,255,255,0.2)',
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                                }}
                            >
                                Logout
                            </Button>
                        </Box>
                    </Toolbar>
                </AppBar>

                <Box className="p-4 md:p-8">
                    <Grid container spacing={4} justifyContent="center">
                        {/* Driver Info Card */}
                        <Grid item xs={12} md={4}>
                            <Paper elevation={0} sx={{ p: 3, height: '100%', border: '1px solid rgba(0,0,0,0.06)' }}>
                                <Box display="flex" flexDirection="column" alignItems="center" textAlign="center">
                                    <Avatar sx={{ width: 80, height: 80, mb: 2, bgcolor: theme.palette.primary.main }}>
                                        <PersonIcon fontSize="large" />
                                    </Avatar>
                                    <Typography variant="h5" gutterBottom fontWeight="bold">
                                        {driverName || 'Driver'}
                                    </Typography>
                                    <Chip
                                        icon={<DirectionsBusIcon />}
                                        label={`Bus ID: ${vehicleId}`}
                                        variant="outlined"
                                        color="primary"
                                        sx={{ mb: 2 }}
                                    />
                                    <Typography variant="body2" color="textSecondary" paragraph>
                                        On duty status
                                    </Typography>
                                    <Chip
                                        icon={isActive ? <CheckCircleIcon /> : <CancelIcon />}
                                        label={isActive ? 'Active' : 'Inactive'}
                                        color={isActive ? 'success' : 'default'}
                                        sx={{ mb: 1 }}
                                    />
                                </Box>
                            </Paper>
                        </Grid>

                        {/* Status Control Card */}
                        <Grid item xs={12} md={6}>
                            <Paper elevation={0} sx={{ p: 4, border: '1px solid rgba(0,0,0,0.06)' }}>
                                <Typography variant="h5" color="textPrimary" gutterBottom fontWeight="bold">
                                    Driver Controls
                                </Typography>
                                <Divider sx={{ mb: 3 }} />

                                <Box textAlign="center" mb={4}>
                                    <Typography variant="h6" color="textSecondary" gutterBottom>
                                        Set your availability status
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary" paragraph>
                                        Toggle to indicate whether you are currently accepting passengers
                                    </Typography>
                                </Box>

                                <Box display="flex" justifyContent="center" mb={3}>
                                    <Button
                                        variant="contained"
                                        color={isActive ? 'secondary' : 'error'}
                                        size="large"
                                        sx={{
                                            py: 3,
                                            px: 6,
                                            fontSize: '18px',
                                            borderRadius: '50px',
                                            minWidth: '240px',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onClick={toggleActive}
                                        disabled={loadingStatusUpdate}
                                        startIcon={loadingStatusUpdate ? null :
                                            isActive ? <CheckCircleIcon /> : <PowerSettingsNewIcon />
                                        }
                                    >
                                        {loadingStatusUpdate ? (
                                            <CircularProgress size={24} color="inherit" />
                                        ) : (
                                            isActive ? 'On Duty' : 'Off Duty'
                                        )}
                                    </Button>
                                </Box>

                                <Box textAlign="center" sx={{ opacity: 0.8 }}>
                                    <Typography variant="body2" color="textSecondary">
                                        {isActive
                                            ? 'You are visible to passengers and can receive ride requests'
                                            : 'You are not visible to passengers and will not receive ride requests'}
                                    </Typography>
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>
                </Box>

                {statusUpdateError && (
                    <Snackbar open={true} autoHideDuration={6000} onClose={() => setStatusUpdateError(null)}>
                        <Alert severity="error" onClose={() => setStatusUpdateError(null)} variant="filled">
                            {statusUpdateError}
                        </Alert>
                    </Snackbar>
                )}
            </Box>
        </ThemeProvider>
    );
};

export default Dashboard;