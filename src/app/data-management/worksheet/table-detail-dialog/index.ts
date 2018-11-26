import { Utils } from './../../../utils/utils';
import { Component, OnInit, Inject, AfterViewInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-table-detail-dialog',
  templateUrl: './table-detail-dialog.component.html',
  styleUrls: ['./table-detail-dialog.component.scss']
})
export class TableDetailDialogComponent implements OnInit, AfterViewInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<TableDetailDialogComponent>) {

  }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    Utils.slimScroll();
  }

  /**
   * 关闭弹框
   */
  public closeDialog() {
    this.dialogRef.close();
  }
}
