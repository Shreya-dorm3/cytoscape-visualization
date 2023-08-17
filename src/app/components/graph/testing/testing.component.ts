import { AfterViewChecked, Component, ElementRef, Inject, OnInit, Renderer2, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatAccordion } from '@angular/material/expansion';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from "@angular/cdk/drag-drop";
import { AvailableBlocks } from '../model';
// import * as cytoscape from 'cytoscape';

/*global define: false */

var cytoscape = require("cytoscape");
declare const window: any;
var jquery = require("jquery");
var undoRedo = require("cytoscape-undo-redo");
var nodeEditing = require('cytoscape-node-editing');
var that: any;
var clipboard = require('cytoscape-clipboard');
var undoRedo: any;
var source: any;
var currentVariables: any[] = [];
var counter: number;

'use strict';

cytoscape.use(undoRedo);
cytoscape.use(nodeEditing);

@Component({
  selector: 'app-testing',
  templateUrl: './testing.component.html',
  styleUrls: ['./testing.component.less']
})
export class TestingComponent implements OnInit, AfterViewChecked {

  showLeftPanel: boolean = true;
  searchText: string = '';
  @ViewChild(MatAccordion) accordions!: MatAccordion;
  public layout: any = { name: "dagre", rankDir: "LR", directed: true, padding: 10 };
  dragPosition = { x: 0, y: 0 };
  public zoom: { min: number, max: number } = { min: 0, max: 0 }
  operators = ["+", "-", "*", "/", ">", "<", "==", ">=", "<="];
  public cy = cytoscape();
  wheelSensitivity: any;
  availableBlocks: AvailableBlocks[] = [
  ];
  elementData: { nodes: any[]; edges: any[] } = {
    nodes: [
      { data: { id: 'R1', name: 'Resistor', value: 1000, type: 'node', line1: 'missing', line2: 0 } },
      { data: { id: 'C1', name: 'Capacitor', value: 1001, type: 'node', line1: 0, line2: 1, line3: 3 } },
      { data: { id: 'I1', name: 'Inductor', value: 1002, type: 'node', line1: 1, line2: 'missing' } }
    ],
    edges: [
      { data: { id: 0, source: 'R1', target: 'C1', type: "bendPoint" } },
      { data: { id: 1, source: 'C1', target: 'I1', type: "bendPoint" } }
    ]
  };
  customStyle = [
    {
      selector: 'node',
      style: {
        'background-color': '#fafafa',
        'text-valign': 'center',
        'text-halign': 'center',
        'color': "black",
        'height': '20px',
        'width': '20px',
        'font-size': '0.5px',
        'border-width': "0.01px",
        'border-color': "#272727"
      },
    },
    {
      selector: 'edge',
      css: {
        'curve-style': 'bezier',
        width: '1px',
        'target-arrow-shape': 'triangle',
        'arrow-scale': '0.03px',
        'line-color': "black"
      },
    },
  ];
  @ViewChild('cy', { static: false }) public cyDiv!: ElementRef;
  gridOptions = {
    // On/Off Modules
    /* From the following four snap options, at most one should be true at a given time */
    snapToGridOnRelease: true, // Snap to grid on release
    snapToGridDuringDrag: false, // Snap to grid during drag
    snapToAlignmentLocationOnRelease: false, // Snap to alignment location on release
    snapToAlignmentLocationDuringDrag: false, // Snap to alignment location during drag
    distributionGuidelines: false, // Distribution guidelines
    geometricGuideline: false, // Geometric guidelines
    initPosAlignment: false, // Guideline to initial mouse position
    centerToEdgeAlignment: false, // Center to edge alignment
    resize: true, // Adjust node sizes to cell sizes
    parentPadding: false, // Adjust parent sizes to cell sizes by padding
    drawGrid: false, // Draw grid background

    // General
    gridSpacing: 10, // Distance between the lines of the grid.
    snapToGridCenter: true, // Snaps nodes to center of gridlines. When false, snaps to gridlines themselves. Note that either snapToGridOnRelease or snapToGridDuringDrag must be true.

    // Draw Grid
    zoomDash: true, // Determines whether the size of the dashes should change when the drawing is zoomed in and out if grid is drawn.
    panGrid: true, // Determines whether the grid should move then the user moves the graph if grid is drawn.
    gridStackOrder: -1, // Namely z-index
    gridColor: "#dedede", // Color of grid lines
    lineWidth: 3.0, // Width of grid lines

    // Guidelines
    guidelinesStackOrder: 4, // z-index of guidelines
    guidelinesTolerance: 2.0, // Tolerance distance for rendered positions of nodes' interaction.
    guidelinesStyle: {
      // Set ctx properties of line. Properties are here:
      strokeStyle: "#8b7d6b", // color of geometric guidelines
      geometricGuidelineRange: 400, // range of geometric guidelines
      range: 100, // max range of distribution guidelines
      minDistRange: 10, // min range for distribution guidelines
      distGuidelineOffset: 10, // shift amount of distribution guidelines
      horizontalDistColor: "#ff0000", // color of horizontal distribution alignment
      verticalDistColor: "#00ff00", // color of vertical distribution alignment
      initPosAlignmentColor: "#0000ff", // color of alignment to initial mouse location
      lineDash: [0, 0], // line style of geometric guidelines
      horizontalDistLine: [0, 0], // line style of horizontal distribution guidelines
      verticalDistLine: [0, 0], // line style of vertical distribution guidelines
      initPosAlignmentLine: [0, 0], // line style of alignment to initial mouse position
    },

    // Parent Padding
    parentSpacing: -1, // -1 to set paddings of parents to gridSpacing
  };

  options = {
    // The following 4 options allow the user to provide custom behavior to
    // the extension. They can be used to maintain consistency of some data
    // when elements are duplicated.
    // These 4 options are set to null by default. The function prototypes
    // are provided below for explanation purpose only.

    // Function executed on the collection of elements being copied, before
    // they are serialized in the clipboard
    // @ts-ignore
    beforeCopy: function (eles) { },
    // Function executed on the clipboard just after the elements are copied.
    // clipboard is of the form: {nodes: json, edges: json}
    // @ts-ignore
    afterCopy: function (clipboard) { },
    // Function executed on the clipboard right before elements are pasted,
    // when they are still in the clipboard.
    // @ts-ignore
    beforePaste: function (clipboard) { },
    // Function executed on the collection of pasted elements, after they
    // are pasted.
    // @ts-ignore
    afterPaste: function (eles) { }
  };

  constructor(private ref: ElementRef, private renderer: Renderer2, private dialog: MatDialog) {
    this.wheelSensitivity = 0.05;
  }

  ngAfterViewChecked(): void {
  }

  ngOnInit(): void {
    this.render();
  }

  public render() {
    var destination;

    let cy_container = this.renderer.selectRootElement("#cy");

    this.cy = cytoscape({
      container: (<HTMLInputElement>document.getElementById("cy")),

      boxSelectionEnabled: true,

      // style: this.customStyle,

      elements: {
        nodes: this.elementData.nodes,
        edges: this.elementData.edges,
      },

      layout: {
        name: 'cose',
      },
      minZoom: this.zoom.min,
      maxZoom: this.zoom.max,
      motionBlur: true,
      wheelSensitivity: 0.05,
      // ready: function () {
      //   window.cy = this;
      //   // giddy up
      // }
    });
    this.cy.zoomingEnabled(true);
    this.cy.userPanningEnabled(true);
    this.cy.$('').ungrabify();
    console.log(this.cy, "cy")

    // clipboard = this.cy.clipboard();
    // console.log(this.cy.nodes())
    // this.cy.nodes().forEach((element: any) => {
    //   element.position({ x: element.data().value, y: element.data().value })
    //   element.css('height', element.data().cssProperties.height);
    //   element.css('width', element.data().cssProperties.width);
    //   element.css("z-index", element.data().cssProperties.zIndex);
    //   console.log(element.css('width'));
    // })

    // undoRedo = this.cy.({
    //   undoableDrag: false,
    // });
    // this.cy.gridGuide(this.gridOptions);

    //This is to be understood 
    that = this;

    this.recentre();
    /*
    nodes.ungrabify() disallows the user to grab the nodes, hence effectively not allowing to edit
    */
    this.cy.on("taphold", "node", function (e: any) {
      console.log("taphold calledd")
      if (e.target != that.cy) {
        source = e.target;
        that.cy.nodes().ungrabify();
        e.target.addClass("customSelected");
      }
    });

    window.addEventListener("keydown", function (e: any) {
      if (e.ctrlKey) {
        console.log("in Control");
        if (e.which == 67) {
          // CTRL + C
          that.cb.copy(that.cy.$(":selected"));
        } else if (e.which == 88) {
          // CTRL + X
          that.cb.cut(that.cy.$(":selected"));
        } else if (e.which == 86) {
          // CTRL + V
          undoRedo.do("paste");
        } else if (e.which == 90) {
          // CTRL + Z
          undoRedo.undo();
        } else if (e.which == 89) {
          // CTRL + Y
          undoRedo.redo();
        } else if (e.which == 65) {
          that.cy.elements().select();
          e.preventDefault();
        }
      }
    });

    // @ts-ignore
    this.cy.on("tapend", "node", function (e) {
      console.log("tapend called", e.target.data());

      if (e.target.data().id) {
        that.lastNodeCreatedId = e.target.data().id;
      }
      if (e.target != that.cy && source) {
        destination = e.target.data().id;
        // console.log(source.data());

        that.createEdgeCallback(source.data().id, destination);
      }
      if (source)
        source.removeClass("customSelected");

      source = null;
    });

  }

  recentre() {
    // this.cy.center(this.cy.$('#1'))
    // this.cy.fit(this.cy.$('#1'))
    // this.cy.reset()
    this.cy.resize();
    // this.cy.fit(this.cy.nodes());
  }

  /*
  # When the node/ block is dragged from the side menu and dropped on the canvas, this function is called.
  DRAG POSITION is calculated from cdkDragFreeDragPosition
  */
  createNode(event: any, item: any) {
    console.log("mouse ", event)
    var container = (<HTMLInputElement>document.getElementById("cy"))
    var rect = container.getBoundingClientRect();
    this.dragPosition = { x: this.dragPosition.x, y: this.dragPosition.y };
    const clone = JSON.parse(JSON.stringify(item));
    this.createObjOnDrop(clone, event, rect).then(res => {
      console.log(res, "promise resolved");
      console.log(this.cy)
    });

  }

  createObjOnDrop(name: any, event: any, rectangle: any) {
    console.log("here in object dropped")
    // console.log(Object.keys(event.source), event)
    return new Promise((resolve, reject) => {
      var positionObj;
      console.log(rectangle.left, "rect")
      if (event.type == "mouseup") {
        positionObj = {
          x: (event.clientX - that.cy.pan().x) / that.cy.zoom(),
          y: (event.clientY - that.cy.pan().y) / that.cy.zoom(),
        };
      } else {
        positionObj = {
          x:
            (event.changedTouches[0].clientX - that.cy.pan().x) /
            that.cy.zoom(),
          y:
            (event.changedTouches[0].clientY - that.cy.pan().y) /
            that.cy.zoom(),
        };
      }
      const dialogRef = this.dialog.open(AddNodeDialog, { data: { data: JSON.parse(JSON.stringify(name)), position: positionObj, vars: currentVariables }, width: '50%' });
      dialogRef.afterClosed().subscribe((result: any) => {
        resolve("h")
      });
    })
  }

}

@Component({
  selector: "app-add-node",
  templateUrl: "add-node/add-node.html",
  styleUrls: ["add-node/add-node.less"],
})
export class AddNodeDialog {



  constructor(public dialogRef: MatDialogRef<AddNodeDialog>, @Inject(MAT_DIALOG_DATA) public data: any, private test: TestingComponent) {
    console.log("here in dialog", data)
  }

  makeid(length: number) {
    var result = "";
    var characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  onSubmit(): void {
    var obj = [];
    this.data.data.id = this.makeid(26) + Date.now();
    counter = Number(counter) + 1;
    var block = {
      data: {
        id: this.data.data.id,
        name: this.data.data.name,
        weight: 100,
        colorCode: "orange",
        shapeType: "round-rectangle",
        description: this.data.data.description
      },
    };

    // block["position"] = this.data.data.position;
    obj.push(block);

    // if (this.position == "edit") {
    //   that.cy.$("#" + this.universalform.id).data(blockkkk.data);
    // } else {
    // console.log(cytoscape)
    this.test.cy
    // }

    this.dialogRef.close();
  }
}
