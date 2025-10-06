import "bulma/css/bulma.min.css";
import "../../styles/profiles.css";
import { useLogout } from "../../auth/useLogout";
import { useChildProfile } from "../../hooks/useChildProfile";
import { useState, useEffect, useRef } from "react";
import { buildChildPayload } from "./updateChildProfile";
import type { ChildFields } from "./updateChildProfile";
import { saveProfile } from "../../hooks/patchUser";

export default function ChildProfileForm() {
  const logout = useLogout();
  const { data } = useChildProfile();

  const [initialized, setInitialized] = useState(false);
//  const [saving, setSaving] = useState(false);

  // ---- Local editable state ----
  const [name, setName] = useState("");
  const [birthday, setBirthday] = useState<string>("");
  const [gender, setGender] = useState("");
  const [about_short, setAbout_short] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [activity_level, setActivity_level] = useState("");
  const [limitations, setLimitations] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [play_styles, setPlay_styles] = useState<string[]>([]);

  // ---- Refs for originals 
  const originalName = useRef("");
  const originalBirthday = useRef("");
  const originalGender = useRef("");
  const originalAboutShort = useRef("");
  const originalInterests = useRef<string[]>([]);
  const originalActivityLevel = useRef("");
  const originalLimitations = useRef<string[]>([]);
  const originalAllergies = useRef<string[]>([]);
  const originalPlayStyles = useRef<string[]>([]);

  // Initialize from API once
  useEffect(() => {
    if (!data || initialized) return;

    setName(data.name ?? "");
    setBirthday(data.birthday ?? "");
    setGender(data.gender ?? "");
    setAbout_short(data.about_short ?? "");
    setInterests(data.interests ?? []);
    setActivity_level(data.activity_level ?? "");
    setLimitations(data.limitations ?? []);
    setAllergies(data.allergies ?? []);
    setPlay_styles(data.play_styles ?? []);
    setInitialized(true);

    originalName.current = data.name ?? "";
    originalBirthday.current = data.birthday ?? "";
    originalGender.current = data.gender ?? "";
    originalAboutShort.current = data.about_short ?? "";
    originalInterests.current = data.interests ?? [];
    originalActivityLevel.current = data.activity_level ?? "";
    originalLimitations.current = data.limitations ?? [];
    originalAllergies.current = data.allergies ?? [];
    originalPlayStyles.current = data.play_styles ?? [];
  }, [data, initialized]);

  /*// Quick helper to know if anything changed 
  const hasChanges =
    name.trim() !== originalName.current.trim() ||
    birthday !== originalBirthday.current ||
    gender !== originalGender.current ||
    about_short.trim() !== originalAboutShort.current.trim() ||
    activity_level !== originalActivityLevel.current ||
    JSON.stringify(interests.map((s) => s.trim()).filter(Boolean)) !==
      JSON.stringify(
        originalInterests.current.map((s) => s.trim()).filter(Boolean)
      ) ||
    JSON.stringify(limitations.map((s) => s.trim()).filter(Boolean)) !==
      JSON.stringify(
        originalLimitations.current.map((s) => s.trim()).filter(Boolean)
      ) ||
    JSON.stringify(allergies.map((s) => s.trim()).filter(Boolean)) !==
      JSON.stringify(
        originalAllergies.current.map((s) => s.trim()).filter(Boolean)
      ) ||
    JSON.stringify(play_styles.map((s) => s.trim()).filter(Boolean)) !==
      JSON.stringify(
        originalPlayStyles.current.map((s) => s.trim()).filter(Boolean)
      );*/

  async function handleSaveChild() {
    // Build current/original snapshots
    const current: ChildFields = {
      name,
      birthday,
      gender,
      about_short,
      interests,
      activity_level,
      limitations,
      allergies,
      play_styles,
    };

    const original: ChildFields = {
      name: originalName.current,
      birthday: originalBirthday.current,
      gender: originalGender.current,
      about_short: originalAboutShort.current,
      interests: originalInterests.current,
      activity_level: originalActivityLevel.current,
      limitations: originalLimitations.current,
      allergies: originalAllergies.current,
      play_styles: originalPlayStyles.current,
    };

    // Compute payload
    const payload = buildChildPayload(current, original);
    if (Object.keys(payload).length === 0) return;

    //setSaving(true);
    try {
      await saveProfile(payload, "/me/child");

      // Sync refs after success so hasChanges becomes false on next render
      if ("name" in payload) originalName.current = name.trim();
      if ("birthday" in payload) originalBirthday.current = birthday;
      if ("gender" in payload) originalGender.current = gender;
      if ("about_short" in payload)
        originalAboutShort.current = about_short.trim();
      if ("activity_level" in payload)
        originalActivityLevel.current = activity_level;

      if ("interests" in payload) originalInterests.current = [...interests];
      if ("limitations" in payload)
        originalLimitations.current = [...limitations];
      if ("allergies" in payload) originalAllergies.current = [...allergies];
      if ("play_styles" in payload)
        originalPlayStyles.current = [...play_styles];
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
        <h1 className="title has-text-centered">Child Profile</h1>

        <form className="child-profile with-bottom-panel">
          {/* Name */}
          <div className="field">
            <label className="label">Name</label>
            <div className="control">
              <input
                className="input"
                type="text"
                name="name"
                placeholder="Enter name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          {/* Birthday */}
          <div className="field">
            <label className="label">Birthday</label>
            <div className="control">
              <input
                className="input"
                type="date"
                name="birthday"
                value={birthday}
                max={new Date().toISOString().split("T")[0]}
                onChange={(e) => setBirthday(e.target.value)}
              />
            </div>
          </div>

          {/* Gender */}
          <div className="field">
            <label className="label">Gender</label>
            <div className="control">
              <div className="select">
                <select
                  name="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}>
                  <option value="">Select gender</option>
                  <option value="male">Boy</option>
                  <option value="female">Girl</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* About_short */}
          <div className="field">
            <label className="label">About short</label>
            <div className="control">
              <textarea
                className="textarea"
                name="about_short"
                placeholder="Short description"
                value={about_short}
                onChange={(e) => setAbout_short(e.target.value)}
              />
            </div>
          </div>

          {/* Interests */}
          <div className="field">
            <label className="label">Interests</label>
            <div className="control">
              <input
                className="input"
                type="text"
                name="interests"
                placeholder="e.g. football, drawing"
                value={interests.join(", ")}
                onChange={(e) => setInterests([e.target.value])}
                onBlur={(e) =>
                  setInterests(
                    e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean)
                  )
                }
              />
            </div>
          </div>

          {/* Activity_level */}
          <div className="field">
            <label className="label">Activity level</label>
            <div className="control">
              <div className="select">
                <select
                  name="activity_level"
                  value={activity_level}
                  onChange={(e) => setActivity_level(e.target.value)}>
                  <option value="">Select level</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
          </div>

          {/* Limitations */}
          <div className="field">
            <label className="label">Limitations</label>
            <div className="control">
              <input
                className="input"
                type="text"
                name="limitations"
                placeholder="e.g. no climbing, no dairy"
                value={limitations.join(", ")}
                onChange={(e) => setLimitations([e.target.value])}
                onBlur={(e) =>
                  setLimitations(
                    e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean)
                  )
                }
              />
            </div>
          </div>

          {/* Allergies */}
          <div className="field">
            <label className="label">Allergies</label>
            <div className="control">
              <input
                className="input"
                type="text"
                name="allergies"
                placeholder="e.g. peanuts, pollen"
                value={allergies.join(", ")}
                onChange={(e) => setAllergies([e.target.value])}
                onBlur={(e) =>
                  setAllergies(
                    e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean)
                  )
                }
              />
            </div>
          </div>

          {/* Play_styles */}
          <div className="field">
            <label className="label">Play styles</label>
            <div className="control">
              <input
                className="input"
                type="text"
                name="play_styles"
                placeholder="e.g. role play, building, puzzles"
                value={play_styles.join(", ")}
                onChange={(e) => setPlay_styles([e.target.value])}
                onBlur={(e) =>
                  setPlay_styles(
                    e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean)
                  )
                }
              />
            </div>
          </div>

          <div className="field">
            <div className="control">
              <button
                className="button is-primary"
                type="button"
                onClick={handleSaveChild}
                >
                Save changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
