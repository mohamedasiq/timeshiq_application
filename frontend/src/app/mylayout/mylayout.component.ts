import { AfterViewInit, Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-mylayout',
  templateUrl: './mylayout.component.html',
  styleUrls: ['./mylayout.component.scss']
})
export class MylayoutComponent implements OnInit, AfterViewInit {
  displayName: string = ''
  isUser = false;
  isAdmin = false;
  @ViewChildren('tabList') tabList?: QueryList<any>;
  constructor(private authService: AuthService,private route: ActivatedRoute,private router: Router) { }

  ngOnInit(): void {
    this.authService.user.subscribe((data: any) => {
      this.displayName = `${data['display_name']}(${data['role']})`
    })
    this.route.params.subscribe((data) => {
      console.log(data)
      if(data['role'] == 'admin'){
        this.isAdmin = true
      }
      else{
        this.isUser = true
      }
    })
  }

  ngAfterViewInit(){
    console.log(this.tabList)
    this.tabList?.first.nativeElement.click()
  }

  signOut(){
    this.authService.SignOut()
  }

  routeLink(link: any){
    this.router.navigate([`${link}`],{relativeTo: this.route})
  }

}
