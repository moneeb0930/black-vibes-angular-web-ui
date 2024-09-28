import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot,   Router, CanActivateFn, RouterStateSnapshot } from '@angular/router';
import { 
  signUp, type SignUpOutput,
  signIn, type SignInInput,
  signOut,
  resetPassword, type ResetPasswordOutput,
  getCurrentUser,
  confirmSignUp,
  autoSignIn,
  fetchAuthSession,
  JWT, decodeJWT
} from 'aws-amplify/auth';
import { Logger } from "tslog";
import { AESEncryptDecryptService } from '../services';
import { 
  UserRegistration, 
  UserLoginResult,
  LoggedInUser,
  RegisterResult
} from '@core/types';



@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private _encryptionService: AESEncryptDecryptService,   
    private router: Router,
  ) { }

  async registerUser(register: UserRegistration )  {
    try {
      const signUpResult = await signUp({
        username: register.username,
        password: register.password,
        options: {
          userAttributes: {
            email: register.email,            
            preferred_username : register.username,  //TODO: take the name part of the email
            family_name : register.firstname,   // optional - E.164 number convention
            given_name : register.lastname,
            gender : register.gender,
            locale : register.locale,
            zoneinfo : register.zoneInfo,
            birthdate : register.birthdate 
          },
          // optional
          autoSignIn: true // or SignInOptions e.g { authFlowType: "USER_SRP_AUTH" }         
        }      
      });     
      
      this.handleSignUpNextSteps(signUpResult.nextStep.signUpStep, signUpResult.userId);
     
    } catch (error) {     
     
      //TODO: LOG ERRORS          
      //GO THRU LIST OF ERRORS - RETURN UI FRIENDLY ERROR MSG 
      console.log('Error in registering user', error);
      throw error;
    }
  }

  async loginUser({ username, password }: SignInInput) 
  {
    try {

      const result = await signIn({ username, password });      
      //const loginResult: UserLoginResult = { username: username, isSignedIn: result.isSignedIn,  nextStep: result.nextStep.signInStep}  
      //return Promise.resolve(loginResult);
     
      this.handleSignInUserResult(result.nextStep.signInStep, result.isSignedIn, username);

    } catch (error) {      
      //TODO: LOG ERRORS          
      //GO THRU LIST OF ERRORS - RETURN UI FRIENDLY ERROR MSG 
      console.log('error signing in', error);
      throw error;
    }
  }

  async loginGuestUser() 
  {
    try {

      //const user = await this.loggedInUser();

      //if (!user) {
        await this.signOut();

        //TODO:  Add Username and PWD to the environment variables
        const result = await signIn(
         {
            username: "MonicaThompson7+TEST33@gmail.com", 
            password: "JAN01FRI+BV247"   
        });
        
        if (!result.isSignedIn){
          //check the user role is guest       
          throw new Error("guest user not signed in.");
        } 
      //}

      //console.log("guest user", user);

    } catch (error) {      
      //TODO: LOG ERRORS / GO THRU LIST OF ERRORS - RETURN UI FRIENDLY ERROR MSG 
      console.log('error signing in guest user', error);
      throw error;
    }
  }

 
  async signOut() {
    try {
      await signOut({ global: true });
    } 
    catch (error) 
    {
      console.log('error signing out: ', error);
      throw error;
    }
  }

  async loggedInUser() : Promise<LoggedInUser> { 
    try {
      const userResult = await getCurrentUser();
      console.log(`The username: ${ userResult.username}`);
      console.log(`The userId: ${ userResult.userId}`);
      
      const user: LoggedInUser = { 
         userId: userResult?.userId,  
         username: userResult?.username,        
        };  

        if (user?.userId.length > 0 ) {
          const authSession = await fetchAuthSession();

          // Grab the idtoken from the response
          const token = authSession.tokens?.idToken.toString();
          // Parse the JWT
          const  payload = decodeJWT(token);
          // Access the groups
          const groups = payload["cognito:groups"];

          console.log("payload", payload);

          user.roles = groups;
        }
        
      return ( userResult ? Promise.resolve( user ) : null );
    } 
    catch (err) 
    {
      console.log(err);
      throw err;
    }
  }

  async confirmSignUp(username:string, confirmationCode:string) {
    try {
      const { nextStep } = await confirmSignUp({
        username,
        confirmationCode,
      });
  
      this.handleSignUpNextSteps(nextStep, username);

    } catch (error) {
      console.log(error);
    }
  }

  async resetPassword(username: string) {
    try {
      const output = await resetPassword({ username });
      this.handleResetPasswordNextSteps(output);
    } catch (error) {
      console.log(error);
    }
  }
  
 

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    return new Promise((resolve) => {
      this.loggedInUser()
        .then((user) => {
          console.log("auth user:", user);
          if(user){     
            const userRoles =  user.roles;    
            // check if route is restricted by role
            if (route.data.roles && !userRoles.some((val) => route.data.roles.indexOf(val) !== -1)) {
                // role not authorised so redirect to home page
                this.router.navigate(['/dashboard']);
                resolve(false);
            }
            //authorized, return true
            resolve(true);
          }
        })
        .catch((err) => {                   
          this.router.navigate(['/']);
          resolve(false);         
        });
    });
  }  

  /*************************************************************************
   * PRIVATE METHODS
   *************************************************************************/
  private handleResetPasswordNextSteps(output: ResetPasswordOutput) {
    const { nextStep } = output;
    switch (nextStep.resetPasswordStep) {
      case 'CONFIRM_RESET_PASSWORD_WITH_CODE':
        const codeDeliveryDetails = nextStep.codeDeliveryDetails;
        console.log(
          `Confirmation code was sent to ${codeDeliveryDetails.deliveryMedium}`
        );
        // Collect the confirmation code from the user and pass to confirmResetPassword.
        break;
      case 'DONE':
        console.log('Successfully reset password.');
        //TODO: Redirect to succesful password reset page
        break;
    }
  }

  private async handleSignUpNextSteps( step: RegisterResult["nextStep"], username: string) {
    switch (step.signUpStep) {
      case "DONE":
        this.router.navigate(['/']);
        break;
      case "CONFIRM_SIGN_UP":
    
       //TODO: Redirect end-user to confirm-sign up screen.
       break;
      case "COMPLETE_AUTO_SIGN_IN":
        //const codeDeliveryDetails = step.codeDeliveryDetails;
        //if (codeDeliveryDetails) {
        //TODO: Redirect user to confirm-sign-up with link screen.
        //}
        const signInOutput = await autoSignIn();
        this.handleSignInUserResult(signInOutput.nextStep.signInStep, signInOutput.isSignedIn, username);
        break;
      }
  }

  private async handleSignInUserResult(nextStep: string, isSignedIn: boolean, username: string) 
  {
        switch (nextStep) {
        case 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED':
          console.log('The user was created with a temporary password and must set a new one. Complete the process with confirmSignIn.');
          
          break;
        case 'CONFIRM_SIGN_IN_WITH_CUSTOM_CHALLENGE ':
          console.log('The sign-in must be confirmed with a custom challenge response. Complete the process with confirmSignIn.');
          break;
        case 'CONFIRM_SIGN_IN_WITH_TOTP_CODE':
          console.log('The sign-in must be confirmed with a TOTP code from the user. Complete the process with confirmSignIn.');
          break;
        case 'CONTINUE_SIGN_IN_WITH_TOTP_SETUP':
            console.log('The TOTP setup process must be continued. Complete the process with confirmSignIn.');
            break;
        case 'CONFIRM_SIGN_IN_WITH_SMS_CODE':
          console.log('The sign-in must be confirmed with a SMS code from the user. Complete the process with confirmSignIn.');
          break;
        case 'RESET_PASSWORD':
          console.log('The user must reset their password via resetPassword.');
          //this.resetPassword(username);
          //TODO: SEND TO PASSWORD RESET PAGE
          break;
        case 'CONTINUE_SIGN_IN_WITH_MFA_SELECTION ':
          console.log('The user must select their mode of MFA verification before signing in. Complete the process with confirmSignIn.');
          break;
        case 'CONFIRM_SIGN_UP':
          console.log("The user hasn't completed the sign-up flow fully and must be confirmed via confirmSignUp.");
          //redirect to confirm sign up page
          break;
        case 'DONE':
          console.info('The sign in process has been completed.');
          if (isSignedIn) {
            //redirect to dashboard
            this.router.navigate(['/dashboard']);
          }
          break;
      }

  }


}

export const AuthGuard: CanActivateFn = (next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> => {
  return inject(AuthService).canActivate(next, state);
}

