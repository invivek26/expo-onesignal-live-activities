export type LiveActivityInfo = {
  id: string;
  resolvedActivityId: string | null;
  pushToken: string | null;
  attributes: Record<string, unknown>;
  contentState: Record<string, unknown>;
};

export type LiveActivityTokenEvent = {
  activityId: string;
  token: string;
};

export type ContentStateUpdate = Record<string, unknown>;
