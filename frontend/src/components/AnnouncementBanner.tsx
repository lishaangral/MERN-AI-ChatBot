import { useState } from "react";
import { X } from "lucide-react";

const AnnouncementBanner = () => {
  const [visible, setVisible] = useState(true);

  const handleClose = () => {
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="announcement-banner">
      <div className="announcement-content">
        <span className="announcement-text">
          🚧 UI redesign is underway, view updates on{" "}
          <a href="https://github.com/lishaangral/MERN-AI-ChatBot" target="_blank">
            GitHub README
          </a>{" "}
          or check out the{" "}
          <a href="https://docs.google.com/document/d/1NnwdRabSEcdkUKYtY8mzzMNdGP1FQQC2MFC8WTZMBqc/edit?tab=t.0#heading=h.puuij4m3k7so" target="_blank">
            UI Update Doc
          </a> 🚧
        </span>
      </div>

      <button className="announcement-close" onClick={handleClose}>
        <X size={16} />
      </button>
    </div>
  );
};

export default AnnouncementBanner;