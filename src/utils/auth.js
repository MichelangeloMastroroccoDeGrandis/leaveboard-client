export const refreshToken = async () => {
  try {
    const res = await fetch('http://localhost:5000/api/auth/refresh', {
      method: 'POST',
      credentials: 'include', // include cookie in request
    });

    if (!res.ok) throw new Error('Refresh failed');

    const data = await res.json();
    return data.token; // new access token
  } catch (error) {
    console.error('Token refresh error:', error.message);
    return null;
  }
};
