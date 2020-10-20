import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import {
   NavbarModule, ButtonsModule, IconsModule,
   CardsModule, CarouselModule, BadgeModule,
   ModalModule
} from 'angular-bootstrap-md';

import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavComponent } from './nav/nav.component';
import { HomeComponent } from './home/home.component';
import { ProjectsComponent } from './projects/projects.component';
import { PostsComponent } from './posts/posts.component';
import { AboutComponent } from './about/about.component';
import { OtherComponent } from './other/other.component';
import { FooterComponent } from './footer/footer.component';
import { MaintenanceComponent } from './maintenance/maintenance.component';
import { ProjectCardComponent } from './project-card/project-card.component';
import { PostCardComponent } from './post-card/post-card.component';

import { DataService } from './services/data.service';
import { AboutPanelComponent } from './about-panel/about-panel.component';
import { PaginationService } from './services/pagination.service';
import { HomeCarouselComponent } from './home-carousel/home-carousel.component';


@NgModule({
   declarations: [
      AppComponent,
      NavComponent,
      HomeComponent,
      ProjectsComponent,
      PostsComponent,
      AboutComponent,
      OtherComponent,
      FooterComponent,
      MaintenanceComponent,
      ProjectCardComponent,
      PostCardComponent,
      AboutPanelComponent,
      HomeCarouselComponent
   ],
   imports: [
      BrowserModule,
      AppRoutingModule,
      HttpClientModule,
      NavbarModule,
      IconsModule,
      CardsModule,
      RouterModule,
      BadgeModule,
      ModalModule.forRoot(),
      ButtonsModule.forRoot(),
      CarouselModule.forRoot(),
      NgbPaginationModule,
   ],
   providers: [
      DataService,
      PaginationService
   ],
   bootstrap: [
      AppComponent
   ]
})
export class AppModule { }
