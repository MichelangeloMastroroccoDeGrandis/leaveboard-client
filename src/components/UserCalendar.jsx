import { useEffect, useState } from 'react';
import styles from '../styles/UserCalendar.module.css';

const UserCalendar = () => {
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const token = localStorage.getItem('token');

  // Compute 2 weeks
  const getDates = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // If today is Sunday, skip to tomorrow
  const startDate = today.getDay() === 0 ? new Date(today.setDate(today.getDate() + 1)) : new Date(today);

  const dates = [];
  let currentDate = new Date(startDate);

  let sundayCount = 0;

  while (sundayCount < 2) {
    if (currentDate.getDay() === 0) {
      sundayCount++;
    }
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};

  const dates = getDates();

  useEffect(() => {
  const fetchData = async () => {
    const res = await fetch('http://localhost:5000/api/calendar', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setUsers(data.users);
    setRequests(data.requests);
  };
  fetchData();
}, []);

  const formatDate = (d) => d.toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });

  const getCell = (userId, date) => {

    const dayStr = formatDate(date);
    const key = `${userId}-${dayStr}`;

    if (date.getDay() === 0 || date.getDay() === 6 || date.getDay() === 5) return <td key={key} className={styles.weekend}></td>;

    const req = requests.find(
      (r) => r.user._id === userId && formatDate(new Date(r.date)) === dayStr
    );
    if (!req) return <td key={key}></td>;

    const type = req.type.toLowerCase();
    const label = req.type.toUpperCase();

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
                {date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' })}
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
