import { useState } from "react";
import "../styles/userPhoto.css";

type Props = {
  /** how many slots to show */
  maxSlots?: number;
  /** called when any slot changes; gives you the current File list */
  onChange?: (files: (File | null)[]) => void;
};

export default function UserPhotosField({ maxSlots = 6, onChange }: Props) {
  const [previews, setPreviews] = useState<(string | null)[]>(
    Array(maxSlots).fill(null)
  );
  const [files, setFiles] = useState<(File | null)[]>(
    Array(maxSlots).fill(null)
  );

  const handlePick = (index: number, file: File | null) => {
    // update files list
    const nextFiles = [...files];
    nextFiles[index] = file;
    setFiles(nextFiles);
    onChange?.(nextFiles);

    // update preview
    if (!file) {
      const nextPreviews = [...previews];
      nextPreviews[index] = null;
      setPreviews(nextPreviews);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const nextPreviews = [...previews];
      nextPreviews[index] = reader.result as string;
      setPreviews(nextPreviews);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="field">
      <label className="label">User Photos</label>

      <div className="photo-grid">
        {previews.map((src, i) => (
          <label key={i} className="photo-slot" title="Click to upload">
            {src ? <img src={src} alt={`photo-${i}`} /> : <span className="plus">+</span>}
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => handlePick(i, e.target.files?.[0] ?? null)}
            />
            {src && (
              <button
                type="button"
                className="remove"
                onClick={(e) => {
                  e.preventDefault();
                  handlePick(i, null);
                }}
                aria-label="Remove photo"
                title="Remove photo"
              >
                ×
              </button>
            )}
          </label>
        ))}
      </div>

      <p className="help">Click a slot to upload up to {maxSlots} photos.</p>
    </div>
  );
}
