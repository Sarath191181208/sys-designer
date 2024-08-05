<!-- <script lang="ts">
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

	const nodes = writable<Node[]>([
		{
			id: '1',
			type: 'input',
			data: { label: 'Cache' },
			position: { x: 0, y: 0 }
		},
		{
			id: '2',
			type: 'default',
			data: { label: 'Server' },
			position: { x: 0, y: 150 }
		},
		{
			id: '3',
			type: 'default',
			data: { label: 'db' },
			position: { x: 0, y: 300 }
		}
	]);

	// same for edges
	const edges = writable<Edge[]>([
		{
			id: '1-2',
			type: 'smoothstep',
			source: '1',
			target: '2',
			animated: true
		},
		{
			id: '2-3',
			type: 'smoothstep',
			source: '2',
			label: 'This is some text',
			target: '3'
		}
	]);

	const snapGrid: [number, number] = [25, 25];
</script>

<div style:height="500px">
	<SvelteFlow
		{nodes}
		{edges}
		{snapGrid}
		fitView
		on:nodeclick={(event) => console.log('on node click', event.detail.node)}
		on:edgeclick={(event) => console.log('on edge click', event.detail.edge)}
	>
		<Controls />
		<Background variant={BackgroundVariant.Dots} />
		<MiniMap />
	</SvelteFlow>
</div>

<div style="h-full bg-red-500">
	<button
		style="bg-blue color-blue text-white"
		on:click={() => {
			edges.update((prev) => {
				let edge = prev[1];
				edge.animated = true;
				return prev;
			});
		}}
	>
		Click me
	</button>
</div>
-->

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

	const nodes = writable<Node[]>([
		{
			id: '1',
			type: 'input',
			data: { label: 'Cache' },
			position: { x: 0, y: 0 }
		},
		{
			id: '2',
			type: 'default',
			data: { label: 'Server' },
			position: { x: 0, y: 150 }
		},
		{
			id: '3',
			type: 'default',
			data: { label: 'db' },
			position: { x: 0, y: 300 }
		}
	]);

	// same for edges
	const edges = writable<Edge[]>([
		{
			id: '1-2',
			type: 'smoothstep',
			source: '1',
			target: '2',
			animated: true
		},
		{
			id: '2-3',
			type: 'smoothstep',
			source: '2',
			label: 'This is some text',
			target: '3'
		}
	]);

	const snapGrid: [number, number] = [25, 25];
</script>

<div style:height="500px">
	<SvelteFlow
		{nodes}
		{edges}
		{snapGrid}
		fitView
		on:nodeclick={(event) => console.log('on node click', event.detail.node)}
		on:edgeclick={(event) => console.log('on edge click', event.detail.edge)}
	>
		<Controls />
		<Background variant={BackgroundVariant.Dots} />
		<MiniMap />
	</SvelteFlow>
</div>

<div class="p-2 bg-red-500 ">
	<button
		class=""
		on:click={() => {
			edges.update((prev) => {
				let edge = prev[1];
				edge.animated = true;
				return prev;
			});
		}}
	>
		Click me
	</button>
</div>

<style lang="postcss">
	:global(html) {
		background-color: theme(colors.gray.100);
	}
</style>
