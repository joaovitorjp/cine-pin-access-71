import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Returns a back handler that uses browser history when possible,
 * falling back to a safe in-app route when there is no prior entry
 * (e.g. user opened the link directly or via shared URL).
 */
export function useSafeBack(fallback: string = "/") {
  const navigate = useNavigate();
  return useCallback(() => {
    const hasHistory =
      typeof window !== "undefined" &&
      window.history.length > 1 &&
      document.referrer &&
      document.referrer.includes(window.location.host);

    if (hasHistory) {
      navigate(-1);
    } else {
      navigate(fallback, { replace: true });
    }
  }, [navigate, fallback]);
}
