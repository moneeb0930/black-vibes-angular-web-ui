import {  Injectable } from '@angular/core';
import { downloadData } from 'aws-amplify/storage';


@Injectable({
  providedIn: 'root'
})
export class StorageService {  

  constructor(  //@Inject('bucketName') private bucketName: string
  ) {    

  }

  async getJsonFile(filename:string, _options: any) : Promise<any> {
    try {
      const downloadResult = await downloadData({ key: filename }).result;
      const jsonData = await downloadResult.body.json();
      // Alternatively, you can use `downloadResult.body.blob()`
      // or `downloadResult.body.json()` get read body in Blob or JSON format. console.log('Succeed: ', jsonData);
      return (Promise.resolve(jsonData));
     
    } catch (error) {
      console.log('Error : ', error);
      throw error;
    }
  }



}
