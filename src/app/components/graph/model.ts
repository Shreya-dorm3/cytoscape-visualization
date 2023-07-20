export interface NodeData {
    nodeIndex: number;
    data: Node;
    position: Position;
}

export interface Node {
    id: string;
    type: string,
    color: string,
    width: number,
    height: number
}

export interface Position {
    id: number;
    x: number;
    y: number;
}

export interface EdgeData {
    edgeIndex: number;
    data: Edge;
}
export interface Edge {
    id: String;
    source: String;
    target: String;
}