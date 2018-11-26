import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatToolbarModule,
  MatIconModule,
  MatButtonModule,
  MatCardModule,
  MatInputModule,
  MatListModule,
  MatTabsModule,
  MatPaginatorModule,
  MatGridListModule,
  MatRadioModule,
  MatMenuModule,
  MatCheckboxModule,
  MatDialogModule,
  MatFormFieldModule,
  MatSelectModule,
  MatProgressSpinnerModule,
} from '@angular/material';
import { FormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { CustomScrollbarModule } from './custom-scrollbar/custom-scrollbar.module';

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatListModule,
    MatTabsModule,
    MatPaginatorModule,
    MatGridListModule,
    MatRadioModule,
    MatMenuModule,
    MatCheckboxModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    CustomScrollbarModule
  ],
  exports: [
    FormsModule,
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatListModule,
    MatTabsModule,
    MatPaginatorModule,
    MatGridListModule,
    MatRadioModule,
    MatMenuModule,
    MatCheckboxModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    CustomScrollbarModule
  ],
})
export class SharedModule { }

