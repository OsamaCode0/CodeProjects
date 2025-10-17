import { useEffect, useState } from "react";
import { get } from "../api/client";
import type { CombinedUser, UserPhoto, UserProfile } from "../types/profile";

type CombinedUserWithId = CombinedUser & { id: string };

type State = {
  loading: boolean;
  error: string | null;
  data: CombinedUserWithId | null;
};

export function useRecCon(route: string) {
  const [state, setState] = useState<State>({
    loading: false,
    error: null,
    data: null,
  });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setState({ loading: true, error: null, data: null });
      try {
        const ids = await get<string[]>(route); 

        if (!ids || ids.length === 0) {
          if (!cancelled) setState({ loading: false, error: null, data: null });
          return;
        }

        // Load ONLY the first profile
        const id = ids[0];
        const [profile, photo] = await Promise.all([
          get<UserProfile>(`/users/${id}/profile`),
          get<UserPhoto>(`/users/${id}`),
        ]);

        const merged: CombinedUserWithId = { id, ...profile, ...photo };

        if (!cancelled) {
          setState({ loading: false, error: null, data: merged });
        }
      } catch (err: any) {
        if (!cancelled) {
          setState({
            loading: false,
            error: err?.message ?? "Failed to load recommendations",
            data: null,
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
