export interface NodeData {
    nodeIndex: number;
    data: Node;
    position: Position;
    style: NodeStyle;
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
export interface NodeNew {
    nodeIndex: number;
    data: Node;
    style: NodeStyle;
    position: Position;
}
export interface NodeStyle {
    backgroundColor: string;
    textValign: string;
    textHalign: string;
    color: string;
    height: string;
    width: string;
    fontSize: string;
    borderWidth: string;
    borderColor: string;
    shape: string;

}

export interface AvailableBlocks {
    type: string;
    name: string;
    blockData: NodeData[];
}
