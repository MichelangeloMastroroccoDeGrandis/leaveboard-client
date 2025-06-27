import Wrapper from "../components/Wrapper";
import { useEffect } from 'react';
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
  const dispatch = useDispatch();
  const { requests, loading, error } = useSelector((state) => state.approvals);

  useEffect(() => {
    dispatch(fetchPendingRequests());
  }, [dispatch]);

  const handleApprove = (id) => {
    if (window.confirm('Approve this request?')) {
      dispatch(approveRequest(id))
        .unwrap()
        .catch(console.error);
    }
  };

  const handleReject = (id) => {
    const reason = window.prompt('Reason for rejection:');
    if (reason !== null) {
      dispatch(rejectRequest({ id, reason }))
        .unwrap()
        .catch(console.error);
    }
  };

  return (
    <Wrapper>
      <div className={styles.MainPage}>
        <h1>Pending WFH Requests</h1>
        {loading && <p>Loading...</p>}
        {error && <p>{error}</p>}
        {requests.length === 0 && <p>No pending requests.</p>}
        <ul>
          {requests.map((r) => (
            <SectionWrap type="approval" key={r._id}>
              <ApprovalCard
                request={r}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            </SectionWrap>
          ))}
        </ul>
      </div>
    </Wrapper>
  );
};

export default Approvals;
