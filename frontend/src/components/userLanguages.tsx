type Props = {
  maxLanguages?: number; // default = 3
  languages: string[];
  onChange: (langs: string[]) => void;
};

export default function UserLanguagesField({
  maxLanguages = 3,
  languages,
  onChange,
}: Props) {
  // Always create exactly maxLanguages slots
  const fields = Array.from({ length: maxLanguages }, (_, i) => i);

  return (
    <div className="field">
      <label className="label">Languages</label>

      {fields.map((i) => (
        <div
          className="control"
          style={{ marginTop: i === 0 ? 0 : "0.5rem" }}
          key={i}
        >
          <input
            name={`language-${i}`}
            className="input"
            type="text"
            list="languages"
            placeholder="Type a language..."
            value={languages[i] ?? ""} // 👈 controlled input
            onChange={(e) => {
              const updated = [...languages];
              updated[i] = e.target.value;
              onChange(updated); // 👈 push changes back up
            }}
          />
        </div>
      ))}

      <datalist id="languages">
        <option value="English" />
        <option value="French" />
        <option value="Russian" />
        <option value="German" />
        <option value="Spanish" />
        <option value="Italian" />
        <option value="Portuguese" />
        <option value="Chinese (Mandarin)" />
        <option value="Japanese" />
        <option value="Korean" />
        <option value="Arabic" />
        <option value="Hindi" />
        <option value="Bengali" />
        <option value="Urdu" />
        <option value="Turkish" />
        <option value="Dutch" />
        <option value="Polish" />
        <option value="Swedish" />
        <option value="Finnish" />
        <option value="Norwegian" />
        <option value="Danish" />
        <option value="Greek" />
        <option value="Hebrew" />
        <option value="Thai" />
        <option value="Vietnamese" />
        <option value="Malay" />
        <option value="Indonesian" />
        <option value="Tagalog" />
        <option value="Swahili" />
      </datalist>

      <p className="help">Choose up to {maxLanguages} languages.</p>
    </div>
  );
}
