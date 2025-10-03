import { API } from "../registerform";

const s = await (await fetch(`${API}/me/cloudinary-sign`)).json();

const fd = new FormData();
//fd.append("file", file);
fd.append("api_key", s.api_key);
fd.append("timestamp", s.timestamp);
fd.append("signature", s.signature);
fd.append("folder", s.folder);

const res = await fetch(`https://api.cloudinary.com/v1_1/${s.cloud_name}/image/upload`, {
  method: "POST",
  body: fd,
});
if (!res.ok) throw new Error(await res.text());
const { secure_url } = await res.json();

// then persist
await fetch(`${API}/me/profile`, {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ photo_url: secure_url }),
});
