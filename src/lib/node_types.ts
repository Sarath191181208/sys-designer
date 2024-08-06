export const NODE_TYPES = {
  server: "Server",
  client: "Client",
  load_balancer: "Load Balancer",
} as const;
export type NodeType = typeof NODE_TYPES[keyof typeof NODE_TYPES];
