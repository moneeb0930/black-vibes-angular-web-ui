import { Injectable } from '@angular/core';
import { DataStore, AuthModeStrategyType} from '@aws-amplify/datastore';
import { generateClient } from 'aws-amplify/api';
import * as queries from './../../../graphql/queries';
import * as mutations from './../../../graphql/mutations';
import { AuthService } from '.';



DataStore.configure({
    authModeStrategyType: AuthModeStrategyType.MULTI_AUTH,
});

const client = generateClient();  


@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  constructor(
    private _auth: AuthService
  ) {
   
  }

  

  async newsletterSignup(userEmail: string) {
    try {

        const email = userEmail.toLowerCase();
        
        if (!this.validateEmail(email)) {
          throw new Error('Not a valid email address.');  //'Not a valid email address.'
        }

        const _filter = {
          filter: {
            email_address: {
              eq: email
            }
          }
        };      
        
        await this._auth.loginGuestUser();        
       
        const newsletters = await client.graphql(
          { 
          query: queries.listNewsletters,     
          variables: _filter,         
          authMode: "userPool",  
         });             

        const emailFound = newsletters['data'].listNewsletters.items;     
       
        if (emailFound && emailFound.length > 0) {
          throw new Error('Email address already exists.'); 
        }   
        
        await this.saveNewsletterEmail(email);

        this._auth.signOut();

    } catch (error) {  
        console.log('Error newsletter', error);
        throw error;
    }
  }

  /** PRIVATE METHIDS  ***/
  private validateEmail = (email: string) => {
    return email.match(
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
  };

  private async saveNewsletterEmail(userEmail: string) {

    const newsletterSignup = {
      email_address: userEmail      
    };
    
    await client.graphql({
      query: mutations.createNewsletter,
      variables: { input: newsletterSignup }
    });

     
  };
  
  
}
