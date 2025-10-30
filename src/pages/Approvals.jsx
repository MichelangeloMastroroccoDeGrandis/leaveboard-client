import Wrapper from "../components/Wrapper";
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchPendingRequests,
  approveRequest,
  rejectRequest
} from '../app/approvalsSlice';
import SectionWrap from "../components/SectionWrap";
import ApprovalCard from "../components/ApprovalCard";
import styles from '../styles/MainPage.module.css';


const Approvals = () => {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const { requests, loading, error } = useSelector((state) => state.approvals);
  const [list, setList] = useState([]);

  useEffect(() => {
    dispatch(fetchPendingRequests());
  }, [dispatch]);

  useEffect(() => {
    setList(requests);
  }, [requests]);

  const handleApprove = (id) => {
    if (window.confirm('Approve this request?')) {
      // Optimistically remove from UI
      setList((prev) => prev.filter((r) => r._id !== id));
      dispatch(approveRequest(id))
        .unwrap()
        .catch((err) => {
          console.error(err);
          // Restore by refetching if server fails
          dispatch(fetchPendingRequests());
        });
    }
  };

  const handleReject = (id) => {
    const reason = window.prompt('Reason for rejection:');
    if (reason !== null) {
      // Optimistically remove from UI
      setList((prev) => prev.filter((r) => r._id !== id));
      dispatch(rejectRequest({ id, reason }))
        .unwrap()
        .catch((err) => {
          console.error(err);
          // Restore by refetching if server fails
          dispatch(fetchPendingRequests());
        });
    }
  };

  return (
    <Wrapper>
      <div className={styles.MainPage}>
        <h1>Pending WFH Requests</h1>
        {loading && <p>Loading...</p>}
        {error && <p>{error}</p>}
        {list.length === 0 && <p>No pending requests.</p>}
        
        <ul>
          {list.map((r) =>
            r.user.role === user.role ? null : (
              <SectionWrap type="approval" key={r._id}>
                <ApprovalCard
                  request={r}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              </SectionWrap>
            )
          )}
        </ul>
      </div>
    </Wrapper>
  );
};


export default Approvals;
