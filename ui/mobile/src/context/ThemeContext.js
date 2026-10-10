import React, { createContext, useContext, useState } from 'react';

const lightColors = {
    background: '#f5f5f5',
    surface: '#ffffff',
    text: '#202125',
    subtext: '#707070',
    primary: '#009de0',
    navBar: '#009de0',
    navBarText: 'rgba(255,255,255,0.7)',
    navBarTextActive: '#ffffff',
    border: '#e0e0e0',
    error: '#cc0000',
    errorBg: '#ffe6e6',
    inputBg: '#ffffff',
    cardShadow: '#000',
    buttonDisabled: '#ccc',
    success: '#27ae60',
};

const darkColors = {
    background: '#121212',
    surface: '#1e1e1e',
    text: '#f0f0f0',
    subtext: '#a0a0a0',
    primary: '#009de0',
    navBar: '#1a1a2e',
    navBarText: 'rgba(255,255,255,0.5)',
    navBarTextActive: '#ffffff',
    border: '#333333',
    error: '#ff6b6b',
    errorBg: '#3d1a1a',
    inputBg: '#2a2a2a',
    cardShadow: '#000',
    buttonDisabled: '#444',
    success: '#2ecc71',
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
    const [isDark, setIsDark] = useState(false); // Always starts in light mode

    const toggleTheme = () => setIsDark(prev => !prev);
    const colors = isDark ? darkColors : lightColors;

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme, colors }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
    return ctx;
}
