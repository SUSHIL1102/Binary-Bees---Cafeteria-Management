// src/services/unifiedProfileService.ts
type ManagerInfo = {
  managerUid: string;
  managerName: string;
};

export async function getManagerFromUnifiedProfile(
  email: string
): Promise<ManagerInfo | null> {
  try {
    const url = `https://w3-unified-profile-api.ibm.com/v3/profiles/${encodeURIComponent(
      email
    )}`;

    const res = await fetch(url, {
      headers: {
        // TODO: replace with real token
        Authorization: `Bearer ${process.env.W3_UNIFIED_PROFILE_TOKEN ?? ""}`,
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      console.warn(
        "[UnifiedProfile] Non-200 response:",
        res.status
      );
      return null;
    }

    const data = await res.json();

    const manager = data?.functionalManager;
    if (!manager?.uid || !manager?.nameDisplay) {
      return null;
    }

    return {
      managerUid: manager.uid,
      managerName: manager.nameDisplay,
    };
  } catch (err) {
    console.warn("[UnifiedProfile] Failed to fetch manager info", err);
    return null;
  }
}
