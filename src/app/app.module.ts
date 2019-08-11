import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { NavbarModule, ButtonsModule, IconsModule, CardsModule } from 'angular-bootstrap-md';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';

import { appRoutes } from './routes';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavComponent } from './nav/nav.component';
import { HomeComponent } from './home/home.component';
import { ProjectsComponent } from './projects/projects.component';
import { PostsComponent } from './posts/posts.component';
import { AboutComponent } from './about/about.component';
import { OtherComponent } from './other/other.component';
import { ResumeComponent } from './resume/resume.component';
import { FooterComponent } from './footer/footer.component';
import { MaintenanceComponent } from './maintenance/maintenance.component';
import { ProjectCardComponent } from './project-card/project-card.component';

@NgModule({
   declarations: [
      AppComponent,
      NavComponent,
      HomeComponent,
      ProjectsComponent,
      PostsComponent,
      AboutComponent,
      OtherComponent,
      ResumeComponent,
      FooterComponent,
      MaintenanceComponent,
      ProjectCardComponent
   ],
   imports: [
      BrowserModule,
      AppRoutingModule,
      NavbarModule,
      IconsModule,
      CardsModule,
      RouterModule.forRoot(appRoutes),
      ButtonsModule.forRoot(),
      NgbPaginationModule
   ],
   providers: [],
   bootstrap: [
      AppComponent
   ]
})
export class AppModule { }
