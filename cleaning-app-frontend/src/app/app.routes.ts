import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { MainComponent } from './components/main/main.component';
import { ManagerReportComponent } from './components/manager-report/manager-report.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'report', component: ManagerReportComponent },
  { path: 'report/:sessionId', component: ManagerReportComponent },
  { path: 'main', component: MainComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '/login' }
];
