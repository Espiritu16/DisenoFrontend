import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LecturaIoT } from '../../core/models/app-models';
import { MockDataService } from '../../core/services/mock-data.service';

@Component({
  selector: 'app-monitoreo-iot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './monitoreo-iot.component.html',
  styleUrl: './monitoreo-iot.component.css'
})
export class MonitoreoIotComponent {
  threshold = 30;
  lecturas: LecturaIoT[] = [];

  constructor(private mock: MockDataService) {
    this.lecturas = this.mock.getLecturasIot();
  }
}
