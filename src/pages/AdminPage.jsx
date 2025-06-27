import WfhRequestForm from '../components/WfhRequestForm';
import UserCalendar from '../components/UserCalendar';
import styles from '../styles/MainPage.module.css';

const AdminPage = () => {
  return (
    <div className={styles.MainPage}>
      <h1>Admin Panel</h1>
      <WfhRequestForm />
      <UserCalendar />
    </div>
  );
};

export default AdminPage;
