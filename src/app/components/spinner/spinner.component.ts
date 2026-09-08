import { Component, inject } from '@angular/core';
import { IonSpinner } from '@ionic/angular';
import { SpinnerService } from '../../services/spinner.service';

@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss'],
  imports: [IonSpinner]
})
export class SpinnerComponent {

  spinnerService = inject(SpinnerService);


}
