// src/services/unifiedProfileService.ts
type ManagerInfo = {
  managerUid: string;
  managerName: string;
};

export async function getManagerFromUnifiedProfile(
  email: string
): Promise<{ managerUid: string; managerName: string } | null> {
  const url = `https://w3-unified-profile-api.ibm.com/v3/profiles/${encodeURIComponent(
    email
  )}`;

  console.log("[UnifiedProfile] Fetching URL:", url);

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.W3_UNIFIED_PROFILE_TOKEN ?? ""}`,
        Accept: "application/json",
      },
    });

    console.log("[UnifiedProfile] Response status:", res.status);

    if (!res.ok) {
      console.warn("[UnifiedProfile] Non-OK response");
      return null;
    }

    const data = await res.json();

    console.log(
      "[UnifiedProfile] Response JSON:",
      JSON.stringify(data, null, 2)
    );

    const profile = data?.profiles?.[0];
    const manager = profile?.content?.functionalManager;

    if (!manager?.uid || !manager?.nameDisplay) {
      console.warn("[UnifiedProfile] functionalManager missing or incomplete");
      return null;
    }

    return {
      managerUid: manager.uid,
      managerName: manager.nameDisplay,
    };
  } catch (err) {
    console.error("[UnifiedProfile] Fetch failed:", err);
    return null;
  }
}
