import { useDispatch, useSelector } from 'react-redux';
import styles from '../styles/Navbar.module.css';
import {isMobile } from 'react-device-detect';


const Navbar = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);


  return (
    <nav className={isMobile ? styles.navbarMobile : styles.navbar}>
        <h2 className={styles.name}>Welcome, {user.name}</h2>
    </nav>
  );
};

export default Navbar;