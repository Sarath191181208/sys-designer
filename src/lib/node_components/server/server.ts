export type ServerStatus = "ONLINE" | "OFFLINE" | "BOOTING" | "SHUTTING_DOWN";

export type Server = {
  address: string;
  port: number;
  ram: number;
  cpu: number;
  failureRate: number;
  status: ServerStatus;
};
