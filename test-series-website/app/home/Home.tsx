import React from 'react';
import styles from './style.module.css';
import Login from '../auth/Login';
import Signup from '../auth/Signup';

const Home: React.FC = () => {
    return (
        <div className={styles.homeContainer}>
            <header className={styles.header}>
                <h1>Welcome to Test Series</h1>
                <p>Your one-stop solution for test preparation.</p>
            </header>
            <div className={styles.authContainer}>
                <Login />
                <Signup />
            </div>
        </div>
    );
};

export default Home;