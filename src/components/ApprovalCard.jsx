import styles from '../styles/ApprovalCard.module.css';

const ApprovalCard = ({ request, onApprove, onReject }) => { 
  if (!request) return null;
  const { _id, user, type, date, status } = request;

  return (
    <li className={styles.card}>
      <p><strong>User:</strong> {user.name} ({user.email})</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Position:</strong> {user.position}</p>
      <p><strong>Type:</strong> {type.toUpperCase()}</p>
      <p><strong>Date:</strong> {new Date(date).toLocaleDateString()}</p>
      <p><strong>Status:</strong> {status}</p>
      <button className={styles.approve} onClick={() => onApprove(_id)}>Approve</button>
      <button className={styles.reject} onClick={() => onReject(_id)}>Reject</button>
    </li>
  );
}

export default ApprovalCard;