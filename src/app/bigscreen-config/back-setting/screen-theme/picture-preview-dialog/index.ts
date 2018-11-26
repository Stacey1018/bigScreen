import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-picture-preview-dialog',
  templateUrl: './picture-preview-dialog.component.html',
  styleUrls: ['./picture-preview-dialog.component.scss']
})
export class PicturePreviewDialogComponent implements OnInit {
  public bgUrl = '';
  public isImage = false;
  constructor(public dialogRef: MatDialogRef<PicturePreviewDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
    this.bgUrl = this.data.url;
    this.isImage = this.data.isImg;
  }

  ngOnInit() {
  }

  /**
   * 关闭弹框
   */
  public closeDialog(): void {
    this.dialogRef.close();
  }

}
