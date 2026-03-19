import translate from "google-translate-api-x";

export async function translateToEnglish(text: string): Promise<string> {
  if (!text || !text.trim()) return "";
  try {
    const res = await translate(text, { from: "ko", to: "en" });
    return res.text;
  } catch (e) {
    console.error("Translation failed:", e);
    return "";
  }
}

export async function translateToKorean(text: string): Promise<string> {
  if (!text || !text.trim()) return "";
  try {
    const res = await translate(text, { from: "en", to: "ko" });
    return res.text;
  } catch (e) {
    console.error("Translation failed:", e);
    return "";
  }
}
