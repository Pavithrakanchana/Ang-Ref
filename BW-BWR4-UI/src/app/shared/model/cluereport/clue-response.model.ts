


    export interface CurrentCarrierMessage {
        messageType: string;
        messageCode: string;
        messageBody: string;
    }

    export interface CurrentCarrierEDIT {
        messageType: string;
        messageCode: string;
        messageBody: string;
    }

    export interface BasicPolicyDetail {
        inceptionDate: string;
        insurerCompanyCode: string;
        insurerCompanyName: string;
        issueDate: string;
        numberOfOccurrences: string;
        policyContractCodeDescription: string;
        policyTypeCode: string;
        priorPolicyNumber: string;
        status: string;
    }

    export interface VehicleCoverage {
        coverageAmount: string;
        coverageType: string;
    }

    export interface InsuredVehicle {
        vehicleIdentificationNumber: string;
        vehicleMake: string;
        vehicleYear: string;
        businessUseIndicator: string;
        vehicleCoverages: VehicleCoverage[];
    }

    export interface PartyRegistrations {
        typeCode: string;
        endDate: string;
        issueDate: string;
    }

    export interface BirthName {
        firstName: string;
        lastName: string;
    }

    export interface NamedInsured {
        partyRegistrations: PartyRegistrations;
        primeRole: string;
        birthName: BirthName;
    }

    export interface CurrentCarrierData {
        basicPolicyDetail: BasicPolicyDetail;
        insuredVehicle: InsuredVehicle[];
        namedInsured: NamedInsured[];
    }

    export interface ClaimPayment {
        paidAmount: string;
        transactionStatus: string;
        type: string;
    }

    export interface Claim {
        unitNumber: string;
        claimNumber: string;
        policyType: string;
        companyName: string;
        policyNumber: string;
        nameAssocInd: string;
        claimDate: string;
        accidentAtFaultCode: string;
        accidentDescription: string;
        disputeLevel: string;
        accidentCode: string;
        claimPayment: ClaimPayment[];
    }

    export interface PostalAddressDetail {
        addressLine1: string;
    }

    export interface PostalAddress {
        street: string;
        city: string;
        houseNumber: string;
        postalCode: string;
        postalCodeExtension: string;
        region: string;
        postalAddressDetail: PostalAddressDetail;
    }

    export interface PersonRole {
        primeRole: string;
    }

    export interface PersonName {
        firstName: string;
        lastName: string;
        middleName: string;
        suffix: string;
    }

    export interface Person {
        birthDate: string;
        taxRegistrationId: string;
        postalAddress: PostalAddress;
        person: PersonRole;
        personName: PersonName;
    }

    export interface Driver {
        unitNumber: string;
        licenseNumber: string;
        licenseState: string;
        person: Person;
    }

    export interface Vehicle {
        make: string;
        vin: string;
        year: string;
    }

    export interface DeclaredClaim {
        totalPipCount: number;
        claim: Claim;
        driver: Driver;
        vehicle: Vehicle;
    }

    export interface RiskReports {
        issuingAuthority: string;
        currentCarrierMessage: CurrentCarrierMessage[];
        currentCarrierEDITS: CurrentCarrierEDIT[];
        currentCarrierData: CurrentCarrierData[];
        declaredClaim: DeclaredClaim[];
        referenceNumber: string;
        reportedData: string;
        reportReceivedDate: Date;
    }

    export interface ClueResponse {
        riskReports: RiskReports;
    }



