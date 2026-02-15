import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-delete-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>Confirm Deletion</h2>
    <mat-dialog-content style="padding: 20px 24px;">
      <p style="margin: 0 0 16px 0;">Are you sure you want to delete <strong>"{{data.productName}}"</strong>?</p>
      <div style="display: flex; align-items: center; gap: 8px; color: #f44336; background-color: rgba(244, 67, 54, 0.1); padding: 12px; border-radius: 4px;">
        <mat-icon>warning</mat-icon>
        <span>This action cannot be undone.</span>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end" style="padding: 8px 24px 16px;">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="warn" [mat-dialog-close]="true">
        <mat-icon style="margin-right: 4px;">delete</mat-icon>
        Delete
      </button>
    </mat-dialog-actions>
  `,
  styles: []
})
export class DeleteConfirmDialogComponent {
  data = inject(MAT_DIALOG_DATA);
}
