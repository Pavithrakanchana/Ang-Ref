
export interface signInStatus{
  sessionTicket: string;
  userInfo: UserInfo;
}

export interface UserInfo{
  emailAddress: string;
  firstName: string;
  lastName:string;
  producerCode: string;
  userId: string;
  alternateId:string;
}