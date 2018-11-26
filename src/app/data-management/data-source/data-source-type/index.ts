import { Component, OnInit } from '@angular/core';
import { DataBaseTypeEnum } from '../../../common/dataBaseTypeEnum';

@Component({
  selector: 'app-data-source-type',
  templateUrl: './data-source-type.component.html',
  styleUrls: ['./data-source-type.component.scss']
})
export class DataSourceTypeComponent implements OnInit {
  public dbType = {
    'mySql': DataBaseTypeEnum.MySql,
    'sqlServer': DataBaseTypeEnum.SqlServer,
    'oracle': DataBaseTypeEnum.Oracle
  };

  constructor() { }

  ngOnInit() {
  }
}
