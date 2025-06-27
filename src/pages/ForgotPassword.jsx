import { useState } from 'react';
import logo from '../assets/logo_no_text.png';
import styles from '../styles/LoginPage.module.css'; 

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Sending...');

    const res = await fetch('http://localhost:5000/api/auth/recover', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (res.ok) setStatus('✅ Email sent to admin');
    else setStatus(`❌ ${data.message}`);
  };

  return (

    <div className={styles.container}>
      <img className={styles.logo} src={logo} alt="Logo" width={100} />
      <h2 >Recover Password</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border p-2 rounded"
        />
        <button type="submit" className={styles.button}>
          Send Recovery Request
        </button>
      </form>
      {status && <p>{status}</p>}
    </div>
  );
};

export default ForgotPassword;
