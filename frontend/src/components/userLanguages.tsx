type Props = {
  maxLanguages?: number; // default = 3
};

export default function UserLanguagesField({ maxLanguages = 3 }: Props) {
  // Generate array of indexes [0,1,2]
  const fields = Array.from({ length: maxLanguages }, (_, i) => i);

  return (
    <div className="field">
      <label className="label">Languages</label>

      {fields.map((i) => (
        <div className="control" style={{ marginTop: i === 0 ? 0 : "0.5rem" }} key={i}>
          <input
            name="language"
            className="input"
            type="text"
            list="languages"
            placeholder="Type a language..."
          />
        </div>
      ))}

      <datalist id="languages">
        <option value="EN">English</option>
        <option value="FR">French</option>
        <option value="RU">Russian</option>
        <option value="DE">German</option>
        <option value="ES">Spanish</option>
        <option value="IT">Italian</option>
        <option value="PT">Portuguese</option>
        <option value="ZH">Chinese (Mandarin)</option>
        <option value="JA">Japanese</option>
        <option value="KO">Korean</option>
        <option value="AR">Arabic</option>
        <option value="HI">Hindi</option>
        <option value="BN">Bengali</option>
        <option value="UR">Urdu</option>
        <option value="FA">Persian</option>
        <option value="TR">Turkish</option>
        <option value="NL">Dutch</option>
        <option value="PL">Polish</option>
        <option value="SV">Swedish</option>
        <option value="FI">Finnish</option>
        <option value="NO">Norwegian</option>
        <option value="DA">Danish</option>
        <option value="EL">Greek</option>
        <option value="HE">Hebrew</option>
        <option value="TH">Thai</option>
        <option value="VI">Vietnamese</option>
        <option value="MS">Malay</option>
        <option value="ID">Indonesian</option>
        <option value="TL">Tagalog</option>
        <option value="SW">Swahili</option>
      </datalist>

      <p className="help">Choose up to {maxLanguages} languages (ISO codes or names).</p>
    </div>
  );
}
