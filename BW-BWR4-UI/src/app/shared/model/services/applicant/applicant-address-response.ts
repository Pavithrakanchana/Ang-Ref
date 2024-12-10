export interface AddressResponse {
    
    addressType: string;
    addressLine1: string;
    poBoxIndicator: boolean;
    city: string;
    state: string;
    zipCode: string;
    isMovedWithLastSixMths: boolean;
}