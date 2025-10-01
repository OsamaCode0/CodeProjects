import "bulma/css/bulma.min.css";
import "../../styles/profiles.css";
import { useLogout } from "../../auth/useLogout";
import { useChildProfile } from "../../hooks/useChildProfile";
import { useState, useEffect } from "react";

export default function ChildProfileForm() {
  const logout = useLogout();

   const {  data } = useChildProfile();
  
    const [initialized, setInitialized] = useState(false);
  /*export type ChildResponse = {
  name?: string | null;
	birthday?: Date | null;
	gender?: string | null;
	about_short?: string | null;
	intersts?: string[] | null;
	activity_level?: string | null;
	limitations?: string[] | null;
	allergies?: string[] | null;
	play_styles?: string[] | null;
}*/
    // Local editable state (initialized once data arrives)
    const [name, setName] = useState("");
    const [birthday, setBirthday] = useState<string>("");
    const [gender, setGender] = useState("");
    const [about_short, setAbout_short] = useState("");
    const [interests, setInterests] = useState<string[]>([]);
    const [activity_level, setActivity_level] = useState("");
    const [limitations, setLimitations] = useState<string[]>([]);
    const [allergies, setAllergies] = useState<string[]>([]);
    const [play_styles, setPlay_styles] = useState<string[]>([]);

    useEffect(() => {
        if (!data || initialized) return;
        setName(data.name ?? "");
        //originalName.current = data.name ?? "";
        setBirthday(data.birthday ?? ""); 
        //originalGender.current = data.gender ?? "";
        setGender(data.gender ?? ""); 
        //originalPreferredDistance.current = data.preferredDistance ?? 0;
        setAbout_short(data.about_short ?? "");
        //originalAbout.current = data.about ?? "";
        setInterests(data.intersts ?? []);
        //originalLanguages.current = data.languages ?? ["", "", ""];
        setActivity_level(data.activity_level ?? "");
        //originalCity.current = loadedCity ?? null;
        
        setLimitations(data.limitations ?? []);
        setAllergies(data.allergies ?? []);
        setPlay_styles(data.play_styles ?? []);
        setInitialized(true);
      }, [data, initialized]);

  
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
              value={birthday} />
            </div>
          </div>

          {/* Gender */}
          <div className="field">
            <label className="label">Gender</label>
            <div className="control">
              <div className="select">
                <select 
                name="gender"
                 value={gender}>
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
                value={interests}
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
                value={activity_level}>
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
                value={limitations}
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
                value={allergies}
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
                value={play_styles}
              />
            </div>
          </div>

          {/* Save + Bottom panel */}
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
