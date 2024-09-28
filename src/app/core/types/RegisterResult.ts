import { SignUpStep } from "./SignUpStep";
//AuthNextSignUpStep<AuthVerifiableAttributeKey>

export type RegisterResult = {
   userId: string,
   signUpCompleted: boolean,
   nextStep: any
};