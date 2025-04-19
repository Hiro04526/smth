import { createBatchEvents, getCalendars } from "@/lib/actions";
import { Class } from "@/lib/definitions";
import { useGoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import { toast } from "sonner";

export default function useGoogleCalendar(scheduleClasses: Class[]) {
  const [calendars, setCalendars] = useState<
    Awaited<ReturnType<typeof getCalendars>>
  >([]);
  const [selectedCalendar, setSelectedCalendar] = useState<string>("");
  const [token, setToken] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [importing, setImporting] = useState(false);

  const handleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      toast.success("Login successful!");

      const toastId = toast.loading("Fetching calendars...");
      const newCalendars = await getCalendars(tokenResponse.access_token);
      toast.dismiss(toastId);

      setToken(tokenResponse.access_token);
      setCalendars(newCalendars);
      setOpen(true);
    },
    onError: (error) => {
      toast.error("Login failed. Please try again.", {
        description: error.error_description,
      });
    },
    scope: "https://www.googleapis.com/auth/calendar",
  });

  const handleClick = () => {
    if (!token) {
      handleLogin();
    } else {
      setOpen(true);
    }
  };

  const handleExport = async () => {
    if (!token) {
      toast.error("An error occured while exporting...", {
        description: "Try refreshing the page.",
      });
      return;
    }

    setImporting(true);

    const { data, error } = await createBatchEvents(
      token,
      selectedCalendar,
      scheduleClasses
    );

    if (error) {
      toast.error("An error occured while exporting...", {
        description: error,
      });
    }

    const calendar = calendars.find(
      (calendar) => calendar.id === selectedCalendar
    );

    if (data) {
      toast.success("Events created successfully!", {
        description: `You can now see your schedule in your ${calendar} calendar!`,
      });
    }

    setImporting(false);
    setOpen(false);
  };

  return {
    calendars,
    selectedCalendar,
    setSelectedCalendar,
    token,
    open,
    setOpen,
    importing,
    handleExport,
    handleClick,
  };
}
