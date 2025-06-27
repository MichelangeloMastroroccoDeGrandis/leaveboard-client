import WfhRequestForm from '../components/WfhRequestForm';
import UserCalendar from '../components/UserCalendar';
import styles from '../styles/MainPage.module.css';

const ApproverPage = () => {
  return (
    <div className={styles.MainPage}>
      <h1 >Approver Panel</h1>
      <WfhRequestForm />
      <UserCalendar />
    </div>
  );
};

export default ApproverPage;
