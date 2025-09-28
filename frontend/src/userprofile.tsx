import "bulma/css/bulma.min.css";
import "./profiles.css"
import UserPhotosField from "./components/userphoto";
import UserLanguagesField from "./components/userLanguages";

export default function UserProfileForm() {
  return (
    <section className="section">
      <div className="container">
        <h1 className="title has-text-centered">Your Profile</h1>
        <form className="user-profile">
          {/* Name */}
          <div className="field">
            <label className="label" htmlFor="name">Name</label>
            <div className="control">
              <input id="name" name="name" className="input" type="text" placeholder="Enter your name" />
            </div>
          </div>

          <div><UserPhotosField maxSlots={6} onChange={(files) => console.log(files)} /></div>
         

          {/* Gender */}
          <div className="field">
            <label className="label" htmlFor="gender">Gender</label>
            <div className="control">
              <div className="select is-fullwidth">
                <select id="gender" name="gender" defaultValue="">
                  <option value="" disabled>Select gender</option>
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
            <label className="label" htmlFor="about">About</label>
            <div className="control">
              <textarea id="about" name="about" className="textarea" placeholder="Write something about yourself…" rows={4} />
            </div>
            <p className="help">Short bio shown on your profile.</p>
          </div>

          {/* Language Codes */}
          <div className="field">
             <UserLanguagesField maxLanguages={3} />
          </div>

          {/* Address City */}
          <div className="field">
            <label className="label" htmlFor="addressCity">Address City</label>
            <div className="control">
              <input id="addressCity" name="addressCity" className="input" type="text" placeholder="Enter your city" />
            </div>
          </div>

          {/* Preferred Distance (km) */}
          <div className="field">
            <label className="label" htmlFor="preferredDistance">Preferred Distance (km)</label>
            <div className="control">
              <input id="preferredDistance" name="preferredDistance" className="input" type="number" min={1} max={500} placeholder="e.g. 10" />
            </div>
          </div>

          {/* Submit Button (non-functional) */}
          <div className="field">
            <div className="control">
              <button className="button is-primary" type="button">Save changes</button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
