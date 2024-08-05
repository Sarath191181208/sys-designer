import type { Server } from "@sveltejs/kit";

export type RoutingStrategy = "ROUND_ROBIN" | "LEAST_CONNECTIONS" | "IP_HASH";

export type LoadBalancer = {
  servers: Server[]; 
  currentServerIndex: number; 
  routingStrategy: RoutingStrategy;
}

