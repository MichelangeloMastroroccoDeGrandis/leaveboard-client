import { useState, useEffect } from "react";
import axios from "axios";
import styles from '../styles/CreateUserModal.module.css';

const EditWfhModal = ({ isOpen, onClose, user, token, onUpdated }) => {
  const [value, setValue] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setValue(user.wfhWeekly ?? '');
      setNewPassword('');
      setError('');
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const num = Number(value);
    if (Number.isNaN(num) || num < 0) {
      setError('wfhWeekly must be a non-negative number');
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const base = `${import.meta.env.VITE_BASE_URL}/api/admin/users/${user._id}`;
      // Update wfhWeekly
      await axios.put(`${base}/wfhWeekly`, { wfhWeekly: num }, {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      });
      // Optionally update password
      if (newPassword) {
        await axios.put(`${base}/password`, { password: newPassword }, {
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
        });
      }
      if (onUpdated) onUpdated();
      onClose();
    } catch (err) {
      console.error('Error updating user in modal:', err);
      const msg = err?.response?.data?.message || err?.message || 'Failed to update. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <h3>Edit Weekly WFH Days</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontWeight: 600 }}>{user.name}</div>
            <div style={{ fontSize: 12, color: '#666' }}>{user.email}</div>
          </div>
          <input
            type="number"
            name="wfhWeekly"
            placeholder="Weekly WFH days"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            min={0}
          />
          <input
            type="password"
            name="newPassword"
            placeholder="New Password (optional)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button className={styles.create} type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
          <button className={styles.cancel} type="button" onClick={onClose} disabled={loading}>Cancel</button>
        </form>
      </div>
    </div>
  );
};

export default EditWfhModal;
