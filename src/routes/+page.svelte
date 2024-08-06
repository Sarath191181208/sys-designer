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
	import { getNewDefaultServer, getNewDefaultClient, getNewDefaultLoadBalancer } from '$lib/get_default_node';
  import { NODE_TYPES, type NodeType } from '$lib/node_types';

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
					if (node.data.requestsCount === undefined) {
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

		nodes.set(localNodes);

		//runSimulation(newParentsList, visited);
		setTimeout(() => runSimulation(newParentsList, visited), 200);
	};

	const startSimulation = () => {
		const clientNodes = $nodes.filter((node) => node.id.includes(NODE_TYPES.client));
		runSimulation(clientNodes, []);
	};

  const getFlowNode = (type: NodeType, nodeData: Record<string, any> )  => {
    const uid = getUID({nodes: $nodes, nodeType: type})
    return {
      id: `${type}-${uid + 1}`,
      type: VISUAL_NODE_TYPES.selectorNode,
      data: {
        label: `${type} ${uid + 1}`,
        requestsCount: writable<number>(0),
        config: {...nodeData, type: type}
      },
      position: { x: 0, y: 0}
    } 
  };

	const addServer = () => {
		const server: Server = getNewDefaultServer();
		const newServer = getFlowNode(NODE_TYPES.server, { server });
		nodes.update((prev) => [...prev, newServer]);
		return newServer;
	};

	const addClient = () => {
		const client: MobileClient = getNewDefaultClient();
    const newClient = getFlowNode(NODE_TYPES.client, { client });
    newClient.data.requestsCount = writable<number>(5);
		nodes.update((prev) => [...prev, newClient]);
		return newClient;
	};

	const addLoadBalancer = () => {
		const loadBalancer: LoadBalancer = getNewDefaultLoadBalancer();
    const newLB = getFlowNode(NODE_TYPES.load_balancer, { loadBalancer });
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
		{ id: 'edge-client1-lb1', source: 'Client-1', target: 'Load Balancer-1' },
		{ id: 'edge-lb-1-server1', source: 'Load Balancer-1', target: 'Server-1' },
		{ id: 'edge-s1-s2', source: 'Server-1', target: 'Server-2' }
	]);
</script>

<div style:height="500px">
	<SvelteFlow
		{nodes}
		{edges}
		{nodeTypes}
		{snapGrid}
		fitView
		onconnect={(event) => {
			const { source, target } = event;
			//const edge = last($edges);
			const isSourceLoadBalancer = source.includes(NODE_TYPES.load_balancer);
			if (isSourceLoadBalancer) {
				const loadBalancerNode = $nodes.find((node) => node.id === source);
				// @ts-ignore
				const loadBalancer = loadBalancerNode?.data.data.loadBalancer;
				loadBalancer.servers.push(target);
			}

			//edges.update((prev) => [...prev, edge]);
		}}
	>
		<Controls />
		<Background variant={BackgroundVariant.Dots} />
		<MiniMap />
	</SvelteFlow>
</div>

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
