import { Component, inject, OnInit } from '@angular/core';
import { IonItem, IonLabel, IonSpinner } from "@ionic/angular";
import { SpinnerService } from '../../services/spinner.service';

@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss'],
  imports: [IonSpinner]
})
export class SpinnerComponent  implements OnInit {

  spinnerService = inject(SpinnerService);

  ngOnInit() {}

}
