import { Component, OnInit, OnChanges, AfterViewInit, OnDestroy, SimpleChanges, Input } from '@angular/core';
import { Scene } from '../../../../domain/scene/scene';

@Component({
  selector: 'app-draw',
  templateUrl: './draw.component.html',
  styleUrls: ['./draw.component.scss']
})
export class DrawComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @Input() drawData: Scene.ResourceView = new Scene.ResourceView();
  public numArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  constructor() { }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {

  }

  ngOnDestroy(): void {
  }

}
