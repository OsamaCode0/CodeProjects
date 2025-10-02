import "bulma/css/bulma.min.css";
import "../../styles/profiles.css";
import { useLogout } from "../../auth/useLogout";
import UserPhotosField from "../userphoto";
import UserLanguagesField from "../userLanguages";
import CityAutocomplete from "../cityAutocomplete";
import PreferredDistanceField from "../preferredDistance";
import { useEffect, useState, useRef } from "react";
import { useMeProfile } from "../../hooks/useMeProfile";
import { saveProfile } from "../../hooks/patchUser";
import { buildPayload } from "./updateProfile";
import type { ProfileFields } from "./updateProfile";
import type { City } from "../../types/profile";

export default function UserProfileForm() {
  const logout = useLogout();
  const { loading, error, data, city: loadedCity } = useMeProfile();

  const [initialized, setInitialized] = useState(false);

  // Local editable state (initialized once data arrives)
  const [name, setName] = useState("");
  const [about, setAbout] = useState("");
  const [languages, setLanguages] = useState<string[]>(["", "", ""]);
  const [city, setCity] = useState(loadedCity);
  const [gender, setGender] = useState<string>("");
  const [preferredDistance, setPreferredDistance] = useState(10);

  //to compare if we need to renew
  const originalName = useRef("");
  const originalGender = useRef("");
  const originalPreferredDistance = useRef(0);
  const originalAbout = useRef("");
  const originalLanguages = useRef<string[]>(["", "", ""]);
  const originalCity = useRef<City | null>(null);

  // Sync incoming data → form state
  useEffect(() => {
    if (!data || initialized) return;
    setName(data.name ?? "");
    originalName.current = data.name ?? "";
    setGender(data.gender ?? ""); // from /me/bio
    originalGender.current = data.gender ?? "";
    setPreferredDistance(data.preferredDistance ?? 0); // from /me/bio
    originalPreferredDistance.current = data.preferredDistance ?? 0;
    setAbout(data.about ?? "");
    originalAbout.current = data.about ?? "";
    setLanguages(data.languages ?? ["", "", ""]);
    originalLanguages.current = data.languages ?? ["", "", ""];
    setCity(loadedCity ?? null);
    originalCity.current = loadedCity ?? null;
    setInitialized(true);
  }, [data, loadedCity, initialized]);

  async function handleSave() {
    const current: ProfileFields = {
      name,
      gender,
      about,
      preferredDistance,
      languages,
      city,
    };

    const original: ProfileFields = {
      name: originalName.current,
      gender: originalGender.current,
      about: originalAbout.current,
      preferredDistance: originalPreferredDistance.current,
      languages: originalLanguages.current,
      city: originalCity.current,
    };
    console.log("current languages:", languages);
    console.log("original languages:", originalLanguages.current);

    const payload = buildPayload(current, original);
    if (Object.keys(payload).length === 0) return; // nothing changed

    try {
      await saveProfile(payload, "/me/profile");

      // sync originals after success
      if ("name" in payload) originalName.current = (name ?? "").trim();
      if ("gender" in payload) originalGender.current = gender ?? "";
      if ("preferredDistance" in payload)
        originalPreferredDistance.current = preferredDistance ?? 0;
      if ("about" in payload) originalAbout.current = about ?? "";
      if ("languages" in payload)
        originalLanguages.current = languages ?? ["", "", ""];

      // If your payload uses addressCity/lat/lon for city:
      if ("addressCity" in payload || "lat" in payload || "lon" in payload) {
        originalCity.current = city ?? null;
      }
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <section className="section has-background-light">
      <button className="logout button is-dark" onClick={() => logout()}>
        Log out
      </button>
      <div className="container">
        <h1 className="title has-text-centered">Your Profile</h1>

        {error && <div className="notification is-danger">{error}</div>}

        <form className="user-profile  with-bottom-panel">
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

          {/* Photos */}
          <div className="field">
            <UserPhotosField
              maxSlots={6}
              onChange={(files) => console.log(files)}
            />
          </div>

          {/* Gender (keep simple/select for now) */}
          <div className="field">
            <label className="label" htmlFor="gender">
              Gender
            </label>
            <div className="control">
              <div className="select is-fullwidth">
                <select
                  id="gender"
                  name="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  disabled={loading}>
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
              onChange={setPreferredDistance}
              min={0}
              max={150}
              step={1}
            />
          </div>

          {/* Submit Button (non-functional) */}
          <div className="field">
            <div className="control">
              <button
                className="button is-primary"
                type="button"
                onClick={handleSave}>
                Save changes
              </button>
            </div>
          </div>
         
        </form>
      </div>
    </section>
  );
}
