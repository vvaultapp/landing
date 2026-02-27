import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (payload: unknown, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

type TokenRow = {
  id: string;
  workspace_id: string;
  user_id: string;
  access_token: string | null;
  refresh_token: string | null;
  token_expires_at: string | null;
  updated_at: string | null;
};

type ConnectedCalendarRow = {
  id: string;
  calendar_id: string;
};

async function loadConnectedCalendar(
  admin: ReturnType<typeof createClient>,
  workspaceId: string,
): Promise<ConnectedCalendarRow | null> {
  const { data, error } = await admin
    .from("connected_google_calendars")
    .select("id,calendar_id,primary_calendar,updated_at")
    .eq("workspace_id", workspaceId)
    .order("primary_calendar", { ascending: false })
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.warn("Failed to load connected calendar:", error);
    return null;
  }

  const id = data?.id ? String(data.id) : "";
  const calendarId = data?.calendar_id ? String(data.calendar_id) : "";
  if (!id || !calendarId) return null;
  return { id, calendar_id: calendarId };
}

async function loadConnectedCalendarId(
  admin: ReturnType<typeof createClient>,
  workspaceId: string,
): Promise<string | null> {
  const row = await loadConnectedCalendar(admin, workspaceId);
  return row?.calendar_id || null;
}

async function markCalendarSyncStatus(
  admin: ReturnType<typeof createClient>,
  calendarDbId: string,
  status: "ok" | "error",
  errorMessage: string | null = null,
) {
  try {
    await admin
      .from("connected_google_calendars")
      .update({
        last_synced_at: new Date().toISOString(),
        last_sync_status: status,
        last_sync_error: errorMessage,
      })
      .eq("id", calendarDbId);
  } catch (err) {
    console.warn("Failed to update calendar sync status:", err);
  }
}

async function refreshAccessToken(refreshToken: string) {
  const clientId = Deno.env.get("GOOGLE_CLIENT_ID");
  const clientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET");

  if (!clientId || !clientSecret) {
    console.error("Missing GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET");
    return null;
  }

  try {
    const refreshRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!refreshRes.ok) {
      const errorText = await refreshRes.text();
      console.error("Google refresh token error:", errorText);
      return null;
    }

    return await refreshRes.json();
  } catch (error) {
    console.error("Token refresh failed:", error);
    return null;
  }
}

async function ensureWorkspaceMember(userClient: any, workspaceId: string, userId: string) {
  const { data, error } = await userClient
    .from("workspace_members")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    throw new Error("Not a workspace member");
  }
}

function pickTokenRow(rows: TokenRow[], userId: string): TokenRow | null {
  if (!Array.isArray(rows) || rows.length === 0) return null;

  // Prefer the current user's row only when it's actually usable (has refresh token or a clearly valid access token).
  // Otherwise fall back to any row in the workspace that has a refresh token so we can keep syncing.
  const owned = rows.find((row) => String(row.user_id) === String(userId)) || null;
  const withRefresh = rows.find((row) => !!row.refresh_token) || null;

  if (owned) {
    const ownedHasRefresh = Boolean(owned.refresh_token);
    const ownedExpiresAt = owned.token_expires_at ? new Date(owned.token_expires_at).getTime() : 0;
    const ownedExpiresSoon = !ownedExpiresAt || ownedExpiresAt - 5 * 60 * 1000 <= Date.now();

    // If owned has a refresh token, it's the best candidate.
    if (ownedHasRefresh) return owned;

    // If owned has an access token that doesn't look expired, use it.
    if (owned.access_token && !ownedExpiresSoon) return owned;
  }

  if (withRefresh) return withRefresh;
  return owned || rows[0];
}

async function loadTokenRows(admin: any, workspaceId: string): Promise<TokenRow[]> {
  const { data, error } = await admin
    .from("google_calendar_tokens")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("updated_at", { ascending: false })
    .limit(50);

  if (error || !Array.isArray(data)) return [];
  return data as TokenRow[];
}

async function upsertWorkspaceToken(
  admin: any,
  workspaceId: string,
  userId: string,
  accessToken: string,
  refreshToken?: string | null,
) {
  const rows = await loadTokenRows(admin, workspaceId);
  const ownRow = rows.find((row) => String(row.user_id) === String(userId));
  const fallbackRefresh = rows.find((row) => !!row.refresh_token)?.refresh_token || null;
  const refreshTokenToStore = refreshToken || ownRow?.refresh_token || fallbackRefresh || null;

  await admin
    .from("google_calendar_tokens")
    .upsert(
      {
        workspace_id: workspaceId,
        user_id: userId,
        access_token: accessToken,
        refresh_token: refreshTokenToStore,
        token_expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
      },
      { onConflict: "workspace_id,user_id" },
    );
}

async function getAccessToken(
  admin: any,
  workspaceId: string,
  userId: string,
  forceRefresh = false,
  refreshTokenOverride?: string | null,
): Promise<string | null> {
  const rows = await loadTokenRows(admin, workspaceId);
  const tokenRow = pickTokenRow(rows, userId);

  if (!tokenRow && !refreshTokenOverride) return null;

  const expiresAt = tokenRow?.token_expires_at ? new Date(tokenRow.token_expires_at).getTime() : 0;
  const expiresSoon = !expiresAt || expiresAt - 5 * 60 * 1000 <= Date.now();
  const effectiveRefreshToken = refreshTokenOverride || tokenRow?.refresh_token || null;

  if (effectiveRefreshToken && (forceRefresh || expiresSoon || !tokenRow?.access_token)) {
    const refreshed = await refreshAccessToken(String(effectiveRefreshToken));
    if (refreshed?.access_token) {
      if (tokenRow?.id) {
        await admin
          .from("google_calendar_tokens")
          .update({
            access_token: refreshed.access_token,
            refresh_token: refreshed.refresh_token ?? tokenRow.refresh_token ?? effectiveRefreshToken,
            token_expires_at: new Date(Date.now() + Number(refreshed.expires_in || 3600) * 1000).toISOString(),
          })
          .eq("id", tokenRow.id);
      } else {
        await upsertWorkspaceToken(
          admin,
          workspaceId,
          userId,
          refreshed.access_token,
          refreshed.refresh_token ?? String(effectiveRefreshToken),
        );
      }
      return refreshed.access_token;
    }

    // If refresh failed, fall back to any existing access token instead of hard-failing.
    // The downstream Google API call will validate it and return 401 if it is truly expired.
    if (tokenRow?.access_token) {
      return tokenRow.access_token;
    }
  }

  // Even if it expires soon, try the existing token; list-events will attempt refresh on 401.
  if (tokenRow?.access_token) return tokenRow.access_token;

  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "No authorization header" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    if (!supabaseUrl || !anonKey || !serviceKey) {
      return json({ error: "Missing Supabase env configuration" }, 500);
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const admin = createClient(supabaseUrl, serviceKey);

    const {
      data: { user },
      error: authError,
    } = await userClient.auth.getUser();

    if (authError || !user) {
      console.error("Auth error:", authError);
      return json({ error: "Unauthorized" }, 401);
    }

    const body = await req.json();
    const { action, providerToken, providerRefreshToken, workspaceId } = body || {};

    if (!action) return json({ error: "Missing action" }, 400);
    if (!workspaceId) return json({ error: "Missing workspaceId" }, 400);

    await ensureWorkspaceMember(userClient, String(workspaceId), user.id);

    console.log(`Google Calendar action: ${action}, user: ${user.id}, workspace: ${workspaceId}`);

    switch (action) {
      case "connect-oauth": {
        if (!providerToken) {
          return json({ error: "Missing providerToken" }, 400);
        }

        const calendarListUrl = "https://www.googleapis.com/calendar/v3/users/me/calendarList";
        let accessTokenToUse: string | null = String(providerToken);

        const fetchCalendarList = async (token: string) => {
          const res = await fetch(calendarListUrl, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const text = await res.text();
          let data: any = null;
          try {
            data = text ? JSON.parse(text) : null;
          } catch {
            data = { raw: text };
          }
          return { res, data };
        };

        let { res: calendarRes, data: calendarData } = await fetchCalendarList(accessTokenToUse);

        if (!calendarRes.ok && calendarRes.status === 401) {
          const refreshedToken =
            (await getAccessToken(admin, String(workspaceId), user.id, true, providerRefreshToken || null)) ||
            (providerRefreshToken
              ? (await refreshAccessToken(String(providerRefreshToken)))?.access_token || null
              : null);

          if (refreshedToken) {
            accessTokenToUse = refreshedToken;
            const retry = await fetchCalendarList(accessTokenToUse);
            calendarRes = retry.res;
            calendarData = retry.data;
          }
        }

        if (!calendarRes.ok) {
          console.error("Google Calendar API error:", calendarData);
          return json({ error: "Failed to fetch your Google Calendar. Please reconnect." }, 401);
        }

        if (!calendarData.items?.length) {
          return json({ error: "No calendars found for this account" }, 404);
        }

        const primaryCalendar = calendarData.items.find((cal: any) => cal.primary) || calendarData.items[0];
        const calendarId = primaryCalendar.id;

        if (accessTokenToUse) {
          await upsertWorkspaceToken(
            admin,
            String(workspaceId),
            user.id,
            accessTokenToUse,
            providerRefreshToken || null,
          );
        }

        const { data: existing } = await admin
          .from("connected_google_calendars")
          .select("id")
          .eq("workspace_id", workspaceId)
          .eq("calendar_id", calendarId)
          .maybeSingle();

        if (existing) {
          return json({ success: true, calendar: existing, alreadyConnected: true });
        }

        const { data: calendar, error: insertError } = await admin
          .from("connected_google_calendars")
          .insert({
            workspace_id: workspaceId,
            calendar_id: calendarId,
            summary: primaryCalendar.summary,
            description: primaryCalendar.description,
            time_zone: primaryCalendar.timeZone,
            access_role: primaryCalendar.accessRole,
            primary_calendar: primaryCalendar.primary || false,
          })
          .select()
          .single();

        if (insertError) {
          console.error("Insert calendar error:", insertError);
          return json({ error: "Failed to save calendar" }, 500);
        }

        return json({ success: true, calendar });
      }

      case "disconnect": {
        const { calendarDbId } = body;
        if (!calendarDbId) {
          return json({ error: "Missing calendarDbId" }, 400);
        }

        await admin
          .from("connected_google_calendars")
          .delete()
          .eq("id", calendarDbId)
          .eq("workspace_id", workspaceId);

        await admin
          .from("google_calendar_tokens")
          .delete()
          .eq("workspace_id", workspaceId)
          .eq("user_id", user.id);

        return json({ success: true });
      }

      case "list-events": {
        const calendarId = await loadConnectedCalendarId(admin, String(workspaceId));
        if (!calendarId) {
          return json({ events: [], message: "No calendar connected" });
        }

        let accessToken = await getAccessToken(
          admin,
          String(workspaceId),
          user.id,
          false,
          providerRefreshToken || null,
        );

        if (!accessToken && providerToken) {
          accessToken = String(providerToken);
          await upsertWorkspaceToken(
            admin,
            String(workspaceId),
            user.id,
            accessToken,
            providerRefreshToken || null,
          );
        }

        if (!accessToken) {
          return json(
            {
              events: [],
              error: "token_expired",
              message: "Google Calendar needs a quick reconnect to continue syncing.",
            },
            401,
          );
        }

        const { timeMin, timeMax, maxResults = 50 } = body;
        const now = new Date();
        const defaultTimeMin = timeMin || now.toISOString();
        const defaultTimeMax = timeMax || new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

        const eventsUrl = new URL(
          `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
        );
        eventsUrl.searchParams.set("timeMin", defaultTimeMin);
        eventsUrl.searchParams.set("timeMax", defaultTimeMax);
        eventsUrl.searchParams.set("maxResults", String(maxResults));
        eventsUrl.searchParams.set("singleEvents", "true");
        eventsUrl.searchParams.set("orderBy", "startTime");
        // Ensure conferenceData is returned so we can extract Google Meet join links reliably.
        eventsUrl.searchParams.set("conferenceDataVersion", "1");
        // Keep payload minimal.
        eventsUrl.searchParams.set(
          "fields",
          "items(id,summary,description,start,end,location,status,hangoutLink,conferenceData(entryPoints(entryPointType,uri))),nextPageToken",
        );

        const eventsRes = await fetch(eventsUrl.toString(), {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!eventsRes.ok) {
          const errorText = await eventsRes.text();
          console.error("Google Calendar events error:", errorText);

          if (eventsRes.status === 401) {
            const refreshed = await getAccessToken(
              admin,
              String(workspaceId),
              user.id,
              true,
              providerRefreshToken || null,
            );

            if (refreshed) {
              const retryRes = await fetch(eventsUrl.toString(), {
                headers: { Authorization: `Bearer ${refreshed}` },
              });
              if (retryRes.ok) {
                const retryData = await retryRes.json();
                return json({
                  events: retryData.items || [],
                  nextPageToken: retryData.nextPageToken,
                });
              }
            }

            return json(
              {
                events: [],
                error: "token_expired",
                message: "Google Calendar needs a quick reconnect to continue syncing.",
              },
              401,
            );
          }

          return json({ events: [], error: "Failed to fetch events" });
        }

        const eventsData = await eventsRes.json();
        return json({
          events: eventsData.items || [],
          nextPageToken: eventsData.nextPageToken,
        });
      }

      case "sync-workspace-events": {
        const connectedCalendar = await loadConnectedCalendar(admin, String(workspaceId));
        if (!connectedCalendar) {
          return json({ success: true, inserted: 0, updated: 0, skipped_no_link: 0, skipped_no_time: 0, cancelled_updated: 0, message: "No calendar connected" });
        }

        let accessToken = await getAccessToken(
          admin,
          String(workspaceId),
          user.id,
          false,
          providerRefreshToken || null,
        );

        if (!accessToken && providerToken) {
          accessToken = String(providerToken);
          await upsertWorkspaceToken(
            admin,
            String(workspaceId),
            user.id,
            accessToken,
            providerRefreshToken || null,
          );
        }

        if (!accessToken) {
          await markCalendarSyncStatus(
            admin,
            connectedCalendar.id,
            "error",
            "token_expired",
          );
          return json(
            {
              success: false,
              error: "token_expired",
              message: "Google Calendar needs a quick reconnect to continue syncing.",
            },
            401,
          );
        }

        const timeMin =
          body?.timeMin || new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
        const timeMax =
          body?.timeMax || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
        const maxResults = Number(body?.maxResults || 250);

        const eventsUrl = new URL(
          `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
            connectedCalendar.calendar_id,
          )}/events`,
        );
        eventsUrl.searchParams.set("timeMin", String(timeMin));
        eventsUrl.searchParams.set("timeMax", String(timeMax));
        eventsUrl.searchParams.set("maxResults", String(maxResults));
        eventsUrl.searchParams.set("singleEvents", "true");
        eventsUrl.searchParams.set("orderBy", "startTime");
        eventsUrl.searchParams.set("conferenceDataVersion", "1");
        eventsUrl.searchParams.set(
          "fields",
          "items(id,summary,description,start,end,location,status,hangoutLink,conferenceData(entryPoints(entryPointType,uri))),nextPageToken",
        );

        const fetchEvents = async (token: string) =>
          fetch(eventsUrl.toString(), {
            headers: { Authorization: `Bearer ${token}` },
          });

        let eventsRes = await fetchEvents(accessToken);
        if (!eventsRes.ok && eventsRes.status === 401) {
          const refreshed = await getAccessToken(
            admin,
            String(workspaceId),
            user.id,
            true,
            providerRefreshToken || null,
          );
          if (refreshed) {
            eventsRes = await fetchEvents(refreshed);
          }
        }

        if (!eventsRes.ok) {
          const errorText = await eventsRes.text();
          console.error("Google Calendar sync events error:", errorText);
          const isTokenError = eventsRes.status === 401;
          await markCalendarSyncStatus(
            admin,
            connectedCalendar.id,
            "error",
            isTokenError ? "token_expired" : "google_fetch_failed",
          );
          if (isTokenError) {
            return json(
              {
                success: false,
                error: "token_expired",
                message: "Google Calendar needs a quick reconnect to continue syncing.",
              },
              401,
            );
          }
          return json({ success: false, error: "Failed to fetch events" }, 500);
        }

        const eventsPayload = await eventsRes.json();
        const events = Array.isArray(eventsPayload?.items) ? eventsPayload.items : [];

        const { data: existingRows, error: existingError } = await admin
          .from("meetings")
          .select("id,google_event_id,title,description,start_time,end_time,location,meeting_link,status")
          .eq("workspace_id", workspaceId)
          .not("google_event_id", "is", null);

        if (existingError) {
          console.error("Failed loading existing meetings for sync:", existingError);
          await markCalendarSyncStatus(
            admin,
            connectedCalendar.id,
            "error",
            "load_existing_failed",
          );
          return json({ success: false, error: "Failed to load existing meetings" }, 500);
        }

        const existingByGoogleId = new Map<string, any>();
        for (const row of Array.isArray(existingRows) ? existingRows : []) {
          const key = row?.google_event_id ? String(row.google_event_id) : "";
          if (!key) continue;
          existingByGoogleId.set(key, row);
        }

        const normalizeIso = (value: string | null | undefined) => {
          if (!value) return null;
          const dt = new Date(value);
          if (!Number.isFinite(dt.getTime())) return null;
          return dt.toISOString();
        };

        const updates: Array<{ id: string; patch: Record<string, unknown>; cancelledChanged: boolean }> = [];
        const inserts: Array<Record<string, unknown>> = [];
        let skippedNoLink = 0;
        let skippedNoTime = 0;
        let cancelledUpdated = 0;

        for (const event of events) {
          const eventId = event?.id ? String(event.id) : "";
          if (!eventId) continue;

          const startTime = event?.start?.dateTime || (event?.start?.date ? `${event.start.date}T00:00:00` : null);
          const endTime = event?.end?.dateTime || (event?.end?.date ? `${event.end.date}T23:59:59` : null);
          if (!startTime || !endTime) {
            skippedNoTime += 1;
            continue;
          }

          const meetLink =
            event?.conferenceData?.entryPoints?.find((ep: any) => ep?.entryPointType === "video")?.uri ||
            event?.hangoutLink ||
            null;

          if (!meetLink) {
            skippedNoLink += 1;
            continue;
          }

          const nextStatus = event?.status === "cancelled" ? "cancelled" : "scheduled";
          const nextTitle = event?.summary ? String(event.summary) : "Untitled Event";
          const nextDescription = event?.description ? String(event.description) : null;
          const nextLocation = event?.location ? String(event.location) : null;

          const existing = existingByGoogleId.get(eventId);
          if (!existing) {
            inserts.push({
              workspace_id: workspaceId,
              created_by: user.id,
              title: nextTitle,
              description: nextDescription,
              start_time: startTime,
              end_time: endTime,
              location: nextLocation,
              meeting_link: String(meetLink),
              google_event_id: eventId,
              status: nextStatus,
            });
            continue;
          }

          const changed =
            String(existing.title || "") !== nextTitle ||
            String(existing.description || "") !== String(nextDescription || "") ||
            normalizeIso(existing.start_time) !== normalizeIso(startTime) ||
            normalizeIso(existing.end_time) !== normalizeIso(endTime) ||
            String(existing.location || "") !== String(nextLocation || "") ||
            String(existing.meeting_link || "") !== String(meetLink || "") ||
            String(existing.status || "scheduled") !== nextStatus;

          if (!changed) continue;

          const cancelledChanged =
            String(existing.status || "scheduled") !== "cancelled" && nextStatus === "cancelled";
          if (cancelledChanged) cancelledUpdated += 1;

          updates.push({
            id: String(existing.id),
            patch: {
              title: nextTitle,
              description: nextDescription,
              start_time: startTime,
              end_time: endTime,
              location: nextLocation,
              meeting_link: String(meetLink),
              status: nextStatus,
            },
            cancelledChanged,
          });
        }

        if (updates.length > 0) {
          const settled = await Promise.allSettled(
            updates.map((u) =>
              admin.from("meetings").update(u.patch).eq("id", u.id),
            ),
          );
          const rejected = settled.find((r) => r.status === "rejected");
          if (rejected) {
            console.error("Meeting sync update failed:", rejected);
            await markCalendarSyncStatus(
              admin,
              connectedCalendar.id,
              "error",
              "update_failed",
            );
            return json({ success: false, error: "Failed to update synced meetings" }, 500);
          }

          const failedResult = settled.find(
            (r) => r.status === "fulfilled" && (r.value as any)?.error,
          ) as PromiseFulfilledResult<any> | undefined;
          if (failedResult?.value?.error) {
            console.error("Meeting sync update error:", failedResult.value.error);
            await markCalendarSyncStatus(
              admin,
              connectedCalendar.id,
              "error",
              "update_failed",
            );
            return json({ success: false, error: "Failed to update synced meetings" }, 500);
          }
        }

        if (inserts.length > 0) {
          const { error: insertError } = await admin.from("meetings").insert(inserts);
          if (insertError) {
            console.error("Meeting sync insert error:", insertError);
            await markCalendarSyncStatus(
              admin,
              connectedCalendar.id,
              "error",
              "insert_failed",
            );
            return json({ success: false, error: "Failed to insert synced meetings" }, 500);
          }
        }

        await markCalendarSyncStatus(admin, connectedCalendar.id, "ok", null);

        return json({
          success: true,
          inserted: inserts.length,
          updated: updates.length,
          skipped_no_link: skippedNoLink,
          skipped_no_time: skippedNoTime,
          cancelled_updated: cancelledUpdated,
        });
      }

      case "create-event": {
        const { event, addMeet = false, attendees = [] } = body;
        if (!event?.summary || !event?.start || !event?.end) {
          return json({ error: "Missing event details" }, 400);
        }

        const calendarId = await loadConnectedCalendarId(admin, String(workspaceId));
        if (!calendarId) {
          return json({ error: "No calendar connected" }, 400);
        }

        let accessToken = await getAccessToken(
          admin,
          String(workspaceId),
          user.id,
          false,
          providerRefreshToken || null,
        );
        if (!accessToken && providerToken) {
          accessToken = String(providerToken);
        }

        if (!accessToken) {
          return json({ error: "No valid access token. Please reconnect Google Calendar." }, 401);
        }

        const googleEvent: any = {
          summary: event.summary,
          description: event.description || "",
          start: event.start,
          end: event.end,
          location: event.location || "",
        };

        if (attendees.length > 0) {
          googleEvent.attendees = attendees.map((email: string) => ({ email }));
        }

        if (addMeet) {
          googleEvent.conferenceData = {
            createRequest: {
              requestId: `meet-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
              conferenceSolutionKey: { type: "hangoutsMeet" },
            },
          };
        }

        const createUrl = new URL(
          `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
        );
        if (addMeet) {
          createUrl.searchParams.set("conferenceDataVersion", "1");
        }
        createUrl.searchParams.set("sendUpdates", "all");

        const createRes = await fetch(createUrl.toString(), {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(googleEvent),
        });

        if (!createRes.ok) {
          const errorText = await createRes.text();
          console.error("Google Calendar create event error:", errorText);

          if (createRes.status === 401) {
            const refreshed = await getAccessToken(
              admin,
              String(workspaceId),
              user.id,
              true,
              providerRefreshToken || null,
            );
            if (refreshed) {
              const retryRes = await fetch(createUrl.toString(), {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${refreshed}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(googleEvent),
              });

              if (retryRes.ok) {
                const createdEvent = await retryRes.json();
                const meetLink = createdEvent.conferenceData?.entryPoints?.find(
                  (ep: any) => ep.entryPointType === "video",
                )?.uri;
                return json({
                  success: true,
                  event: createdEvent,
                  meetLink: meetLink || createdEvent.hangoutLink || null,
                  googleEventId: createdEvent.id,
                  htmlLink: createdEvent.htmlLink,
                });
              }
            }
          }

          return json({ error: "Failed to create event in Google Calendar" }, 500);
        }

        const createdEvent = await createRes.json();
        const meetLink = createdEvent.conferenceData?.entryPoints?.find(
          (ep: any) => ep.entryPointType === "video",
        )?.uri;

        return json({
          success: true,
          event: createdEvent,
          meetLink: meetLink || createdEvent.hangoutLink || null,
          googleEventId: createdEvent.id,
          htmlLink: createdEvent.htmlLink,
        });
      }

      case "delete-event": {
        const { googleEventId } = body;
        if (!googleEventId) {
          return json({ error: "Missing googleEventId" }, 400);
        }

        const calendarId = await loadConnectedCalendarId(admin, String(workspaceId));
        if (!calendarId) {
          return json({ error: "No calendar connected" }, 400);
        }

        let accessToken = await getAccessToken(
          admin,
          String(workspaceId),
          user.id,
          false,
          providerRefreshToken || null,
        );
        if (!accessToken && providerToken) {
          accessToken = String(providerToken);
        }

        if (!accessToken) {
          return json({ error: "No valid access token" }, 401);
        }

        const deleteUrl =
          `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${googleEventId}`;

        const deleteRes = await fetch(deleteUrl, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!deleteRes.ok && deleteRes.status !== 404) {
          const errorText = await deleteRes.text();
          console.error("Google Calendar delete event error:", errorText);

          if (deleteRes.status === 401) {
            const refreshed = await getAccessToken(
              admin,
              String(workspaceId),
              user.id,
              true,
              providerRefreshToken || null,
            );
            if (refreshed) {
              const retryRes = await fetch(deleteUrl, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${refreshed}` },
              });
              if (retryRes.ok || retryRes.status === 404) {
                return json({ success: true });
              }
            }
          }

          return json({ error: "Failed to delete event" }, 500);
        }

        return json({ success: true });
      }

      default:
        return json({ error: "Invalid action" }, 400);
    }
  } catch (error) {
    console.error("Google Calendar error:", error);
    return json({ error: error instanceof Error ? error.message : "Internal server error" }, 500);
  }
});
