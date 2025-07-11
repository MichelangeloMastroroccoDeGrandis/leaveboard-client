import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import SectionWrap from './SectionWrap';
import styles from '../styles/WfhRequestForm.module.css';

const WfhRequestForm = () => {
  const [type, setType] = useState('wfh');
  const [date, setDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [message, setMessage] = useState(null);
  const { token } = useSelector(state => state.auth);

  const url = `${import.meta.env.VITE_BASE_URL}/api/wfh/request`;

  useEffect(() => {
  if (type === 'sick' && Array.isArray(date)) {
    const diff = (new Date(date[1]) - new Date(date[0])) / (1000 * 60 * 60 * 24) + 1;
    if (diff > 2) {
      setMessage('📩 If your sick leave is longer than 2 days, please send a medical certificate to hr@digithaigroup.com');
    }
  }
}, [type, date]);

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const payload =
      type === 'timeoff'
        ? { type, startDate, endDate }
        : { type, date };

    const res = await axios.post(url, payload, {
      headers: { Authorization: `Bearer ${token}` }
    });

    setMessage(res.data.message);
  } catch (err) {
    setMessage(err.response?.data?.message || 'Error submitting request.');
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
      <h3>Request Time Off</h3>

      <select value={type} onChange={(e) => setType(e.target.value)} >
        <option value="wfh">Work From Home</option>
        {/*<option value="sick">Sick Leave</option>
        <option value="timeoff">Time Off</option> */}
      </select>


      {datePickerBasedOnRequestType()}

      <button type="submit" >
        Submit Request
      </button>

      {message && <p >{message}</p>}
    </form>
    </SectionWrap>
  );
};

export default WfhRequestForm;
