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

	const nodes = writable<Node[]>([]);
	const edges = writable<Edge[]>([]);


  const runSimulation = (parentsList: Node[], visited: string[]) => {
    if(parentsList.length === 0) return;

    console.log({ parentsList, visited });

    // make all the edges normal i.e animated false 
    edges.update((prev) => prev.map((edge) => ({ ...edge, animated: false })));

    const newParentsList: Node[] = [];
    // get all the connected nodes to the parentsList 
    for(const parent of parentsList) {
      const connectedEdges = $edges.filter((edge) => edge.source === parent.id || edge.target === parent.id);
      for(const edge of connectedEdges) {
        const node = $nodes.find((node) => node.id != parent.id && node.id === edge.target || node.id === edge.source);
        if(node && !visited.includes(node.id)) {
          edges.update((prev) => prev.map((edge) => edge.id === edge.id ? { ...edge, animated: true } : edge));
          visited.push(node.id);
          newParentsList.push(node);
        }
      }
    }

    //runSimulation(newParentsList, visited);
    setTimeout(() => runSimulation(newParentsList, visited), 1000);
  }

  const startSimulation = () => {
    const clientNodes = $nodes.filter((node) => node.id.includes(NODE_TYPES.client)); 
    runSimulation(clientNodes, []);
  }

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
			data: { label: `Server ${server.address}:${server.port}`, data: { server } },
			position: { x: 0, y: 0 }
		};

		nodes.update((prev) => [...prev, newServer]);
	};

	const addClient = () => {
		const client: MobileClient = {};
		const uid = getUID({ nodes: $nodes, nodeType: NODE_TYPES.client });
		nodes.update((prev) => [
			...prev,
			{
				id: `${NODE_TYPES.client}-${uid + 1}`,
				data: { label: `Client ${uid + 1}`, data: { client } },
				position: { x: 0, y: 0 }
			}
		]);
	};

	const addLoadBalancer = () => {
		const loadBalancer: LoadBalancer = {
			servers: [],
			currentServerIndex: -1,
			routingStrategy: 'ROUND_ROBIN'
		};
		const uid = getUID({ nodes: $nodes, nodeType: NODE_TYPES.load_balancer });
    console.log(uid);
		nodes.update((prev) => [
			...prev,
			{
				id: `${NODE_TYPES.load_balancer}-${uid + 1}`,
				data: { label: `Load Balancer ${uid + 1}`, data: { loadBalancer } },
				position: { x: 0, y: 0 }
			}
		]);
	};

	const snapGrid: [number, number] = [25, 25];
</script>

<div style:height="500px">
	<SvelteFlow
		{nodes}
		{edges}
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

<div class="p-2 bg-gray-300">
	<button class="border-black border-2 p-2" on:click={() => addClient()}>Add Client</button>
	<button class="border-black border-2 p-2" on:click={() => addLoadBalancer()}
		>Add Load balancer</button
	>
	<button class="border-black border-2 p-2" on:click={() => addServer()}>Add Server</button>
  <button class="border-black border-2 p-2" on:click={() => startSimulation()}>Start Simulation</button>
</div>

<style lang="postcss">
	:global(html) {
		background-color: theme(colors.gray.100);
	}
</style>
