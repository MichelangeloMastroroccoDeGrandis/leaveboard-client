// client/components/AdminUserTable.jsx
import { useState } from 'react';
import styles from '../styles/AdminUserTable.module.css';
import { useSelector } from 'react-redux';

const AdminUserTable = ({ users, refreshUsers }) => {
  const { user } = useSelector(state => state.auth);
  const [passwords, setPasswords] = useState({});
  const token = localStorage.getItem('token');

  const handleDelete = async (id, e) => {
     if (e) e.preventDefault();

    const confirmed = window.confirm('Are you sure you want to delete this user?');
    if (!confirmed) return;

    await fetch(`http://localhost:5000/api/admin/users/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    refreshUsers();
  };

  const handlePasswordChange = (id, value) => {
    setPasswords((prev) => ({ ...prev, [id]: value }));
  };

  const updatePassword = async (id) => {
    const password = passwords[id];
    if (!password || password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    const res = await fetch(`http://localhost:5000/api/admin/users/${id}/password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ password }),
    });

    const data = await res.json();
    if (res.ok) {
      alert('Password updated');
      setPasswords((prev) => ({ ...prev, [id]: '' }));
    } else {
      alert(data.message || 'Error updating password');
    }
  };

  return (
    <div className={styles.TableContainer}>
      <h2>User Management</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
            <th>Password</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u._id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>
                 {user._id !== u._id && (
                <button
                  onClick={() => handleDelete(u._id)}
                  className={styles.deleteButton}
                >
                  Delete
                </button>
                )}
              </td>
              <td>
                <input type="text" value={passwords[u._id] || ''}
                  onChange={(e) => handlePasswordChange(u._id, e.target.value)}
                  placeholder="Change Password"
                  
                />
                <button onClick={() => updatePassword(u._id)} className={styles.updatePassword}>Update</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUserTable;
