/**
 * index.js = Entry point of react side.
 * The code below it taken from '9-UI-React' slideshow, form lecture 8.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);