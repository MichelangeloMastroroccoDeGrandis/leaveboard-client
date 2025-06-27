import WfhRequestForm from '../components/WfhRequestForm';
import UserCalendar from '../components/UserCalendar';
import styles from '../styles/MainPage.module.css';

const UserPage = () => {
  return (
    <div className={styles.MainPage}>
      <h1 >User Panel</h1>
      <WfhRequestForm />
      <UserCalendar />
    </div>
  );
};

export default UserPage;
