import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { DefConfigService } from '../defConfig.service';

@Injectable()
export class AuthGuardService implements CanActivate {

  constructor(private router: Router, private defSer: DefConfigService) {
  }

  /**
   * 用于判断是否可以激活该路由
   */
  canActivate() {
    if (this.defSer.isLogin) {
      return true;
    } else {
      this.router.navigate(['login']);
      // this.router.navigate(['dashboard/panel']);
      return false;
    }
  }
}
