<script lang="ts">
	import { writable } from 'svelte/store';
	import {
		SvelteFlow,
		Controls,
		Background,
		BackgroundVariant,
		MiniMap,
		type Node,
		type Edge
	} from '@xyflow/svelte';

	import '@xyflow/svelte/dist/style.css';
	import type { Server } from '$lib/node_components/server/server';
	import type { LoadBalancer } from '$lib/node_components/server/load_balancer';
	import type { MobileClient } from '$lib/node_components/client/mobile';

	import { getUID } from './getUID';
	import QueueNode from '../components/QueueNode.svelte';

	const nodes = writable<Node[]>([]);
	const edges = writable<Edge[]>([]);

	const nodeTypes = {
		selectorNode: QueueNode
	};

	const VISUAL_NODE_TYPES = {
		selectorNode: 'selectorNode'
	};

	let rerenderConstant = 0;

	const runSimulation = (parentsList: Node[], visited: string[]) => {
		if (parentsList.length === 0) return;
		const localNodes = $nodes;

		// make all the edges normal i.e animated false
		edges.update((prev) => prev.map((edge) => ({ ...edge, animated: false })));

		const newParentsList: Node[] = [];
		// get all the connected nodes to the parentsList
		for (const parent of parentsList) {
			const connectedEdges = $edges.filter((edge) => edge.source === parent.id);
			// go through the parent connected edges
			for (const edge of connectedEdges) {
				// get the other node id
				const otherNodeId = edge.source === parent.id ? edge.target : edge.source;
				// get the other node
				const node = localNodes.find((node) => node.id === otherNodeId);

				// if the node isn't visited animate and push it to the newParentsList
				if (node && !visited.includes(node.id)) {
					// check if parent node has requests
					if (((parent.data.requestsCount ?? 0) as number) <= 0) {
						continue;
					}
					// animate the edge
					edges.update((prev) =>
						prev.map((_edge) => (_edge.id === edge.id ? { ..._edge, animated: true } : _edge))
					);
					// push a single request to the destination server
          if(node.data.requestsCount === undefined) {
            node.data.requestsCount = writable<number>(0);
          }
          node.data.requestsCount.update((prev) => prev + 1);
					// remove a single request from the parent node
					// @ts-ignore
          parent.data.requestsCount.update((prev) => prev - 1);

					// push the node to the newParentsList
					newParentsList.push(node);
				}
			}
		}

		// if this is the end
		if (newParentsList.length === 0) {
			// remove all the requests from the nodes
			parentsList.forEach((node) => {
				node.data.requestsCount = writable<number>(0);
			});
		}


		// if requests are still left in parent push parents
		for (const parent of parentsList) {
      let count = 0;
      parent.data.requestsCount.subscribe((val) => {
        count = val;
      });
			if (count > 0) {
				newParentsList.push(parent);
			}
		}


		rerenderConstant++; // This is just to force a re-render
		nodes.set(localNodes);

		//runSimulation(newParentsList, visited);
		setTimeout(() => runSimulation(newParentsList, visited), 200);
	};

	const startSimulation = () => {
		const clientNodes = $nodes.filter((node) => node.id.includes(NODE_TYPES.client));
		runSimulation(clientNodes, []);
	};

	const NODE_TYPES = {
		server: 'server',
		client: 'client',
		load_balancer: 'load_balancer'
	};

	const addServer = () => {
		const server: Server = {
			address: '192.168.10.10',
			port: 5000,
			ram: 1024 * 2,
			cpu: 1.5,
			failureRate: 0.01,
			status: 'ONLINE'
		};
		const uid = getUID({ nodes: $nodes, nodeType: NODE_TYPES.server });

		const newServer: Node = {
			id: `${NODE_TYPES.server}-${uid + 1}`,
			type: VISUAL_NODE_TYPES.selectorNode,
			data: { label: `Server ${server.address}:${server.port}`, data: { server } },
			position: { x: 0, y: 0 }
		};

		nodes.update((prev) => [...prev, newServer]);
		return newServer;
	};

	const addClient = () => {
		const client: MobileClient = {};
		const uid = getUID({ nodes: $nodes, nodeType: NODE_TYPES.client });
		const newClient: Node = {
			id: `${NODE_TYPES.client}-${uid + 1}`,
			type: VISUAL_NODE_TYPES.selectorNode,
			data: { label: `Client ${uid + 1}`, requestsCount: writable<number>(5), data: { client } },
			position: { x: 0, y: 0 }
		};
		nodes.update((prev) => [...prev, newClient]);
		return newClient;
	};

	const addLoadBalancer = () => {
		const loadBalancer: LoadBalancer = {
			servers: [],
			currentServerIndex: -1,
			routingStrategy: 'ROUND_ROBIN'
		};
		const uid = getUID({ nodes: $nodes, nodeType: NODE_TYPES.load_balancer });
		const newLB: Node = {
			id: `${NODE_TYPES.load_balancer}-${uid + 1}`,
			type: VISUAL_NODE_TYPES.selectorNode,
			data: { label: `Load Balancer ${uid + 1}`, data: { loadBalancer } },
			position: { x: 0, y: 0 }
		};
		nodes.update((prev) => [...prev, newLB]);
		return newLB;
	};

	const snapGrid: [number, number] = [25, 25];

	// add initial nodes
	const s1 = addServer();
	const s2 = addServer();
	const c1 = addClient();
	const lb1 = addLoadBalancer();

	// chnage the position of the nodes
	c1.position = { x: 0, y: 0 };
	lb1.position = { x: 200, y: 0 };
	s1.position = { x: 400, y: 0 };
	s2.position = { x: 600, y: 0 };

	// connect the nodes
	edges.update((prev) => [
		...prev,
		{ id: 'edge-client1-lb1', source: 'client-1', target: 'load_balancer-1' },
		{ id: 'edge-lb-1-server1', source: 'load_balancer-1', target: 'server-1' },
		{ id: 'edge-s1-s2', source: 'server-1', target: 'server-2' }
	]);
</script>

{#key rerenderConstant}
	<div style:height="500px">
		<SvelteFlow
			{nodes}
			{edges}
			{nodeTypes}
			{snapGrid}
			fitView
			onconnect={(event) => {
				const { source, target } = event;
				const edge = { id: `edge-${source}-${target}`, source: source, target: target };
				const isSourceLoadBalancer = source.includes(NODE_TYPES.load_balancer);

				if (isSourceLoadBalancer) {
					const loadBalancerNode = $nodes.find((node) => node.id === source);
					// @ts-ignore
					const loadBalancer = loadBalancerNode?.data.data.loadBalancer;
					loadBalancer.servers.push(target);
				}

				edges.update((prev) => [...prev, edge]);
			}}
		>
			<Controls />
			<Background variant={BackgroundVariant.Dots} />
			<MiniMap />
		</SvelteFlow>
	</div>
{/key}

<div class="p-2 bg-gray-300">
	<button class="border-black border-2 p-2" on:click={() => addClient()}>Add Client</button>
	<button class="border-black border-2 p-2" on:click={() => addLoadBalancer()}
		>Add Load balancer</button
	>
	<button class="border-black border-2 p-2" on:click={() => addServer()}>Add Server</button>
	<button class="border-black border-2 p-2" on:click={() => startSimulation()}
		>Start Simulation</button
	>
</div>

<style lang="postcss">
	:global(html) {
		background-color: theme(colors.gray.100);
	}
</style>
