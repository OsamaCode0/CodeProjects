import { useEffect, useState } from "react";
import { get } from "../api/client";
import type { MeResponse, City, CombinedMe, BioResponse } from "../types/profile";

type State = {
  loading: boolean;
  error: string | null;
  data: MeResponse | null;
  city: City | null;
};

export function useMeProfile() {
  const [state, setState] = useState<State>({
    loading: false,
    error: null,
    data: null,
    city: null,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setState((s) => ({ ...s, error: "No token found" }));
      return;
    }

    let cancelled = false;
    (async () => {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const [profile, bio] = await Promise.all([
          get<MeResponse>("/me/profile"),
          get<BioResponse>("/me/bio"),
        ]);

        const merged: CombinedMe = { ...profile, ...bio };

        const city =
          merged.addressCity
            ? {
                label: merged.addressCity,
                countryCode: "FI", // change if you store country
                lat: Number(merged.lat ?? 0),
                lon: Number(merged.lon ?? 0),
              }
            : null;

        if (!cancelled) {
          setState({ loading: false, error: null, data: merged, city });
        }
      } catch (err: any) {
        if (!cancelled) {
          setState((s) => ({
            ...s,
            loading: false,
            error: err?.message ?? "Failed to load profile",
          }));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
