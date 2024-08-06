<script lang="ts">
	import { Handle, Position, type NodeProps } from '@xyflow/svelte';
	import type { Writable } from 'svelte/store';

	type $$Props = NodeProps;
	$$restProps;

	export let data: {
		color: Writable<string>;
		label: string;
		requestsLimit: number | undefined;
		requestsCount: Writable<number> ;
	};

	let { label, color, requestsLimit, requestsCount } = data;
	$: _queueLimit = (requestsLimit || 5) as number;
	$: _itemsCount = ($requestsCount || 0) as number;
</script>

<Handle type="target" position={Position.Left} style="background: #555;" />

<div class="svelte-flow__node-selectorNode p-5" style="background: {color}">
	<p>{label}</p>
	<!-- Create a box and a queue like thing with red balls inside -->
	<div class="flex justify-center">
		<div class="h-6 border-2 border-black flex items-center p-2 gap-[2px] transition">
			{#each Array(_queueLimit) as _, _i}
					<div class={`w-4 h-4 rounded-full transition duration-500 p-2 ${(_i < _itemsCount) ? "bg-red-500" : "bg-transparent"}`}></div>
			{/each}
		</div>
	</div>
</div>

<Handle type="source" position={Position.Right} id="a" style="top: 10px; background: #f00;" />
<Handle
	type="source"
	position={Position.Right}
	id="b"
	style="bottom: 10px; top: auto; background: #f00;"
/>

<style>
	:global(.svelte-flow__node-selectorNode) {
		font-size: 12px;
		background: #eee;
		border: 1px solid #555;
		border-radius: 5px;
		text-align: center;
	}
</style>
