import { Component, OnInit } from '@angular/core';
import { UserModelWithPassword } from '../../../../../shared/models/UserModelWithPassword';
import { UserModel } from '../../../../../shared/models/user-model';
import { AccountService } from '../../../../../shared/services/account.service';
import { AuthService } from '../../../../../shared/services/auth-service';
import { LoginService } from '../../../../../shared/services/login.service';
import { OrganizationService } from '../../../../../shared/services/organization.service';
import { ContentService } from '../../../../../shared/services/content.service';
import { CONTENT_NAMES } from '../../../../../shared/constants/content-names';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationModalComponent } from '../../../../../shared/components/confirmation-modal/confirmation-modal.component';

const RESULT_SUCCES: string = "User was successfully registered.";
const RESULT_FAILURE: string = "There was a problem when trying to register the user. Please try again later.";

@Component({
  selector: 'app-register-user',
  templateUrl: './register-user.component.html',
  styleUrls: ['./register-user.component.css'],
  providers: [UserModel, AccountService]
})
export class RegisterUserComponent implements OnInit {

  user: UserModelWithPassword = {
    email: '',
    phoneNumber: '',
    firstName: '',
    lastName: '',
    password: '',
    roleName: '',
    organizationId: ''
  };
  emailTaken: boolean;
  emailChecked: boolean;

  organizationModel: any;
  organizationSelected: boolean;

  roleList: any[];
  selectedRole: any;

  constructor(
    private userModel: UserModel,
    private accountService: AccountService,
    private organizationService: OrganizationService,
    private contentService: ContentService,
    private modalService: NgbModal
  ) { }

  ngOnInit() {
    this.accountService.getAllRoles().subscribe(
      data => this.roleList = data
    );

    this.organizationService.setOrganizationData(null);
    this.organizationService.organizationData$.subscribe(
      data => {
        if (data) {
          this.organizationModel = data;
          this.user.organizationId = data.organizationId;
          this.organizationSelected = true;
        } else {
          this.organizationSelected = false;
        }
      }
    )
  }

  userExists(emailValid: boolean) {
    if (emailValid) {
      return this.accountService.userExistsByEmail(this.user.email).subscribe(userExists => {
        if (userExists) {
          this.emailTaken = true;
        } else {
          this.emailTaken = false;
        }
        this.emailChecked = true;
      });
    }
  }

  registerUserWithPassword() {
    this.accountService.registerUserWithPassword(this.user)
      .subscribe(
        result => {
          if (result) {
            console.log(result);
            this.openConfirmationModal(ConfirmationModalComponent.TYPE_SUCCESS, RESULT_SUCCES);
          }
        },
        error => {
          console.log(error);
          this.openConfirmationModal(ConfirmationModalComponent.TYPE_FAILURE, RESULT_FAILURE);
        }
      );
  }

  deselectOrganization() {
    this.user.organizationId = null;
    this.organizationModel = null;
    this.organizationSelected = false;
  }

  private goBack() {
    this.contentService.setContent(CONTENT_NAMES.VIEW_PORT_CALLS);
  }

  private openConfirmationModal(modalType: string, bodyText: string) {
    const modalRef = this.modalService.open(ConfirmationModalComponent);
    modalRef.componentInstance.modalType = modalType;
    modalRef.componentInstance.bodyText = bodyText;
    modalRef.result.then(
      result => {
        if (modalType != ConfirmationModalComponent.TYPE_FAILURE) this.goBack();
      },
      reason => {
        if (modalType != ConfirmationModalComponent.TYPE_FAILURE) this.goBack();
      }
    );
  }


}
