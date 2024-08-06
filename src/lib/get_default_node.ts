import type { MobileClient } from "./node_components/client/mobile";
import type { LoadBalancer } from "./node_components/server/load_balancer";
import type { Server } from "./node_components/server/server";

	export const getNewDefaultServer = () => {
		const server: Server = {
			address: '192.168.10.10',
			port: 5000,
			ram: 1024 * 2,
			cpu: 1.5,
			failureRate: 0.01,
			status: 'ONLINE'
		};
		return server;
	};

	export const getNewDefaultClient = () => {
		const client: MobileClient = {};
		return client;
	};

	export const getNewDefaultLoadBalancer = () => {
		const loadBalancer: LoadBalancer = {
			servers: [],
			currentServerIndex: -1,
			routingStrategy: 'ROUND_ROBIN'
		};
		return loadBalancer;
	};
