// File: src/components/dashboard/OwnerGate.jsx — Route guard that redirects non-owners to the owner sign-in page.
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isOwner } from '../../utils/ownerAuth';

export default function OwnerGate({ children }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOwner()) {
      navigate('/owner-login', { replace: true });
    }
  }, [navigate]);

  if (!isOwner()) return null;
  return children;
}
