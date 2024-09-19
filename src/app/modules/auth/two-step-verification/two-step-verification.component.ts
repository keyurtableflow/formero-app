import { NgIf } from '@angular/common';
import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule, NgForm, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterLink } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import { AuthService } from 'app/core/auth/auth.service';
import { UserService } from 'app/core/user/user.service';
import { finalize } from 'rxjs';

@Component({
    selector: 'app-two-step-verification',
    templateUrl: './two-step-verification.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    standalone: true,
    imports: [NgIf, FuseAlertComponent, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatProgressSpinnerModule, RouterLink],
})
export class TwoStepVerificationComponent {
    @ViewChild('forgotPasswordNgForm') forgotPasswordNgForm: NgForm;

    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: '',
    };
    twoStepVerificationForm: UntypedFormGroup;
    showAlert: boolean = false;
    phone: any = '';

    /**
     * Constructor
     */
    constructor(
        private _authService: AuthService,
        private _formBuilder: UntypedFormBuilder,
        private _router: Router,
        private _userService: UserService
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.phone = JSON.parse(localStorage.getItem('phone'));

        if(!this.phone){
            this._router.navigateByUrl('/sign-in')
            return;
        }
        // Create the form
        this.twoStepVerificationForm = this._formBuilder.group({
            otp: ['', [Validators.required]],
        });
    }

    verifyOTP(): void {
        if (this.twoStepVerificationForm.invalid) {
            return;
        }

        this.twoStepVerificationForm.disable();

        this.showAlert = false;

        this._authService.verifyOTP(this.phone, this.twoStepVerificationForm.get('otp').value)
            .pipe(
                finalize(() => {
                    this.twoStepVerificationForm.enable();
                    this.showAlert = true;
                }),
            )
            .subscribe(
                (response) => {
                    if (response.statusCode === 200) {
                        this.alert = {
                            type: 'success',
                            message: response.message,
                        };
                        this._authService._authenticated = true;
                        this._authService.accessToken = response?.data?.token;
                        // this._authService.refreshToken = response?.data?.refreshToken;
                        // this._userService.user = response?.data?.user;
                        // localStorage.setItem('user', JSON.stringify(response?.data?.user))
                
                        this.forgotPasswordNgForm.resetForm();

                        this._router.navigateByUrl('/users/list');
                    } else {
                        this.alert = {
                            type: 'error',
                            message: response.message,
                        };
                    }

                }, (error : any) => {
                    this.alert = {
                        type: 'error',
                        message: error?.error?.message,
                    };
                }
            );
    }

    resendOTP(){
        this._authService.resendOTP(this.phone)
            .pipe(
                finalize(() => {
                    // Re-enable the form
                    this.twoStepVerificationForm.enable();

                    // Show the alert
                    this.showAlert = true;
                }),
            )
            .subscribe(
                (response) => {
                    if (response.statusCode === 200) {
                        // Set the alert
                        this.alert = {
                            type: 'success',
                            message: response.message,
                        };
                    } else {
                        // Set the alert
                        this.alert = {
                            type: 'error',
                            message: response.message,
                        };
                    }

                }, (error : any) => {
                    this.alert = {
                        type: 'error',
                        message: error.message,
                    };
                }
            );
    }
}
