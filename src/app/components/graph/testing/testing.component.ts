import { AfterViewChecked, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatAccordion } from '@angular/material/expansion';

/*global define: false */

var cytoscape = require("cytoscape");
declare const window: any;
var $;

'use strict';

function classReg(className: string) {
  return new RegExp("(^|\\s+)" + className + "(\\s+|$)");
}

var hasClass: any;
var addClass: any;
var removeClass: any;

if ('classList' in document.documentElement) {
  hasClass = function (elem: any, c: any) {
    console.log( elem.DOMTokenList)
    elem.classList.forEach((e: any) => {
      console.log(e)
    })
    return elem.classList.contains(c);
  };
  addClass = function (elem: any, c: any) {
    elem.classList.add(c);
  };
  removeClass = function (elem: any, c: any) {
    elem.classList.remove(c);
  };
}
else {
  hasClass = function (elem: any, c: any) {
    console.log(elem, c, elem.classList, "elese")
    return classReg(c).test(elem.className);
  };
  addClass = function (elem: any, c: any) {
    if (!hasClass(elem, c)) {
      elem.className = elem.className + ' ' + c;
    }
  };
  removeClass = function (elem: any, c: any) {
    elem.className = elem.className.replace(classReg(c), ' ');
  };
}

function toggleClass(elem: any, c: any) {
  var fn = hasClass(elem, c) ? removeClass : addClass;
  fn(elem, c);
}

var classie = {
  hasClass: hasClass,
  addClass: addClass,
  removeClass: removeClass,
  toggleClass: toggleClass,
  has: hasClass,
  add: addClass,
  remove: removeClass,
  toggle: toggleClass
};

window.classie = classie;
(window);


@Component({
  selector: 'app-testing',
  templateUrl: './testing.component.html',
  styleUrls: ['./testing.component.less']
})
export class TestingComponent implements OnInit, AfterViewChecked {

  showLeftPanel: boolean = true;
  searchText: string = '';
  @ViewChild(MatAccordion) accordions!: MatAccordion;

  constructor(private ref: ElementRef) { }

  ngAfterViewChecked(): void {

    $ = function (selector: any) {
      // console.log(document.querySelector('[class=' + selector + ']'))
      return document.querySelector(selector);
    }

    var accordion = $('div.accordion');

    if (document.readyState !== 'loading') {
      accordion.addEventListener("click", function (e: { stopPropagation: () => void; preventDefault: () => void; target: { nodeName: string; className: string; parentNode: { nextElementSibling: any; }; }; }) {
        e.stopPropagation();
        e.preventDefault();
        if (e.target && e.target.nodeName == "MAT-PANEL-TITLE") {
          var classes = e.target.className.split(" ");
          if (classes.length > 0) {
            for (var x = 0; x < classes.length; x++) {
              if (classes[x] == "mat-expansion-panel-header-title") {
                var title = e.target;
                var content = e.target.parentNode.nextElementSibling;
                classie.toggle(title, 'mat-expansion-panel-header-title');
                if (classie.has(content, 'accordionItemCollapsed')) {
                  if (classie.has(content, 'animateOut')) {
                    classie.remove(content, 'animateOut');
                  }
                  classie.add(content, 'animateIn');
                } else {
                  classie.remove(content, 'animateIn');
                  classie.add(content, 'animateOut');
                }
                classie.toggle(content, 'accordionItemCollapsed');
              }
            }
          }
        }
      });
    };
  }

  ngOnInit(): void {
  }

}
