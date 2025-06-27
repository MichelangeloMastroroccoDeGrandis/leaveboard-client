import SideBar from "./SideBar";
import Navbar from "./Navbar";
import { useLocation } from "react-router-dom";
import styles from '../styles/Dashboard.module.css'; 
import {isMobile } from 'react-device-detect';

const Wrapper = ({ children }) => {

const isInLoginPage = useLocation().pathname === '/login';

if(isMobile) {
  return (
    <main className={isMobile ? styles.dashboardMobile : styles.dashboard}>
    <SideBar className={isMobile ? styles.sideBarMobile : styles.sideBar} />
    <div className={isMobile ? styles.mainContentMobile : styles.mainContent}>
    {!isInLoginPage && <Navbar />}
        {children}
    </div>
    </main>
  );
} else {
  return(
  <>
  {!isInLoginPage && <Navbar />}
  <main className={isMobile ? styles.dashboardMobile : styles.dashboard}>
    <SideBar className={isMobile ? styles.sideBarMobile : styles.sideBar} />
    <div className={isMobile ? styles.mainContentMobile : styles.mainContent}>
        {children}
    </div>
    </main>
  </>
  )
}
} 

export default Wrapper;