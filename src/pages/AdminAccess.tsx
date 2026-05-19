import React, { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Hidden route: /admin-access?k=<token>
 * Auto-validates the admin token and redirects to /admin on success.
 * On failure or missing token, redirects to / silently.
 */
const AdminAccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginAsAdmin } = useAuth();
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    const token = searchParams.get("k");
    if (!token) {
      navigate("/", { replace: true });
      return;
    }

    (async () => {
      const ok = await loginAsAdmin(token);
      // Clean token from URL regardless of outcome
      if (ok) {
        navigate("/admin", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    })();
  }, [searchParams, loginAsAdmin, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <p className="text-sm text-muted-foreground">Verificando acesso...</p>
    </div>
  );
};

export default AdminAccess;
