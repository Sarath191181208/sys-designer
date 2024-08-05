import type { Node } from "@xyflow/svelte";

interface GetUIDProps {
  nodes: Node[];
  nodeType: string;
}

export function getUID({ nodes, nodeType }: GetUIDProps): number {
    const clients = nodes.filter((node: Node) => node.id.startsWith(nodeType));
    const maxId =
      clients.length > 0 ? Math.max(...clients.map((node) => parseInt(node.id.split('-')[1]))) : 0;
  return maxId;
}
