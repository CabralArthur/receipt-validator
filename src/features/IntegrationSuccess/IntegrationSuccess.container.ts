import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function useIntegrationSuccessContainer() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(3);
  const closeScreen = searchParams.get('close_screen') === 'true';

  useEffect(() => {
    // If close_screen parameter doesn't exist, redirect to home
    if (!closeScreen) {
      navigate('/employees', { replace: true });
      return;
    }

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Close the window/popup
          window.close();
          // Fallback: if window.close() doesn't work, redirect to home
          setTimeout(() => {
            navigate('/employees', { replace: true });
          }, 100);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [closeScreen, navigate]);

  return {
    countdown,
    closeScreen,
  };
}