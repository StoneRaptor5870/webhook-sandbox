export interface IpRegistry {
  ip: String;
  firstSeen: Date;
  lastSeen: Date;
  usageCount: Number;
  isBlocked: Boolean;
  convertedToUser: Boolean;
  userId?: String;
}

export interface Endpoint {
  id: String;
  slug: String;
  createdAt: Date;
  expiresAt: Date;
  name: String;
  description?: String;
  isPersistent: Boolean;
  ownerId?: String;
  wasAnonymous: Boolean;
  isPrivate: Boolean;
  hasCustomDomain: Boolean;
}

export interface TxnResult {
  ip: IpRegistry;
  Endpoint: Endpoint;
}