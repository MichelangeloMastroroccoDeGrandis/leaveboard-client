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
import { TiWarningOutline } from "react-icons/ti";



const Approvals = () => {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const { requests, loading, error } = useSelector((state) => state.approvals);
  const [list, setList] = useState([]);
  const [positionConflicts, setPositionConflicts] = useState({});

  useEffect(() => {
    dispatch(fetchPendingRequests());
  }, [dispatch]);

  useEffect(() => {
    setList(requests);
  }, [requests]);

  // Track positions where 2 or more users have requested WFH on the same day
  useEffect(() => {
    const conflicts = {};

    // Filter out requests from same-role users (as in rendering logic)
    const visible = (list || []).filter((r) => r?.user && r.user.role !== user.role);

    // Map: position -> { dateStr -> count }
    const byPosDate = {};

    visible.forEach((r) => {
      const pos = r.user.position || 'No position';
      const d = new Date(r.date);
      const dateStr = d.toISOString().slice(0, 10);
      if (!byPosDate[pos]) byPosDate[pos] = {};
      if (!byPosDate[pos][dateStr]) byPosDate[pos][dateStr] = 0;
      byPosDate[pos][dateStr] += 1;
    });

    Object.entries(byPosDate).forEach(([pos, dates]) => {
      const hasConflict = Object.values(dates).some((count) => count >= 2);
      if (hasConflict) {
        conflicts[pos] = true;
      }
    });

    setPositionConflicts(conflicts);
  }, [list, user]);

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

  // Group requests by user.position, excluding same-role requests
  const groupedByPosition = list.reduce((acc, r) => {
    if (!r?.user) return acc;
    if (r.user.role === user.role) return acc;
    const pos = r.user.position || 'No position';
    if (!acc[pos]) acc[pos] = [];
    acc[pos].push(r);
    return acc;
  }, {});

  const positionKeys = Object.keys(groupedByPosition).sort();

  return (
    <Wrapper>
      <div className={styles.MainPage}>
        <h1>Pending WFH Requests</h1>
        {loading && <p>Loading...</p>}
        {error && <p>{error}</p>}
        {!loading && positionKeys.length === 0 && <p>No pending requests.</p>}

        {!loading && positionKeys.length > 0 && (
          positionKeys.map((pos) => (
            <div key={pos} style={{ marginBottom: 24 }}>
              <h2>{pos}</h2>
              {positionConflicts[pos] && (
                <p className={styles.conflict}>
                  <TiWarningOutline />
                  2 or more Users has request wfh on the same day
                </p>
              )}
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {groupedByPosition[pos].map((r) => (
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
          ))
        )}
      </div>
    </Wrapper>
  );
};


export default Approvals;
