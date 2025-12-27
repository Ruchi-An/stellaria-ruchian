import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Header.module.css';

export default function Header() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const toggleMenu = () => setOpen((v) => !v);
  const closeMenu = () => setOpen(false);

  return (
    <header className={styles.header}>
      <button
        type="button"
        className={styles.menuButton}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="header-menu"
        onClick={toggleMenu}
      >
        <span className={styles.menuIcon} aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
        </span>
      </button>

      <nav
        id="header-menu"
        className={`${styles.nav} ${open ? styles.navOpen : styles.navClosed}`}
        role="menu"
      >
        <Link to="/" className={styles.navLink} onClick={closeMenu} role="menuitem">TOP</Link>
        <Link to="/schedule" className={styles.navLink} onClick={closeMenu} role="menuitem">SCHEDULE</Link>
        <Link to="/scenario" className={styles.navLink} onClick={closeMenu} role="menuitem">SCENARIO</Link>
        <Link to="/takanashi" className={styles.navLink} onClick={closeMenu} role="menuitem">SERVER</Link>
        <Link to="/profile" className={styles.navLink} onClick={closeMenu} role="menuitem">PROFILE</Link>
      </nav>
    </header>
  );
}
