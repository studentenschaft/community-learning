import React from "react";
import { login, logout, getAccessToken } from "./auth/authService";

function App() {
    const handleLogin = async () => {
        try {
            await login();
            alert("Login successful");
        } catch (error) {
            alert("Login failed");
        }
    };

    const handleLogout = () => {
        logout();
        alert("Logged out");
    };

    const handleGetAccessToken = async () => {
        try {
            const token = await getAccessToken();
            alert(`Access token: ${token}`);
        } catch (error) {
            alert("Failed to get access token");
        }
    };

    return (
        <div className="App">
            <button onClick={handleLogin}>Login</button>
            <button onClick={handleLogout}>Logout</button>
            <button onClick={handleGetAccessToken}>Get Access Token</button>
        </div>
    );
}

export default App;
