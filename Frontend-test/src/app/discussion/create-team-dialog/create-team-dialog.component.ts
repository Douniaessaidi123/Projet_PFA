
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-create-team-dialog',
  templateUrl: './create-team-dialog.component.html',
  styleUrls: ['./create-team-dialog.component.css']
})
export class CreateTeamDialogComponent {
  groupName: string = '';
  selectedMembers: number[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: { contacts: any[] }) {}
}

