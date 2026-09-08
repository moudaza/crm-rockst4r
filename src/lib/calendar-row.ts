export type CalendarRow =
  | {
      source: "crm";
      id: string;
      startsAt: string;
      endsAt: string;
      status: "PRE_RESERVED" | "CONFIRMED" | "EXPIRED" | "CANCELLED";
      expiresAt: string | null;
      serviceName: string;
      contactName: string;
    }
  | {
      source: "google";
      id: string;
      startsAt: string;
      endsAt: string;
      summary: string;
    };
