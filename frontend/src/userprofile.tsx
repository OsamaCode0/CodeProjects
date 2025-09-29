import "bulma/css/bulma.min.css";
import "./profiles.css";
import UserPhotosField from "./components/userphoto";
import UserLanguagesField from "./components/userLanguages";
import { useState, useEffect } from "react";
import CityAutocomplete from "./components/cityAutocomplete";
import PreferredDistanceField from "./components/preferredDistance";
import { API } from "./registerform";

type MeResponse = {
  name?: string | null;
  gender?: string | null;
  about?: string | null;
  languages?: string[] | null;

  addressCity?: string | null;
  lat?: number | null;
  lon?: number | null;
};

type City = {
  label: string;
  countryCode?: string;
  lat: number;
  lon: number;
};

export default function UserProfileForm() {
  const [name, setName] = useState("");
  const [about, setAbout] = useState("");
  const [languages, setLanguages] = useState<string[]>(["", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [city, setCity] = useState<City | null>(null);

  const [preferredDistance, setPreferredDistance] = useState(10);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found");
      return;
    }

    const fetchMe = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/me/profile`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data: MeResponse = await res.json();
        setName(data.name ?? "");
        setAbout(data.about ?? "");
        setLanguages(data.languages ?? ["", "", ""]);
        if (data.addressCity) {
          setCity(
            data.addressCity
              ? {
                  label: data.addressCity,
                  countryCode: "FI",
                  lat: Number(data.lat ?? 0),
                  lon: Number(data.lon ?? 0),
                }
              : null
          );
        } else {
          setCity(null);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, []);

  return (
    <section className="section  has-background-light">
      <div className="container">
        <h1 className="title has-text-centered">Your Profile</h1>
        {error && 
        <div className="notification is-danger">{error}</div>}
        <form className="user-profile">
          {/* Name */}
          <div className="field">
            <label className="label" htmlFor="name">
              Name
            </label>
            <div className="control">
              <input
                id="name"
                name="name"
                className="input"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>
            {loading && <p className="help">Loading…</p>}
          </div>

          <div>
            <UserPhotosField
              maxSlots={6}
              onChange={(files) => console.log(files)}
            />
          </div>

          {/* Gender */}
          <div className="field">
            <label className="label" htmlFor="gender">
              Gender
            </label>
            <div className="control">
              <div className="select is-fullwidth">
                <select id="gender" name="gender" defaultValue="">
                  <option value="" disabled>
                    Select gender
                  </option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-binary</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>
            </div>
          </div>

          {/* About */}
          <div className="field">
            <label className="label" htmlFor="about">
              About
            </label>
            <div className="control">
              <textarea
                id="about"
                name="about"
                className="textarea"
                placeholder="Write something about yourself…"
                rows={4}
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                disabled={loading}
              />
            </div>
            <p className="help">Short info shown on your profile.</p>
          </div>

          {/* Languages */}
          <div className="field">
            <UserLanguagesField
              maxLanguages={3}
              languages={languages}
              onChange={setLanguages}
            />
          </div>

          {/* Address City */}
          <div className="field">
            <CityAutocomplete
              country="FI"
              value={city}
              onChange={setCity}
              placeholder="Type a city…"
            />
          </div>

          {/* Preferred Distance (km) */}
          <div className="field">
            <PreferredDistanceField
              value={preferredDistance}
              min={0}
              max={150}
              step={1}
              onChange={setPreferredDistance}
            />
          </div>

          {/* Submit Button (non-functional) */}
          <div className="field">
            <div className="control">
              <button className="button is-primary" type="button">
                Save changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
