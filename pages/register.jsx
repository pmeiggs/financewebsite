// pages/register.jsx
// Redirects to homepage #signin section
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Register() {
  const router = useRouter();
  useEffect(() => { router.replace('/#signin'); }, []);
  return null;
}
