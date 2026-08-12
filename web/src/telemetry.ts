// web/src/telemetry.ts

export interface ConsentPreferences {
  essential: boolean; // always true
  analytics: boolean;
  functional: boolean;
  consentId: string;
  hasChoice: boolean;
}

const STORAGE_KEY = "wha_cookie_preferences";

export function getConsentPreferences(): ConsentPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        essential: true,
        analytics: Boolean(parsed.analytics),
        functional: Boolean(parsed.functional),
        consentId: parsed.consentId || getOrCreateConsentId(),
        hasChoice: true,
      };
    }
  } catch {}

  return {
    essential: true,
    analytics: false,
    functional: false,
    consentId: getOrCreateConsentId(),
    hasChoice: false,
  };
}

export async function saveConsentPreferences(analytics: boolean, functional: boolean): Promise<ConsentPreferences> {
  const consentId = getOrCreateConsentId();
  const prefs: ConsentPreferences = {
    essential: true,
    analytics,
    functional,
    consentId,
    hasChoice: true,
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {}

  // Sync preference with backend server
  try {
    await fetch("/api/cookies/preference", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        consent_id: consentId,
        essential: true,
        analytics,
        functional,
        marketing: false,
      }),
    });
  } catch (e) {
    console.warn("Failed to sync cookie preferences with server:", e);
  }

  return prefs;
}

function getOrCreateConsentId(): string {
  let id = "";
  try {
    id = localStorage.getItem("wha_consent_id") || "";
  } catch {}

  if (!id) {
    id = "c_" + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
    try {
      localStorage.setItem("wha_consent_id", id);
    } catch {}
  }
  return id;
}

export async function trackEvent(eventType: string, eventName: string, metadata: Record<string, any> = {}) {
  const prefs = getConsentPreferences();
  
  // If user has not consented to analytics, do NOT record non-essential telemetry events
  if (!prefs.analytics) {
    return;
  }

  try {
    await fetch("/api/telemetry/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        consent_id: prefs.consentId,
        event_type: eventType,
        event_name: eventName,
        page_url: window.location.href,
        metadata,
      }),
    });
  } catch (e) {
    // Silent fail for telemetry to avoid disrupting user experience
  }
}
