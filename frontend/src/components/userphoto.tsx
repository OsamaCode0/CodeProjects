import { useEffect, useState } from "react";
import "../styles/userPhoto.css";

type Props = {
  /** called when the file changes (null when removed) */
  onChange?: (file: File | null) => void;
  /** existing photo URL from backend (optional) */
  initialUrl?: string | null;
  /** emoji shown when empty */
  placeholderEmoji?: string; // e.g. "👤" 
  name?: string;
};

export default function UserPhotoField({
  onChange,
  initialUrl = null,
  placeholderEmoji = "👤",
  name = "photo",
}: Props) {
  const [preview, setPreview] = useState<string | null>(initialUrl);
  const [file, setFile] = useState<File | null>(null);

  // keep preview in sync if parent provides/changes initialUrl
  useEffect(() => {
    setPreview(initialUrl ?? null);
    setFile(null);
  }, [initialUrl]);

  const handlePick = (f: File | null) => {
    setFile(f);
    onChange?.(f);

    if (!f) {
      setPreview(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  return (
    <div className="field">
      <label className="label">Profile Photo</label>

      <label className={`photo-slot ${preview ? "" : "is-empty"}`} title="Click to upload">
        {preview ? (
          <img src={preview} alt="profile" />
        ) : (
          <span className="placeholder-emoji" role="img" aria-label="Upload photo">
            {placeholderEmoji}
          </span>
        )}

        <input
          type="file"
          name={name}
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => handlePick(e.target.files?.[0] ?? null)}
        />

        {preview && (
          <button
            type="button"
            className="remove"
            onClick={(e) => {
              e.preventDefault();
              handlePick(null);
            }}
            aria-label="Remove photo"
            title="Remove photo"
          >
            ×
          </button>
        )}
      </label>

      <p className="help">Click to upload one image. Use a square photo for best fit.</p>
    </div>
  );
}
