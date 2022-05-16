import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  // { path: 'projects', component: ProjectsComponent },
  // { path: 'posts', component: PostsComponent },
  // { path: 'about', component: AboutComponent },
  // { path: 'other', component: OtherComponent },
  // { path: 'other/vintage', component: VintageComponent },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
