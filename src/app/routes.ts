import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ProjectsComponent } from './projects/projects.component';
import { PostsComponent } from './posts/posts.component';
import { AboutComponent } from './about/about.component';
import { OtherComponent } from './other/other.component';
import { ResumeComponent } from './resume/resume.component';

export const appRoutes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'projects', component: ProjectsComponent },
    { path: 'posts', component: PostsComponent },
    { path: 'about', component: AboutComponent },
    { path: 'other', component: OtherComponent },
    { path: 'resume', component: ResumeComponent },
    { path: '**', redirectTo: '', pathMatch: 'full' },
];
