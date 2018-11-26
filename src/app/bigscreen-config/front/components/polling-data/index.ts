import { Component, OnInit, OnChanges, SimpleChanges, AfterViewInit, OnDestroy, Input } from '@angular/core';
import { Scene } from '../../../../domain/scene/scene';
import { DefConfigService } from '../../../../services/defConfig.service';

@Component({
  selector: 'app-polling-data',
  templateUrl: './polling-data.component.html',
  styleUrls: ['./polling-data.component.scss']
})
export class PollingDataComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @Input() pollingData: Scene.ResourceView = new Scene.ResourceView();
  @Input() id: number;
  public $area;
  public speed = 50;
  public timer;
  constructor(private defConfigService: DefConfigService) { }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.$area = document.getElementById('tableContent' + this.id);
      this.init();
    }, 100);
  }

  ngOnChanges(changes: SimpleChanges): void {

  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }

  public init() {
    this.$area.scrollTop = 0;
    this.startScroll();
  }

  public startScroll() {
    this.timer = setInterval(() => {
      this.scrollUp();
    }, this.speed);
    this.$area.scrollTop++;
  }

  public scrollUp() {
    this.$area.scrollTop++;
    if (this.$area.scrollTop > this.$area.scrollHeight - $(this.$area).height() / this.defConfigService.createSceneBoxRadio - 2) {
      this.$area.scrollTop = 0;
    }
  }


}
