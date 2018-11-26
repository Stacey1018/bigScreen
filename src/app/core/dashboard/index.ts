import { Component, OnInit } from '@angular/core';
import { EventPubSub } from '../../common/eventPubSub';
import { MessageCodeEnum } from '../../common/messageCodeEnum';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  constructor() {
  }

  ngOnInit() {
  }
}
