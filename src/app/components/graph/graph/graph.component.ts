import { Component, Inject, OnInit } from '@angular/core';

import * as cytoscape from 'cytoscape';
import * as cxtmenu from 'cytoscape-cxtmenu';
import { AvailableBlocks, EdgeData, NodeData, NodeNew, NodeStyle } from '../model';
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
        },
        "style": {
          'background-color': '#0C579C',
          'text-valign': 'center',
          'text-halign': 'center',
          'color': "white",
          'height': '30px',
          'width': '30px',
          'font-size': '5px',
          'border-width': "0.01px",
          'border-color': "black"
        }
      },
      {
        "nodeIndex": 2,
        "data": {
          "id": "node_2",
          "type": "rectangle",
          "color": "#B2002B",
          "width": 35,
          "height": 40
        },
        "position": {
          "id": 2,
          "x": 300,
          "y": 150
        },
        "style": {
          'background-color': '#B2002B',
          'text-valign': 'center',
          'text-halign': 'center',
          'color': "white",
          'height': '35px',
          'width': '40px',
          'font-size': '5px',
          'border-width': "0.01px",
          'border-color': "black"
        }
      },
      {
        "nodeIndex": 3,
        "data": {
          "id": "node_3",
          "type": "triangle",
          "color": "green",
          "width": 30,
          "height": 30
        },
        "position": {
          "id": 3,
          "x": 50,
          "y": 100
        },
        "style": {
          'background-color': '#065BAA',
          'text-valign': 'center',
          'text-halign': 'center',
          'color': "white",
          'height': '30px',
          'width': '35px',
          'font-size': '5px',
          'border-width': "0.01px",
          'border-color': "black",
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
        },
        "style": {
          'background-color': '#D3AB05',
          'text-valign': 'center',
          'text-halign': 'center',
          'color': "white",
          'height': '35px',
          'width': '35px',
          'font-size': '5px',
          'border-width': "0.01px",
          'border-color': "black"
        }
      }
    ], edges: [
      {
        "edgeIndex": 1,
        "data": {
          "id": "edge_1",
          "source": "node_1",
          "target": "node_2"
        },
        "style": {
          "width": "0.7px"
        }
      },
      {
        "edgeIndex": 2,
        "data": {
          "id": "edge_2",
          "source": "node_2",
          "target": "node_3"
        },
        "style": {
          "width": "0.7px"
        }
      },
      {
        "edgeIndex": 3,
        "data": {
          "id": "edge_3",
          "source": "node_3",
          "target": "node_4"
        },
        "style": {
          "width": "0.7px"
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
        'font-size': '5px',
        'border-width': "0.01px",
        'border-color': "black"
      },
    },
    {
      selector: 'edge',
      css: {
        'curve-style': 'bezier',
        "width": '0.4px',
        'target-arrow-shape': 'triangle',
        'arrow-scale': '0.03px',
        'opacity': 0.3,
        'overlay-opacity': 0,
        'line-color': "black"
        // #22548B
      },
    },
  ];
  // @ts-ignore
  public style: any = cytoscape.stylesheet()
    .selector(":selected")
    .css({
      "border-width": 0.7,
      "border-color": "#000",
    })
    .selector("edge")
    .css({
      "curve-style": "bezier",
      opacity: 0.9,
      width: 1,
      "target-arrow-shape": "vee",
      "line-color": "data(colorCode)",
      "source-arrow-color": "data(colorCode)",
      "target-arrow-color": "data(colorCode)",
      "arrow-scale": "1",
      "z-index": 5,
      "z-compound-depth": "top",
    })

    .selector("edge[label]")
    .css({
      "label": "data(label)",
      "text-rotation": "autorotate",
      "text-margin-x": "0px",
      "text-margin-y": "-5px",
      "font-size": "8px"
    })
    .selector(":selected")
    .css({
      "line-style": "dotted",
      "target-arrow-shape": "diamond",
    })
    .selector("edge.questionable")
    .css({
      "line-style": "dotted",
      "target-arrow-shape": "diamond",
    })
    .selector(".faded")
    .css({
      opacity: 1,
      "text-opacity": 0,
    })
    .selector(".customSelected")
    .css({
      "background-size": "10px 10px",
      "background-image": "./assets/images/download.jpeg",

      // color: "white",
    })
    .selector(".currentBlock")
    .css({
      "background-opacity": ".5",
      "background-color": "#61bffc",
      "transition-property": "background-color, line-color, target-arrow-color",
      "transition-duration": "0.5s",
    })
    .selector(".executedEdge")
    .css({
      "background-color": "#61bffc",
      "line-color": "#61bffc",
      "target-arrow-color": "#61bffc",
      "transition-property": "background-color, line-color, target-arrow-color",
      "transition-duration": "0.5s",
    });
  availableBlocks: AvailableBlocks[] = [
    {
      "type": "api",
      "name": "API",
      "blockData": [
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
          },
          "style": {
            "backgroundColor": "#0C579C",
            "textValign": "center",
            "textHalign": "center",
            "color": "white",
            "height": "30px",
            "width": "30px",
            "fontSize": "5px",
            "borderWidth": "0.01px",
            "borderColor": "black",
            "shape": "circle"
          }
        },
        {
          "nodeIndex": 2,
          "data": {
            "id": "node_2",
            "type": "rectangle",
            "color": "#B2002B",
            "width": 35,
            "height": 40
          },
          "position": {
            "id": 2,
            "x": 300,
            "y": 150
          },
          "style": {
            "backgroundColor": "#B2002B",
            "textValign": "center",
            "textHalign": "center",
            "color": "white",
            "height": "35px",
            "width": "40px",
            "fontSize": "5px",
            "borderWidth": "0.01px",
            "borderColor": "black",
            "shape": "rectangle"
          }
        },
        {
          "nodeIndex": 3,
          "data": {
            "id": "node_3",
            "type": "triangle",
            "color": "green",
            "width": 30,
            "height": 30
          },
          "position": {
            "id": 3,
            "x": 50,
            "y": 100
          },
          "style": {
            "backgroundColor": "#065BAA",
            "textValign": "center",
            "textHalign": "center",
            "color": "white",
            "height": "30px",
            "width": "35px",
            "fontSize": "5px",
            "borderWidth": "0.01px",
            "borderColor": "black",
            "shape": "triangle"
          }
        }
      ]
    },
    {
      "type": "sql",
      "name": "SQL Operations",
      "blockData": [
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
          },
          "style": {
            "backgroundColor": "#D3AB05",
            "textValign": "center",
            "textHalign": "center",
            "color": "white",
            "height": "35px",
            "width": "35px",
            "fontSize": "5px",
            "borderWidth": "0.01px",
            "borderColor": "black",
            "shape": "square"
          }
        },
        {
          "nodeIndex": 5,
          "data": {
            "id": "node_5",
            "type": "circle",
            "color": "red",
            "width": 25,
            "height": 25
          },
          "position": {
            "id": 5,
            "x": 50,
            "y": 250
          },
          "style": {
            "backgroundColor": "#FF5733",
            "textValign": "center",
            "textHalign": "center",
            "color": "white",
            "height": "25px",
            "width": "25px",
            "fontSize": "5px",
            "borderWidth": "0.01px",
            "borderColor": "black",
            "shape": "circle"
          }
        },
        {
          "nodeIndex": 6,
          "data": {
            "id": "node_6",
            "type": "rectangle",
            "color": "#4CAF50",
            "width": 40,
            "height": 30
          },
          "position": {
            "id": 6,
            "x": 350,
            "y": 100
          },
          "style": {
            "backgroundColor": "#4CAF50",
            "textValign": "center",
            "textHalign": "center",
            "color": "white",
            "height": "30px",
            "width": "40px",
            "fontSize": "5px",
            "borderWidth": "0.01px",
            "borderColor": "black",
            "shape": "rectangle"
          }
        },
        {
          "nodeIndex": 7,
          "data": {
            "id": "node_7",
            "type": "triangle",
            "color": "#800080",
            "width": 30,
            "height": 30
          },
          "position": {
            "id": 7,
            "x": 150,
            "y": 400
          },
          "style": {
            "backgroundColor": "#800080",
            "textValign": "center",
            "textHalign": "center",
            "color": "white",
            "height": "30px",
            "width": "30px",
            "fontSize": "5px",
            "borderWidth": "0.01px",
            "borderColor": "black",
            "shape": "triangle"
          }
        }
      ]
    },
    {
      "type": "other",
      "name": "Other Operations",
      "blockData": [
        {
          "nodeIndex": 8,
          "data": {
            "id": "node_8",
            "type": "circle",
            "color": "orange",
            "width": 25,
            "height": 25
          },
          "position": {
            "id": 8,
            "x": 400,
            "y": 300
          },
          "style": {
            "backgroundColor": "#FFA500",
            "textValign": "center",
            "textHalign": "center",
            "color": "white",
            "height": "25px",
            "width": "25px",
            "fontSize": "5px",
            "borderWidth": "0.01px",
            "borderColor": "black",
            "shape": "circle"
          }
        },
        {
          "nodeIndex": 9,
          "data": {
            "id": "node_9",
            "type": "rectangle",
            "color": "#00FFFF",
            "width": 30,
            "height": 40
          },
          "position": {
            "id": 9,
            "x": 100,
            "y": 350
          },
          "style": {
            "backgroundColor": "#00FFFF",
            "textValign": "center",
            "textHalign": "center",
            "color": "white",
            "height": "40px",
            "width": "30px",
            "fontSize": "5px",
            "borderWidth": "0.01px",
            "borderColor": "black",
            "shape": "rectangle"
          }
        },
        {
          "nodeIndex": 10,
          "data": {
            "id": "node_10",
            "type": "triangle",
            "color": "#FF1493",
            "width": 30,
            "height": 30
          },
          "position": {
            "id": 10,
            "x": 250,
            "y": 200
          },
          "style": {
            "backgroundColor": "#FF1493",
            "textValign": "center",
            "textHalign": "center",
            "color": "white",
            "height": "30px",
            "width": "30px",
            "fontSize": "5px",
            "borderWidth": "0.01px",
            "borderColor": "black",
            "shape": "triangle"
          }
        },
        {
          "nodeIndex": 11,
          "data": {
            "id": "node_11",
            "type": "square",
            "color": "#800000",
            "width": 35,
            "height": 35
          },
          "position": {
            "id": 11,
            "x": 400,
            "y": 100
          },
          "style": {
            "backgroundColor": "#800000",
            "textValign": "center",
            "textHalign": "center",
            "color": "white",
            "height": "35px",
            "width": "35px",
            "fontSize": "5px",
            "borderWidth": "0.01px",
            "borderColor": "black",
            "shape": "square"
          }
        }
      ]
    },
    {
      "type": "interface",
      "name": "Interface Operations",
      "blockData": [
        {
          "nodeIndex": 12,
          "data": {
            "id": "node_12",
            "type": "circle",
            "color": "#008000",
            "width": 25,
            "height": 25
          },
          "position": {
            "id": 12,
            "x": 200,
            "y": 50
          },
          "style": {
            "backgroundColor": "#008000",
            "textValign": "center",
            "textHalign": "center",
            "color": "white",
            "height": "25px",
            "width": "25px",
            "fontSize": "5px",
            "borderWidth": "0.01px",
            "borderColor": "black",
            "shape": "circle"
          }
        },
        {
          "nodeIndex": 13,
          "data": {
            "id": "node_13",
            "type": "rectangle",
            "color": "#FF4500",
            "width": 30,
            "height": 40
          },
          "position": {
            "id": 13,
            "x": 250,
            "y": 350
          },
          "style": {
            "backgroundColor": "#FF4500",
            "textValign": "center",
            "textHalign": "center",
            "color": "white",
            "height": "40px",
            "width": "30px",
            "fontSize": "5px",
            "borderWidth": "0.01px",
            "borderColor": "black",
            "shape": "rectangle"
          }
        },
        {
          "nodeIndex": 14,
          "data": {
            "id": "node_14",
            "type": "triangle",
            "color": "#FF8C00",
            "width": 30,
            "height": 30
          },
          "position": {
            "id": 14,
            "x": 150,
            "y": 200
          },
          "style": {
            "backgroundColor": "#FF8C00",
            "textValign": "center",
            "textHalign": "center",
            "color": "white",
            "height": "30px",
            "width": "30px",
            "fontSize": "5px",
            "borderWidth": "0.01px",
            "borderColor": "black",
            "shape": "triangle"
          }
        },
        {
          "nodeIndex": 15,
          "data": {
            "id": "node_15",
            "type": "square",
            "color": "#9370DB",
            "width": 35,
            "height": 35
          },
          "position": {
            "id": 15,
            "x": 300,
            "y": 400
          },
          "style": {
            "backgroundColor": "#9370DB",
            "textValign": "center",
            "textHalign": "center",
            "color": "white",
            "height": "35px",
            "width": "35px",
            "fontSize": "5px",
            "borderWidth": "0.01px",
            "borderColor": "black",
            "shape": "square"
          }
        }
      ]
    }
  ];

  constructor(private dialog: MatDialog) {
  }

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
    var source: any;
    var destination;
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
      if (e.target != that.cy) {
        source = e.target.data().id;
        that.cy.nodes().ungrabify();
      }
    });

    // @ts-ignore
    this.cy.on("tapend", function (e) {
      // console.log("tapend called", e.target.data());
      // console.log(that.cy.nodes())
      if (e.target.data().id) {
        that.lastNodeCreatedId = e.target.data().id;
      }
      if (e.target != that.cy && source) {
        destination = e.target.data().id;
        that.createEdgeCallback(source, destination);
      }
      if (source) that.cy.$("#" + source).removeClass("customSelected");
      that.cy.nodes().grabify();
      source = null;
    });
  }

  addNode(event: any, item: NodeData) {
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

  // @ts-ignore
  createEdgeCallback(a, b) {
    console.log("target details", that.cy.$("#" + b).data());
    console.log("source details", that.cy.$("#" + a).data());
    var obj;
    var name = that.cy.$("#" + b).data().name;

    if (name === "start") {
      //can't create edge on the starting node
      return;
    }

    // @ts-ignore
    var totalCases: any;
    // totalCases = JSON.parse(JSON.stringify(that.cy.$("#" + a).data().children));

    // @ts-ignore
    this.cy.$("#" + a)[0]._private.edges.forEach((element) => {
      let iter = element[0]._private.data;

      /**
       * For now no defined children, so skipping the cases for having children
       */
      // for (let i = 0; i < totalCases.length; i++) {
      //   if (totalCases[i].name === iter.type && iter.source === a) {
      //     totalCases.splice(i--, 1);
      //   }
      // }
    });

    // if (totalCases.length === 1) {
    obj = {
      data: {
        source: a,
        target: b,
        // colorCode: totalCases[0].color,
        strength: 1,
        type: 'edge',
        label: 'Edge',
      },
      classes: 'autorotate',
    };
    this.cy.add([obj]);
    // }

    // else {
    //   const dialogRef = that.dialog.open(EdgeType, {
    //     width: "auto",
    //     disableClose: true,
    //     data: {
    //       id: a,
    //       usedTypes: [],
    //       totalTypes: totalCases,
    //     },
    //   });

    //   // @ts-ignore
    //   dialogRef.afterClosed().subscribe(result => {
    //     if (result === undefined)
    //       return;
    //     console.log(result);

    //     obj = {
    //       data: {
    //         source: a,
    //         target: b,
    //         colorCode: result.color,
    //         strength: 1,
    //         type: result.name,
    //         label: result.name,
    //       },
    //       classes: 'autorotate',
    //     };

    //     this.cy.add([obj]);
    //   });
    // }
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
  styleNode: NodeStyle = { backgroundColor: 'pink', borderColor: 'black', borderWidth: '0.1px', color: 'white', fontSize: '1px', height: '30px', width: '30px', shape: 'square', textHalign: 'center', textValign: 'center' };

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
    var nodeNew: NodeNew = {
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
      style: this.styleNode
    }
    this.graph.temp.nodes.push(nodeNew);
    this.graph.createNode(nodeNew);
    // this.graph.renderNodes();
    this.dialogRef.close();
  }

  renderStyleForAdd(nodeStyle: NodeStyle) {
    var styleContent = {
      'background-color': `${nodeStyle.backgroundColor}`,
      'text-valign': `${nodeStyle.textValign}`,
      'text-halign': `${nodeStyle.textHalign}`,
      'color': `${nodeStyle.color}`,
      'height': `${nodeStyle.height}`,
      'width': `${nodeStyle.width}`,
      'font-size': `${nodeStyle.fontSize}`,
      'border-width': `${nodeStyle.borderWidth}`,
      'border-color': `${nodeStyle.borderColor}`
    }
    return styleContent;
  }

}

@Component({
  selector: "app-edgeType-dialog",
  templateUrl: "./edge-type/edge-type.html",
  styleUrls: ["./edge-type/edge-type.less"],
})
export class EdgeType {

  constructor(public dialogRef: MatDialogRef<EdgeType>, @Inject(MAT_DIALOG_DATA) public data: any) { }

  types = this.data.totalTypes;

  favoriteType = this.types[0];

  submit() {

    this.dialogRef.close(this.favoriteType);
  }
  close() {
    this.dialogRef.close();
  }
}