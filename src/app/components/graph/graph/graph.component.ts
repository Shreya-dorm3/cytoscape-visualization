import { Component, Inject, OnInit } from '@angular/core';

import * as cytoscape from 'cytoscape';
import { EdgeData, NodeData } from '../model';
import { AvailableBlocks, BlockData } from '../testing/testing.component';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';

var that: any;

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.less']
})
export class GraphComponent implements OnInit {

  public temp: { nodes: any[]; edges: any[] } = {
    nodes: [
      {
        "nodeIndex": 1,
        "data": {
          "id": "node_1",
          "type": "circle",
          "color": "blue",
          "width": 30,
          "height": 30
        },
        "position": {
          "id": 1,
          "x": 100,
          "y": 200
        }
      },
      {
        "nodeIndex": 2,
        "data": {
          "id": "node_2",
          "type": "rectangle",
          "color": "red",
          "width": 50,
          "height": 40
        },
        "position": {
          "id": 2,
          "x": 300,
          "y": 150
        }
      },
      {
        "nodeIndex": 3,
        "data": {
          "id": "node_3",
          "type": "triangle",
          "color": "green",
          "width": 25,
          "height": 25
        },
        "position": {
          "id": 3,
          "x": 50,
          "y": 100
        }
      },
      {
        "nodeIndex": 4,
        "data": {
          "id": "node_4",
          "type": "square",
          "color": "yellow",
          "width": 35,
          "height": 35
        },
        "position": {
          "id": 4,
          "x": 200,
          "y": 300
        }
      }
    ], edges: [
      {
        "edgeIndex": 1,
        "data": {
          "id": "edge_1",
          "source": "node_1",
          "target": "node_2"
        }
      },
      {
        "edgeIndex": 2,
        "data": {
          "id": "edge_2",
          "source": "node_2",
          "target": "node_3"
        }
      },
      {
        "edgeIndex": 3,
        "data": {
          "id": "edge_3",
          "source": "node_3",
          "target": "node_4"
        }
      }
    ]
  };
  public cy: any;
  customStyle: any[] = [
    {
      selector: 'node',
      style: {
        'background-color': 'blue',
        'text-valign': 'center',
        'text-halign': 'center',
        'color': "black",
        'height': '10px',
        'width': '10px',
        'font-size': '0.5px',
        'border-width': "0.01px",
        'border-color': "black"
      },
    },
    {
      selector: 'edge',
      css: {
        'curve-style': 'bezier',
        width: '0.1px',
        'target-arrow-shape': 'triangle',
        'arrow-scale': '0.03px',
        'opacity': 0.3,
        'overlay-opacity': 0,
        'line-color': "black"
        // #22548B
      },
    },
  ];
  availableBlocks: AvailableBlocks[] = [
    {
      "type": "api",
      "name": "API",
      "blockData": [
        {
          "id": 1,
          "title": "Task 1",
          "description": "This is description of tasks 1"
        },
        {
          "id": 2,
          "title": "Task 2",
          "description": "'This is description of tasks 2'"
        },
        {
          "id": 3,
          "title": "Task 3",
          "description": "This is description of tasks 3"
        }
      ]
    },
    {
      "type": "sql",
      "name": "SQL Operations",
      "blockData": [
        {
          "id": 1,
          "title": "Task 1",
          "description": "This is description of tasks 1"
        },
        {
          "id": 2,
          "title": "Task 2",
          "description": "'This is description of tasks 2'"
        },
        {
          "id": 3,
          "title": "Task 3",
          "description": "This is description of tasks 3"
        }
      ]
    },
    {
      "type": "other",
      "name": "Other Operations",
      "blockData": [
        {
          "id": 1,
          "title": "Task 1",
          "description": "This is description of tasks 1"
        },
        {
          "id": 2,
          "title": "Task 2",
          "description": "'This is description of tasks 2'"
        },
        {
          "id": 3,
          "title": "Task 3",
          "description": "This is description of tasks 3"
        }
      ]
    }
  ];

  constructor(private dialog: MatDialog) { }

  ngOnInit(): void {
    this.renderNodes();
  }

  public renderNodes() {
    this.temp.nodes.forEach((node) => {
      var customStyleObject = {
        selector: `#${node.data.id}`,
        style: {
          content: node.data.id,
          shape: `${node.data.type}`,
          'background-color': `${node.data.color}`,
          height: `${node.data.height}`,
          width: `${node.data.width}`,
        },
      };
      this.customStyle.push(customStyleObject);
    });
    this.renderGraph();
  }

  renderGraph() {
    that = this;
    var source;
    this.cy = cytoscape({
      container: document.getElementById('cy'),
      boxSelectionEnabled: false,
      style: this.customStyle,
      elements: {
        nodes: this.temp.nodes,
        edges: this.temp.edges,
      },
      layout: {
        name: 'preset',
      },
      wheelSensitivity: 0.05
    });
    this.cy.zoomingEnabled(true);
    this.cy.userPanningEnabled(true);
    // this.cy.$('').ungrabify();

    // @ts-ignore
    this.cy.on("taphold", "node", function (e) {
      console.log("here", e);
      if (e.target != that.cy) {
        source = e.target;
        that.cy.nodes().ungrabify();
      }
    });
  }

  addNode(event: any, item: BlockData) {
    const dialogRef = this.dialog.open(AddNewNodeDialog, { data: item });
    dialogRef.afterClosed().subscribe(res => {
    })
  }

  public createNode(node: any) {
    that.cy.add([
      {
        group: 'nodes',
        data: { id: node.nodeIndex, name: node.data.id, value: 1000, weight: 75, width: 50, height: 60 },
        position: { x: node.position.x, y: node.position.y },
        style: node.style
      },
    ]);
  }


}

@Component({
  selector: "app-add-new-node",
  templateUrl: "add-new-node/add-new-node.html",
  styleUrls: ["add-new-node/add-new-node.less"],
})
export class AddNewNodeDialog {

  name: string = '';
  label: string = '';
  id!: number;

  constructor(public dialogRef: MatDialogRef<AddNewNodeDialog>, @Inject(MAT_DIALOG_DATA) public data: any, private graph: GraphComponent) {
    console.log("here in dialog", data)
  }

  makeid(length: number) {
    var result: number = 0;
    var characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += Math.random() * charactersLength;
    }
    return result;
  }

  onSubmit() {
    console.log(this.name)
    var counter = this.graph.temp.nodes.length;
    this.id = this.makeid(26) + Date.now();
    // counter = Number(counter) + 1;
    // var block = {
    //   data: {
    //     id: this.id,
    //     name: this.name,
    //     weight: 100,
    //     height: 100,
    //     width: 50,
    //     colorCode: "orange",
    //     shapeType: "round-rectangle"
    //   },
    // };
    var nodeNew: any = {
      nodeIndex: counter + 1,
      position: {
        id: counter + 1,
        x: 180,
        y: 200
      },
      data: {
        color: 'yellow',
        height: 60,
        width: 50,
        id: this.name,
        type: 'rectangle'
      },
      style: {
        'background-color': 'pink',
        'text-valign': 'center',
        'text-halign': 'center',
        'color': "black",
        'height': '20px',
        'width': '20px',
        'font-size': '6px',
        'border-width': "0.01px",
        'border-color': "black",
        "shape": "square"
      }
    }
    this.graph.temp.nodes.push(nodeNew);
    this.graph.createNode(nodeNew);
    // this.graph.renderNodes();
    this.dialogRef.close();
  }
}