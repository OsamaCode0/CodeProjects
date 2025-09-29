import { useId, useMemo, useState } from "react";
import "./preferredDistance.css";

type Props = {
  label?: string;
  value?: number; // initial value
  min?: number; // default 0
  max?: number; // default 150
  step?: number; // default 1
  onChange?: (v: number) => void;
};

export default function PreferredDistanceField({
  label = "Preferred Radius (km)",
  value = 10,
  min = 0,
  max = 150,
  step = 1,
  onChange,
}: Props) {
  const id = useId();
  const [val, setVal] = useState<number>(value);

  const pct = useMemo(() => ((val - min) / (max - min)) * 100, [val, min, max]);

  const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const n = Number(e.target.value);
    setVal(n);
    onChange?.(n);
  };

  return (
    <div className="field">
      <label className="label" htmlFor={id}>
        {label}
      </label>

      <div className="control">
        <input
          id={id}
          className="slider"
          type="range"
          min={min}
          max={max}
          step={step}
          value={val}
          onChange={handle}
          style={{ ["--pct" as any]: `${pct}%` }} // pct = ((val-min)/(max-min))*150
        />
      </div>

      <div className="is-flex is-justify-content-space-between is-align-items-center mt-2">
        <span className="is-size-7">{min} km</span>
        <span className="tag is-primary is-light">{val} km</span>
        <span className="is-size-7">{max} km</span>
      </div>
    </div>
  );
}
