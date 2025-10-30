import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchApprovedRequests } from '../app/approvalsSlice';
import ApprovedCard from './ApprovedCard';
import axios from 'axios';
import UserCalendar from './UserCalendar';
import styles from '../styles/ApprovedWfhList.module.css';

const API = `${import.meta.env.VITE_BASE_URL}/api/wfh`;

// Example values
const formatDateLocal = (date) => {
  const d = new Date(date);
  return d.getFullYear() + '-' +
         String(d.getMonth() + 1).padStart(2, '0') + '-' +
         String(d.getDate()).padStart(2, '0');
};

const ApprovedWfhList = () => {
  const dispatch = useDispatch();
  const { approvedRequests, loading, error } = useSelector((state) => state.approvals);

  const user = useSelector((state) => state.auth.user);

  const [requests, setRequests] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    dispatch(fetchApprovedRequests());
  }, [dispatch]);

  useEffect(() => {
    setRequests(approvedRequests);
  }, [approvedRequests]);

  // Unified handleDelete for approved requests
  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/approved/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(requests.filter((r) => r._id !== id));
      // Optionally refresh redux list as source of truth
      dispatch(fetchApprovedRequests());
    } catch (err) {
      console.error('Error deleting request:', err.response?.data || err.message);
      alert(err.response?.data?.message || 'Failed to delete request.');
    }
  };

  // Handle date change
  const handleDateChanged = (updatedRequest) => {
    // Remove from local list so the card disappears immediately
    setRequests(requests.filter((r) => r._id !== updatedRequest._id));
    // Optionally re-fetch list for consistency
    dispatch(fetchApprovedRequests());
  };

const today = formatDateLocal(new Date());

  return (
    <div>
      <UserCalendar key={refreshKey} />
      <h2>Approved WFH Requests</h2>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && approvedRequests.length === 0 && <p>No approved requests found.</p>}

      <ul className={styles.approvedWfhList}>
        {requests.map((r, i) => {
          if(formatDateLocal(requests[i].date) > today) {
            
            if(requests[i].user.role === user.role) {
              return null;
            } else {
            return (
              <ApprovedCard
                key={r._id}
                request={r}
                onDeleted={handleDelete}
                onDateChanged={handleDateChanged}
                onCalendarRefresh={() => setRefreshKey((k) => k + 1)}
              />
            );
            }
          } else {
            return null;
          }
        })}
      </ul>
    </div>
  );
};

export default ApprovedWfhList;
