export interface CalendarInterviewPayload {
  id?: string;
  candidateName: string;
  jobTitle: string;
  company?: string;
  date: string;
  time: string;
  type?: string;
  notes?: string;
}

export interface CalendarSyncResult {
  provider: "webhook" | "disabled";
  status: "synced" | "skipped" | "failed";
  eventId?: string;
  eventUrl?: string;
  syncedAt?: string;
  error?: string;
}

const CALENDAR_SYNC_WEBHOOK_URL = process.env.CALENDAR_SYNC_WEBHOOK_URL;

export const syncInterviewToCalendar = async (
  interview: CalendarInterviewPayload,
): Promise<CalendarSyncResult> => {
  if (!CALENDAR_SYNC_WEBHOOK_URL) {
    return {
      provider: "disabled",
      status: "skipped",
      error: "CALENDAR_SYNC_WEBHOOK_URL not configured",
    };
  }

  try {
    const response = await fetch(CALENDAR_SYNC_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "jobsphere",
        action: "upsert_interview_event",
        interview,
      }),
    });

    const data = (await response.json().catch(() => ({}))) as {
      eventId?: string;
      eventUrl?: string;
      id?: string;
      url?: string;
      error?: string;
      message?: string;
    };

    if (!response.ok) {
      return {
        provider: "webhook",
        status: "failed",
        error: data.error || data.message || `Calendar webhook failed with ${response.status}`,
      };
    }

    return {
      provider: "webhook",
      status: "synced",
      eventId: data.eventId || data.id,
      eventUrl: data.eventUrl || data.url,
      syncedAt: new Date().toISOString(),
    };
  } catch (err) {
    return {
      provider: "webhook",
      status: "failed",
      error: err instanceof Error ? err.message : "Unknown calendar sync error",
    };
  }
};

export const defaultInterviewRounds = (type = "Technical") => [
  {
    name: "HR Screening",
    description: "Role fit, background, and availability alignment.",
    status: "completed",
    order: 1,
    coachPrompt: "Tell me about yourself and why this role is a fit.",
  },
  {
    name: `${type} Challenge`,
    description: `${type} interview preparation and skills validation.`,
    status: "active",
    order: 2,
    coachPrompt: "Walk through your approach before solving the problem.",
  },
  {
    name: "System Design",
    description: "Architecture, trade-offs, and scaling discussion.",
    status: "locked",
    order: 3,
    coachPrompt: "Design a scalable service and explain the bottlenecks.",
  },
  {
    name: "Placement Offer",
    description: "Compensation, benefits, and joining logistics.",
    status: "locked",
    order: 4,
    coachPrompt: "Practice negotiating the complete offer package.",
  },
];
