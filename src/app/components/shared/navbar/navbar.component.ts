import { Component, OnInit, ViewChild } from '@angular/core';
import { MatAccordion } from '@angular/material/expansion';
export interface MenuData {
  name: string;
  action: string;
}

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.less']
})
export class NavbarComponent implements OnInit {

  @ViewChild(MatAccordion) accordion: MatAccordion = new MatAccordion;
  isExpanded: boolean = false;
  menuList: MenuData[] = [{name: 'Graph', action: '/graph/testing'}, {name: 'APIs', action: '/api'}, {name: 'About', action: '/about'}];
  userName: string = '';

  constructor() { }

  ngOnInit(): void {
  }

}
