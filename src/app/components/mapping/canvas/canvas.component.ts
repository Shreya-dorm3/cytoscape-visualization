import { AfterViewInit, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MappingService } from '../mapping.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

declare var loadMapCanvas: any;
declare var createAndUpdateRobots: any;
declare var clearCanvas: any;
var that_: any;
declare var createHeatMap: any;
declare var clearHeatMap: any;
declare var reverseTransform: any;
declare var saveMapImageNodeGraph: any;
declare var loadMappingPointer: any;
declare var clearGraph: any;
declare var reDrawNodeGraph: any;
declare var drawStationsOnMap: any;
declare var createNode: any;
declare var setDelete: any;
declare var drawNodesForFmsRos: any;
declare var setDirectionType: any;
declare function getDataGraph(): any;

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.less']
})
export class CanvasComponent implements OnInit {

  enableNodeGraph: boolean = false;
  showErrorHeatmap: boolean = false;
  showGraphCheck: boolean = false;
  robotOptions: any;
  public mapList: any;
  mqttService: any;
  robots = [];
  isDelete: boolean = false;
  direction: string = 'bi';

  constructor(private service: MappingService, public dialog: MatDialog,) { }

  ngOnInit(): void {
    this.enableNodeGraph = true;
    this.service.getCartons().subscribe(res => {
      this.robotOptions = res;
    })
  }

  createNode() {
    this.isDelete = false;
    setDelete(false);
    const dialogRef = this.dialog.open(CreateNodeDialogueComponent, {
      width: '250px',
      data: { name: '' },
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      drawNodesForFmsRos({
        pose: {
          position: {
            x: 0,
            y: 0,
            z: 0,
          },
          orientation: {
            x: 0,
            y: 0,
            z: 0,
            w: 0,
          },
        },
        name: result.name,
        type: result.type,
        direction: this.direction,
      });
    });
  }

  deleteObjects() {
    this.isDelete = !this.isDelete;
    setDelete(this.isDelete);
  }

  createEdge(type: any) {
    this.direction = type;
    setDirectionType(this.direction);
  }

  clickSaveButton() {
    const dialogRef = this.dialog.open(ConfirmSaveDialogueComponent, {
      height: '150px',
      data: { name: '' },
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result === 'cancel' || result === undefined) return;
      else this.saveGraph();
    });
  }

  showGraph() {
    if (this.showGraphCheck == false) {
      clearGraph().then((r: any) => {
        this.service.getGraph().subscribe((res) => {

          reDrawNodeGraph(res);
          this.showGraphCheck = true;
        });
      });
    } else {
      clearGraph().then((res: any) => {
        this.showGraphCheck = false;
      });
    }
  }

  showMapList() {
    console.log('show map');
    const dialogRef = this.dialog.open(ShowMapDialogueComponent, {
      width: '850px',
      height: '500px',
      data: this.mapList,
      panelClass: 'custom-dialog-container',
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      this.changeMap(result);
      console.log(result);
    });
  }


  changeMap(url: any) {
    if (url == undefined) return;
    //clear map canvas
    clearCanvas();
    this.showGraphCheck = false;
    loadMapCanvas(this.mqttService, url, 'visualizer', 'topDiv', this.robotOptions.type).then(() => {
      this.getCartonLocations();
    });
  }

  getCartonLocations() {
    this.service.getCartonLocations().subscribe(res => {
      drawStationsOnMap(res.locations);
    })
    createAndUpdateRobots(this.robots, this.robotOptions);
  }

  toggleNodeMenu() {
    this.enableNodeGraph = !this.enableNodeGraph;
  }

  showHeatMap() {

    if (!this.showErrorHeatmap) {
      this.service.getHeatMap(2500).subscribe(res => {
        createHeatMap(res);
      });
    }
    else {
      clearHeatMap();
    }
    this.showErrorHeatmap = !this.showErrorHeatmap;
  }

  consoleData() {
    getDataGraph().then((res: any) => {
      console.log(res);
    });
  }

  saveGraph() {
    //let ob = Object.assign({}, getGraph());
    getDataGraph().then((res: any) => {
      let ob = JSON.parse(JSON.stringify(res));
      for (let i = 0; i < ob.nodes.length; i++) {
        let reverse = reverseTransform(
          ob.nodes[i].pose.position.x,
          ob.nodes[i].pose.position.y,
          0
        );
        ob.nodes[i].pose.position.x = reverse.x;
        ob.nodes[i].pose.position.y = reverse.y;
        ob.nodes[i].pose.position.z = reverse.theta;
      }
      this.service.saveGraph(ob).subscribe((r) => {
        console.log(r);
        alert('Graph saved');
      });
    });
  }

  saveMapImage() {
    saveMapImageNodeGraph();
  }

}

@Component({
  selector: 'app-create-node',
  templateUrl: './create-node/create-node.html',
  styleUrls: ['./create-node/create-node.less'],
})
export class CreateNodeDialogueComponent {

  value = '';
  types = [
    { name: 'none', viewName: 'Connecting Node' },
    { name: 'pick', viewName: 'Loading Loaction' },
    { name: 'drop', viewName: 'Unloading Location' },
    { name: 'charge', viewName: 'Charging Location' },
    { name: 'pick_wait', viewName: 'Loading Waitspot' },
    { name: 'drop_wait', viewName: 'Unloading Waitspot' },
    { name: 'charge_wait', viewName: 'Precharge Waitspot' },
  ];
  FavoriteNode = { name: 'none', viewName: 'Connecting Node' };

  constructor(public dialogRef: MatDialogRef<CreateNodeDialogueComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
    console.log(data);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  submit() {
    if (!this.value) {
      return;
    }
    console.log(this.FavoriteNode);
    var result = {
      name: this.value,
      type: this.FavoriteNode.name,
    };
    this.dialogRef.close(result);
  }

  cancel() {
    this.dialogRef.close(false);
  }
}

@Component({
  selector: 'app-upload-map',
  templateUrl: './upload-map/upload-map.html',
  styleUrls: ['./upload-map/upload-map.less'],
})

export class UploadMapDialogueComponent {

  selectedFile!: File;
  currentFileName: string = "";

  constructor(public dialogRef: MatDialogRef<UploadMapDialogueComponent>, @Inject(MAT_DIALOG_DATA) public data: any) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

  submit() {
    this.dialogRef.close(true);
  }

  selectFiles(event: any): void {
    this.selectedFile = event.target.files[0];
    this.currentFileName = this.selectedFile.name;
  }

  uploadFile() {
    console.log(this.selectedFile, "in here");
  }

  close() {
    this.dialogRef.close(false);
  }
}

@Component({
  selector: 'app-confirm-save',
  templateUrl: './save-map/save-map.html',
  styleUrls: ['./save-map/save-map.less'],
})
export class ConfirmSaveDialogueComponent {

  constructor(public dialogRef: MatDialogRef<ConfirmSaveDialogueComponent>, @Inject(MAT_DIALOG_DATA) public data: any) { }

  confirmationClicked(res: any) {
    console.log(res);
    this.dialogRef.close(res);
  }
}

@Component({
  selector: 'app-show-map-list',
  templateUrl: './show-map-list/show-map-list.html',
  styleUrls: ['./show-map-list/show-map-list.less'],
})
export class ShowMapDialogueComponent implements AfterViewInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  elementData: any = {};
  dataSource: any;

  constructor(
    public dialogRef: MatDialogRef<ShowMapDialogueComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.dataSource = new MatTableDataSource(data);
  }

  columnsToDisplay: string[] = ['name', 'site', 'url', 'actions'];

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyMapFilter(filterValue: any) {
    // console.log(filterValue.target.value);
    let value = filterValue.target.value.trim().toLowerCase();
    if (value == '') {
      this.dataSource.filter = '';
    } else {
      this.dataSource.filter = value;
    }
  }

  updateMap(item: any) {
    // console.log(item);
    this.dialogRef.close(item.url);
  }

  deleteMap(item: any) {
    console.log(item);
  }

  onNoClick(): void {
    this.dialogRef.close('');
  }
}