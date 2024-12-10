export interface TokenBody {
  tokenId: string;
  expirationDateTime: Date;
  alternateId: string;
}

export interface Token {
  token: TokenBody;
}

export interface TokenGenRes {
  tokens: Token[];
}
