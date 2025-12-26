import { Link } from 'react-router-dom';
import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <Link to="/" className={styles.navLink}>TOP</Link>
        <Link to="/schedule" className={styles.navLink}>SCHEDULE</Link>
        <Link to="/scenario" className={styles.navLink}>SCENARIO</Link>
        <Link to="/takanashi" className={styles.navLink}>SERVER</Link>
        <Link to="/profile" className={styles.navLink}>PROFILE</Link>
      </nav>
    </header>
  );
}
