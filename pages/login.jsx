// pages/login.jsx
// Redirects to homepage #signin section — auth is now on the homepage
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const router = useRouter();
  useEffect(() => { router.replace('/#signin'); }, []);
  return null;
}
