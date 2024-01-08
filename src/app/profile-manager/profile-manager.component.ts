import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { ProfileService } from '../profile.service';
import { Profile, Role } from '../types';
import { Subscription, catchError, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-profile-manager',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './profile-manager.component.html',
  styleUrl: './profile-manager.component.css'
})
export class ProfileManagerComponent implements OnInit, OnDestroy {
  private profileService = inject(ProfileService);

  roles: Role[] = [];
  faTrash = faTrash;

  private selectedRole?: Role;

  private profileId = "";

  private subscriptions: Subscription[] = [];

  profiles: Profile[] = [];

  ngOnInit(): void {
    const sub = this.profileService.getRoles()
      .pipe(catchError(() => {
        return of([]);
      }))
      .subscribe(roles => {
        if (roles.length > 0) {
          this.roles = roles;
          this.selectedRole = roles[0];
          this.getProfiles(roles[0].id);
        }
      });

    this.subscriptions.push(sub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  onRoleChanged(event: Event) {
    const roleId = (event.target as HTMLSelectElement).value;
    this.selectedRole = this.roles.find(r => r.id === roleId);
    this.getProfiles(roleId);
  }

  onProfileChanged(event: Event) {
    const profileId = (event.target as HTMLSelectElement).value;
    this.profileId = profileId;
    this.profileService.currentProfileId.next(profileId);
  }


  onCreateRole(role: string) {
    this.profileService.createRole(role).subscribe(r => {
      this.roles.push(r);
    });
  }

  onCreateProfile(name: string) {
    this.profileService.createProfile(name, this.selectedRole!.id)
      .subscribe(p => {
        this.profiles.push(p);
      });
  }

  getProfiles(roleId: string) {
    const sub = this.profileService.getProfiles(roleId)
      .pipe(catchError(() => {
        return of([]);
      }))
      .subscribe(profiles => {
        this.profiles = profiles;
        if (profiles.length > 0) {
          this.profileService.currentProfileId.next(profiles[0].id);
        }
      });

    this.subscriptions.push(sub);
  }

  onDeleteProfile() {
    const sub = this.profileService.deleteProfile(this.selectedRole!.id, this.profileId)
      .subscribe(() => {
        this.profiles = this.profiles.filter(p => p.id !== this.profileId);
        this.profileId = "";
        this.profileService.currentProfileId.next("");
      });

    this.subscriptions.push(sub);
  }

  onDeleteRole() {
    const sub = this.profileService.deleteRole(this.selectedRole!.id)
      .subscribe(() => {
        this.roles = this.roles.filter(r => r.id !== this.selectedRole!.id);
        this.selectedRole = this.roles[0];
      });

    this.subscriptions.push(sub);
  }
}
