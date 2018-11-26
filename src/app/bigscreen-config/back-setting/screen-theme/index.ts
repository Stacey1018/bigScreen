import { FormsModule } from '@angular/forms';
import { GridsterModule } from 'angular-gridster2';
import { FileUploadModule } from 'ng2-file-upload';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PicturePreviewDialogComponent } from './picture-preview-dialog';
import { ScreenThemeUploadComponent } from './screen-theme-upload';
import { ScreenThemeHomeComponent } from './screen-theme-home/index';
import { ScreenThemeRoutingModule } from './screen-theme-routing.module';
import { SharedModule } from '../../../share/shared.module';
import { CommonMethodService } from '../../../services/scene/commonMethod.service';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    GridsterModule,
    FileUploadModule,
    ScreenThemeRoutingModule
  ],
  declarations: [
    ScreenThemeHomeComponent,
    PicturePreviewDialogComponent,
    ScreenThemeUploadComponent
  ],
  entryComponents: [
    PicturePreviewDialogComponent
  ],
  providers: [ CommonMethodService]
})
export class ScreenThemeModule { }
