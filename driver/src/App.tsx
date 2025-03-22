import React, { useState, useEffect } from 'react';
import Preloader from './components/Preloader';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function App() {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [driverName, setDriverName] = useState<string | null>(null);

  useEffect(() => {
    // Simulate loading delay
    setTimeout(() => {
      setLoading(false);
    }, 1500);

    // Check if already logged in from local storage
    const storedApiKey = localStorage.getItem('apiKey');
    const storedVehicleId = localStorage.getItem('vehicleId');
    const storedDriverName = localStorage.getItem('driverName');

    if (storedApiKey && storedVehicleId && storedDriverName) {
      setApiKey(storedApiKey);
      setVehicleId(storedVehicleId);
      setDriverName(storedDriverName);
      setIsLoggedIn(true);
    }

  }, []);

  const handleLogin = (apiKey: string, vehicleId: string, driverName: string) => {
    localStorage.setItem('apiKey', apiKey);
    localStorage.setItem('vehicleId', vehicleId);
    localStorage.setItem('driverName', driverName);
    setApiKey(apiKey);
    setVehicleId(vehicleId);
    setDriverName(driverName);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    // Clear local storage
    localStorage.removeItem('apiKey');
    localStorage.removeItem('vehicleId');
    localStorage.removeItem('driverName');
    // Reset state
    setApiKey(null);
    setVehicleId(null);
    setDriverName(null);
    setIsLoggedIn(false);
  };

  if (loading) {
    return <Preloader />;
  }

  return (
    <div className="App">
      {isLoggedIn ? (
        <Dashboard
          apiKey={apiKey!}
          vehicleId={vehicleId!}
          driverName={driverName!}
          onLogout={handleLogout} // Pass the logout handler to Dashboard
        />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;