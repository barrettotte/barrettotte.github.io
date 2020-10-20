import { Component, OnInit } from '@angular/core';
import { FileService } from '../services/file.service';

@Component({
  selector: 'app-resume',
  templateUrl: './resume.component.html',
  styleUrls: ['./resume.component.scss']
})
export class ResumeComponent implements OnInit {

  pdfUrl = 'https://raw.githubusercontent.com/barrettotte/Resume/master/barrettotte-resume.pdf';
  repoUrl = 'https://github.com/barrettotte/Resume';

  constructor(private fileService: FileService) { }

  ngOnInit() { }

  getPdf() {
    this.fileService.getPdf(this.pdfUrl).subscribe(
      data => {
        const element = document.createElement('a');
        element.href = URL.createObjectURL(data);
        element.download = 'BarrettOtte-Resume.pdf';
        document.body.appendChild(element);
        element.click();
      },
      error => {
        console.error(error);
      }
    );
  }
}
