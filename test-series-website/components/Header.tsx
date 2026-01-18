import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../app/home/style.module.css';

const Header: React.FC = () => {
    return (
        <header className={styles.header}>
            <h1 className={styles.logo}>Test Series</h1>
            <nav className={styles.nav}>
                <ul>
                    <li>
                        <Link to="/login" className={styles.navLink}>Login</Link>
                    </li>
                    <li>
                        <Link to="/signup" className={styles.navLink}>Sign Up</Link>
                    </li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;