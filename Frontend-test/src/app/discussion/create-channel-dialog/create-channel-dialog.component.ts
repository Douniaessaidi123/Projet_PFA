import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Projet } from '../../services/team.service';

@Component({
  selector: 'app-create-channel-dialog',
  templateUrl: './create-channel-dialog.component.html',
})
export class CreateChannelDialogComponent {
  selectedProjectId: number | null = null;

  constructor(
    public dialogRef: MatDialogRef<CreateChannelDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { projets: Projet[] }
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onCreate(): void {
    if (this.selectedProjectId !== null) {
      this.dialogRef.close(this.selectedProjectId);
    }
  }
}

