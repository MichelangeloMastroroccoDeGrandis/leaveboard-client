import { useState } from 'react';
import { FaBars } from 'react-icons/fa';
import { useSelector, useDispatch } from "react-redux";
import { Link, useLocation } from 'react-router-dom';
import styles from '../styles/Sidebar.module.css';
import { isMobile } from 'react-device-detect';
import { logout } from '../features/auth/authSlice';


const SideBar = () => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();


  const handleLogout = () => {
      dispatch(logout());
    };

  const toggleSidebar = () => setIsOpen(prev => !prev);

  const closeSidebar = () => {
    if (isMobile) setIsOpen(false);
  };

  return (
    <>
    {isMobile && (
        <button onClick={toggleSidebar} className={styles.hamburger}>
          <FaBars />
        </button>
      )}

      <div className={isMobile ? `${styles.sidebarMobile} ${isOpen ? styles.open : styles.closed}` : `${styles.sidebar}`}>
        {!isMobile && <h2 className={styles.title}>WFH DIGITHAI</h2>}

        {user.role === 'admin' && (
          <ul className={styles.sidebarList}>
            <li><Link to="/" onClick={closeSidebar} className={`${styles.link} ${location.pathname === '/' ? styles.active : ''}`}>Dashboard</Link></li>
            <li><Link to="/approvals" onClick={closeSidebar} className={`${styles.link} ${location.pathname === '/approvals' ? styles.active : ''}`}>Approvals</Link></li>
            <li><Link to="/team" onClick={closeSidebar} className={`${styles.link} ${location.pathname === '/team' ? styles.active : ''}`}>Team</Link></li>
            <li><a className={styles.logout} onClick={handleLogout} >Logout</a></li>
          </ul>
        )}

        {user.role === 'approver' && (
          <ul className={styles.sidebarList}>
            <li><Link to="/" onClick={closeSidebar} className={`${styles.link} ${location.pathname === '/' ? styles.active : ''}`}>Dashboard</Link></li>
            <li><Link to="/approvals" onClick={closeSidebar} className={`${styles.link} ${location.pathname === '/approvals' ? styles.active : ''}`}>Approvals</Link></li>
             <li><a className={styles.logout} onClick={handleLogout} >Logout</a></li>
          </ul>
        )}

        {user.role === 'user' && (
          <ul className={styles.sidebarList}>
            <li><Link to="/" onClick={closeSidebar} className={`${styles.link} ${location.pathname === '/' ? styles.active : ''}`}>Dashboard</Link></li>
             <li><a className={styles.logout} onClick={handleLogout} >Logout</a></li>
          </ul>
        )}
      </div>
    </>
  );
};

export default SideBar;
