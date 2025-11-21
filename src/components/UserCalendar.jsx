import { useEffect, useState } from 'react';
import styles from '../styles/UserCalendar.module.css';

const UserCalendar = ({ refreshKey = 0 }) => {
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [disallowedWeekdays, setDisallowedWeekdays] = useState([1, 5, 0, 6]); // default: Mon, Fri, weekend
  const token = localStorage.getItem('token');

  // Compute 4 weeks
  const getDates = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // If today is Sunday, skip to tomorrow
  const startDate = today.getDay() === 0 ? new Date(today.setDate(today.getDate() + 1)) : new Date(today);

  const dates = [];
  let currentDate = new Date(startDate);

  let sundayCount = 0;

  while (sundayCount < 4) {
    if (currentDate.getDay() === 0) {
      sundayCount++;
    }
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};

  const dates = getDates();

  const url = `${import.meta.env.VITE_BASE_URL}/api/calendar`;
  const holidaysUrl = `${import.meta.env.VITE_BASE_URL}/api/holidays`;
  const settingsUrl = `${import.meta.env.VITE_BASE_URL}/api/settings/wfh`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [calRes, holRes, settingsRes] = await Promise.all([
          fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(holidaysUrl, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(settingsUrl, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const calData = await calRes.json();
        setUsers(calData.users || []);
        setRequests(calData.requests || []);

        if (holRes.ok) {
          const holData = await holRes.json();
          setHolidays(Array.isArray(holData) ? holData : []);
        } else {
          setHolidays([]);
        }

        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          const serverDisallowed =
            (settingsData && settingsData.disallowedWeekdays && settingsData.disallowedWeekdays.length)
              ? settingsData.disallowedWeekdays
              : [1, 5, 0, 6];
          setDisallowedWeekdays(serverDisallowed.map((n) => Number(n)));
        } else {
          setDisallowedWeekdays([1, 5, 0, 6]);
        }
      } catch (e) {
        setUsers([]);
        setRequests([]);
        setHolidays([]);
        setDisallowedWeekdays([1, 5, 0, 6]);
      }
    };
    if (token) {
      fetchData();
    }
  }, [url, holidaysUrl, token, refreshKey]);

  const formatDate = (d) => d.toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });

  const getCell = (userId, date) => {

    const dayStr = formatDate(date);
    const key = `${userId}-${dayStr}`;

    const holiday = holidays.find((h) => h?.date === dayStr);

    if (holiday) {
      return <td key={key} className={styles.holiday}>{holiday.name || 'Holiday'}</td>;
    }

    if (disallowedWeekdays.includes(date.getDay())) {
      return <td key={key} className={styles.weekend}></td>;
    }

    const req = requests.find(
      (r) => r?.user?._id === userId && formatDate(new Date(r.date)) === dayStr
    );
    if (!req) return <td key={key}></td>;

    const type = String(req.type).toLowerCase();
    const label = String(req.type).toUpperCase();

    // Highlight pending WFH in yellow
    if (req.status === 'pending' && type === 'wfh') {
      return <td key={key} className={styles.pending}>{label}</td>;
    }

    return <td key={key} className={styles[type]}>{label}</td>;
  }


  return (
    <div className={styles.container}>
      <h2 >Team WFH Calendar</h2>
      <table >
        <thead>
          <tr >
            <th >Name</th>
            {dates.map((date) => (
              <th key={date} >
                {date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id} >
              <td >{user.name}</td>
              {dates.map((date) => getCell(user._id, date))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserCalendar;
