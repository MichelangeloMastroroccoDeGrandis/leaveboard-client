import { useSelector } from 'react-redux';
import AdminPage from './AdminPage';
import ApproverPage from './ApproverPage';
import UserPage from './UserPage';
import Wrapper from '../components/Wrapper';



const Dashboard = () => {
    const { user } = useSelector((state) => state.auth);  

  return (
    <Wrapper>

        {/* Role-Based Display */}
        {user.role === 'admin' && (
            <AdminPage />
        )}

        {user.role === 'approver' && (
            <ApproverPage />
        )}

        {user.role === 'user' && (
            <UserPage />
        )}

    </Wrapper>
  );
};

export default Dashboard;
