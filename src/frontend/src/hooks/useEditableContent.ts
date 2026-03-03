import { useCallback, useState } from "react";

const STORAGE_KEY = "adminEditableContent";

export interface EditableContent {
  heroTitle: string;
  heroSubtitle: string;
  earlyBirdText: string;
  footerPhone: string;
  footerShipping: string;
  upgradeNudge: string;
}

const defaults: EditableContent = {
  heroTitle: "The Planner That Turns Serious Students Into Toppers",
  heroSubtitle:
    "100-page Premium Exam Success Kit. Eco-friendly. India-made. Designed to get you results.",
  earlyBirdText: "First 20 orders get ₹50 off!",
  footerPhone: "+91 9999999999",
  footerShipping: "Ships in 2–3 days",
  upgradeNudge:
    "Only ₹100 more for Premium. Only ₹200 more for Elite. Most students upgrade.",
};

function loadContent(): EditableContent {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaults, ...JSON.parse(raw) };
  } catch {
    // ignore
  }
  return defaults;
}

/** Read-only hook — gets current editable content from localStorage. */
export function useEditableContent(): EditableContent {
  const [content] = useState<EditableContent>(loadContent);
  return content;
}

/** Read-write hook — for the admin edit panel. */
export function useEditableContentAdmin() {
  const [content, setContent] = useState<EditableContent>(loadContent);

  const save = useCallback((newContent: EditableContent) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newContent));
    setContent(newContent);
  }, []);

  return { content, save };
}
