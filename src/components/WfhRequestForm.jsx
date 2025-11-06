import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import SectionWrap from './SectionWrap';
import styles from '../styles/WfhRequestForm.module.css';

const WfhRequestForm = ({ onSubmitted }) => {
  const [type, setType] = useState('wfh');
  const [date, setDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [message, setMessage] = useState(null);
  const { token, user } = useSelector(state => state.auth);
  const [approved, setApproved] = useState([]);
  const [pending, setPending] = useState([]);
  const [blocked, setBlocked] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const url = `${import.meta.env.VITE_BASE_URL}/api/wfh/request`;
  const approvedUrl = `${import.meta.env.VITE_BASE_URL}/api/wfh/approved`;
  const pendingUrl = `${import.meta.env.VITE_BASE_URL}/api/wfh/approvals`;

  useEffect(() => {
    if (type === 'sick' && Array.isArray(date)) {
      const diff = (new Date(date[1]) - new Date(date[0])) / (1000 * 60 * 60 * 24) + 1;
      if (diff > 2) {
        setMessage('📩 If your sick leave is longer than 2 days, please send a medical certificate to hr@digithaigroup.com');
      }
    }
  }, [type, date]);

  // Fetch approved and pending requests to check user's weekly limit client-side
  useEffect(() => {
    const fetchExisting = async () => {
      try {
        const [approvedRes, pendingRes] = await Promise.all([
          axios.get(approvedUrl, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(pendingUrl, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setApproved(approvedRes.data || []);
        setPending(pendingRes.data || []);
      } catch (e) {
        // leave approved empty on error; server will still enforce limit
      }
    };
    if (token) fetchExisting();
  }, [approvedUrl, pendingUrl, token, date]);

  const getWeekBounds = (d) => {
    const dt = new Date(d);
    // Week starts Monday (1) and ends Sunday (0)
    const day = dt.getDay();
    const diffToMonday = (day === 0 ? -6 : 1) - day; // how many days to add to reach Monday
    const start = new Date(dt);
    start.setDate(dt.getDate() + diffToMonday);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  };

  useEffect(() => {
    if (type === 'wfh' && user && date) {
      const { start, end } = getWeekBounds(date);
      const userId = user._id || user.id;
      const maxDays = user.wfhWeekly || 1;
      const approvedCount = approved.filter((r) => {
        if (!r || !r.user) return false;
        const rid = r.user._id || r.user.id;
        if (rid !== userId) return false;
        const rd = new Date(r.date);
        return rd >= start && rd <= end && String(r.type).toLowerCase() === 'wfh';
      }).length;

      const sameDay = (r) => {
        if (!r || !r.user) return false;
        const rid = r.user._id || r.user.id;
        if (rid !== userId) return false;
        const rd = new Date(r.date);
        const rdStr = new Date(rd.getTime() - rd.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
        return rdStr === date && String(r.type).toLowerCase() === 'wfh';
      };

      const hasApprovedSameDay = approved.some(sameDay);
      const hasPendingSameDay = pending.some(sameDay);

      const limitBlocked = approvedCount >= maxDays;
      const dateBlocked = hasApprovedSameDay || hasPendingSameDay;

      setBlocked(limitBlocked || dateBlocked);

      if (dateBlocked) {
        const status = hasApprovedSameDay ? 'approved' : 'pending';
        setMessage(`You already have a ${status} WFH request on this date.`);
      } else if (limitBlocked) {
        setMessage(`You have reached your weekly WFH approved limit (${maxDays}). Approved this week: ${countsForWeek.approved}.`);
      } else {
        setMessage(null);
      }
    } else {
      setBlocked(false);
    }
  }, [type, user, date, approved, pending]);

  const countsForWeek = (() => {
    if (!user || !date) return { approved: 0, pending: 0, all: 0 };
    const { start, end } = getWeekBounds(date);
    const userId = user._id || user.id;
    const inWeekForUser = (r) => {
      if (!r || !r.user) return false;
      const rid = r.user._id || r.user.id;
      if (rid !== userId) return false;
      const rd = new Date(r.date);
      return rd >= start && rd <= end && String(r.type).toLowerCase() === 'wfh';
    };
    const a = approved.filter(inWeekForUser).length;
    const p = pending.filter(inWeekForUser).length;
    return { approved: a, pending: p, all: a + p };
  })();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    // Client-side check for weekly WFH limit (server also enforces)
    if (type === 'wfh' && user && date) {
      const { start, end } = getWeekBounds(date);
      const userId = user._id || user.id;
      const maxDays = user.wfhWeekly || 1;
      const approvedOnly = approved.filter((r) => {
        if (!r || !r.user) return false;
        const rid = r.user._id || r.user.id;
        if (rid !== userId) return false;
        const rd = new Date(r.date);
        return rd >= start && rd <= end && String(r.type).toLowerCase() === 'wfh';
      }).length;
      if (approvedOnly >= maxDays) {
        setMessage(`You have reached your weekly WFH approved limit (${maxDays}). Approved this week: ${countsForWeek.approved}.`);
        setSubmitting(false);
        return;
      }

      try {
        const [approvedRes, pendingRes] = await Promise.all([
          axios.get(approvedUrl, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(pendingUrl, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const latestApproved = approvedRes.data || [];
        const latestPending = pendingRes.data || [];
        const sameDay = (r) => {
          if (!r || !r.user) return false;
          const rid = r.user._id || r.user.id;
          if (rid !== userId) return false;
          const rd = new Date(r.date);
          const rdStr = new Date(rd.getTime() - rd.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
          return rdStr === date && String(r.type).toLowerCase() === 'wfh';
        };
        const hasApprovedSameDay = latestApproved.some(sameDay);
        const hasPendingSameDay = latestPending.some(sameDay);
        if (hasApprovedSameDay || hasPendingSameDay) {
          const status = hasApprovedSameDay ? 'approved' : 'pending';
          setMessage(`You already have a ${status} WFH request on this date.`);
          setSubmitting(false);
          return;
        }
      } catch (_) {
      }
    }
    try {
      const payload =
        type === 'timeoff'
          ? { type, startDate, endDate }
          : { type, date };

      const res = await axios.post(url, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage(res.data.message);
      if (typeof onSubmitted === 'function') onSubmitted();
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error submitting request.');
      setSubmitting(false);
    }
  };

  const datePickerBasedOnRequestType = () => {
    if (type === 'wfh' || type === 'sick') {
      return <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />;
    } else {
      return (
        <>
          <span>from</span>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
          <span>to</span>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
        </>
      );
    }
  }

  return (
    <SectionWrap type="request">
      <form className={styles.wfhRequestForm} onSubmit={handleSubmit} >
        <h3>Request WFH</h3>

        <select value={type} onChange={(e) => setType(e.target.value)} >
          <option value="wfh">Work From Home</option>
          {/*<option value="sick">Sick Leave</option>
          <option value="timeoff">Time Off</option> */}
        </select>

        {datePickerBasedOnRequestType()}

        <button type="submit" disabled={blocked || submitting} style={{ backgroundColor: (blocked || submitting) ? '#ccc' : undefined, cursor: (blocked || submitting) ? 'not-allowed' : 'pointer' }}>
          Submit Request
        </button>

        {message && <p >{message}</p>}
      </form>
    </SectionWrap>
  );
};

export default WfhRequestForm;
