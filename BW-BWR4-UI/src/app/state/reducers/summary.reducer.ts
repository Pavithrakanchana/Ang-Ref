import { createReducer, on } from '@ngrx/store'
import QuoteSummary, { BindData } from '../model/summary.model'
import * as Actions from '../actions/summary.action'
import { ObjectUtils } from 'src/app/shared/utilities/object-utils';
import { GlobalConstants } from '../../constants/global.constant';

export const initialState: Readonly<QuoteSummary> = {
    quoteNumber: '',
    policyNumber: '',
    applicantAddress: {
        addressType: "",
        streetName: "",
        city: "",
        state: "",
        postalCode: "",
        POBoxIndicator: false,
        movedWithinPastSixMonthIndicator: false
    },
    pNIDetails: {
        firstName: "",
        lastName: "",
        middleName: "",
        suffix: "",
        gender: "",
        maritalStatus: "",
        dateOfBirth: "",
        socialSecurityNumber: "",
        emailAddress: "",
        nonOwnerPolicyIndicator: false
    },
    indicators: {
        dobIndicator: '',
        nameIndicator: ''
    },
    drivers: [],
    vehicles: [],
    qid: '',
    callIDStatus: false,
    term: '',
    policyState: '',
    esign : false,
    nonOwner: false,
    PNIEmail: '',
    mco: '',
    channel: '',
    rateBook: '',
    producerCode: '',
    sessionToken: '',
    newQuote: '',
    quoteSrc: '',
    bridgeStatus: false,
    applicantSaved: '',
    orderCLUEReport: false,
    policyEffectiveDate:'',
    mailingStateStatus: false,
    global:{test:''},
    pageStatus: [],
    helpText: [],
    eligibleDiscounts: [],
    bridgeEdits: [],
    bindData: {},
    payPlan: {},
    policyFees: [],
    dynamicValidValues: [],
    dynamicDriverValues: [],
    dynamicPolicyInfoValues: [],
    prodSweepStatus: false,
    producerUserId: '',
    producerUserFirstName: '',
    producerUserLastName: '',
    routingRules: {},
    lastVistedPage: -1,
    stepperRestriction: false,
    priorCarrierInsIndicator: GlobalConstants.EMPTY_STRING,
    clueReport: {},
    filingTypeFR44:false,
    filingTypeSR22:false,
    duiViolationInd: false,
    userName: '',
    isNotRequiredBylawDisplay: false,
    isRequiredConvictionDate : false,
}

export const summaryReducer = createReducer(
    initialState,

    on(Actions.addQuoteNumber, (state, { quoteNumber }) => {

        if (state.quoteNumber != null && state.quoteNumber != '') return state;
        return { ...state, quoteNumber };
    }),
     on(Actions.addPolicyNumber, (state, { policyNumber }) => {

        if (state.policyNumber != null && state.policyNumber != '') return state;
        return { ...state, policyNumber };
    }),
    on(Actions.applicantAddress, (state, { applicantAddress }) => {

        return {...state, applicantAddress};
    }),
    on(Actions.pNIDetails, (state, { pNIDetails }) => {

        return {...state, pNIDetails};
    }),
     on(Actions.indicators, (state, { indicators }) => {

        return {...state, indicators};
    }),
    on(Actions.test, (state, { global }) => {
        return {...state, global};
    }),
    on(Actions.addDriver, (state, { driver }) => ({
        ...state,
        drivers: [...state.drivers, driver]
    })),
    on(Actions.removeDriver, (state, { driverName }) => {

     return {...state, ...state.drivers.filter(driver => driver.firstName.concat(driver.middleName).concat(driver.lastName) !== driverName)}
  }),
  on(Actions.clearDrivers, (state) => ({
    ...state,
    drivers: []
})),
    on(Actions.addVehicle, (state, { vehicle }) => ({
        ...state,
        vehicles: [...state.vehicles, vehicle]
    })),
    on(Actions.addPageStatus, (state, { pageStatus }) => ({
        ...state,
        pageStatus: [...state.pageStatus, pageStatus]
    })),
    on(Actions.orderCLUEReport, (state, { orderCLUEReport }) => {

        return { ...state, orderCLUEReport };
    }),
    on(Actions.policyEffectiveDate, (state, { policyEffectiveDate }) => {

        return { ...state, policyEffectiveDate };
    }),
    on(Actions.mailingStateStatus, (state, { mailingStateStatus }) => {

        return { ...state, mailingStateStatus };
    }),
    on(Actions.setQID, (state, { qid }) => {

        return { ...state, qid };
    }),
    on(Actions.setTerm, (state, { term }) => {

        return { ...state, term };
    }),
    on(Actions.callIDStatus, (state, { callIDStatus }) => {

        return { ...state, callIDStatus };
    }),
    on(Actions.prodSweepStatus, (state, { prodSweepStatus }) => {

        return { ...state, prodSweepStatus };
    }),
    on(Actions.setPolicyState, (state, { policyState }) => {
        return { ...state, policyState };
    }),
    on(Actions.setNonOwner, (state, { nonOwner }) => {
        return { ...state, nonOwner };
    }),
    on(Actions.setRideShare, (state, { rideShare }) => {
        return { ...state, rideShare };
    }),
    on(Actions.setEsign, (state, { esign }) => {
        return { ...state, esign };
    }),
     on(Actions.setPNIEmail, (state, { PNIEmail }) => {
        return { ...state, PNIEmail };
    }),
    on(Actions.setMCO, (state, { mco }) => {
        return { ...state, mco };
    }),
    on(Actions.setRateBook, (state, { rateBook }) => {
      return { ...state, rateBook };
  }),
    on(Actions.setChannel, (state, { channel }) => {
        return { ...state, channel };
    }),
    on(Actions.setProducerCode, (state, { producerCode }) => {

      if (state.producerCode != null && state.producerCode != '') return state;
        return { ...state, producerCode };
    }),
    on(Actions.setSSOToken, (state, { ssoToken }) => {
        return { ...state, ssoToken };
    }),
    on(Actions.setUserName, (state, { userName }) => {
        // console.log(userName,"======userName");
        
        return { ...state, userName };
    }),
    on(Actions.setProducerUserId, (state, { producerUserId }) => {
      return { ...state, producerUserId };
  }),
  on(Actions.setProducerUserFirstName, (state, { producerUserFirstName }) => {
    return { ...state, producerUserFirstName };
}),
on(Actions.setProducerUserLastName, (state, { producerUserLastName }) => {
    return { ...state, producerUserLastName };
}),
    on(Actions.setNewQuoteFlag, (state, { newQuote }) => {
        return { ...state, newQuote };
    }),
    on(Actions.setQuoteSrc, (state, { quoteSrc }) => {
      return { ...state, quoteSrc };
  }),
  on(Actions.setBridgingStatus, (state, { bridgeStatus }) => {
    return { ...state, bridgeStatus };
}),

    on(Actions.setApplicantSavedFlag, (state, { applicantSaved }) => {
        return { ...state, applicantSaved };
    }),
    on(Actions.setHelpText, (state, { helpText }) => ({
        ...state,
        helpText: [...state.helpText, helpText]
    })),
    on(Actions.setHelpText, (state, { helpText }) => ({
      ...state,
      helpText: [...state.helpText, helpText]
    })),
    on(Actions.addEligibleDiscounts, (state, {eligibleDiscounts}) => {
      if (state.eligibleDiscounts != null && state.eligibleDiscounts.length > 0) return state;
        return { ...state, eligibleDiscounts };

    }),
    on(Actions.bridgeEdits, (state, {bridgeEdits}) => {
      if (state.bridgeEdits != null && state.bridgeEdits.length > 0) return state;
        return { ...state, bridgeEdits };

    }),
    on(Actions.test, (state, { global }) => {
        return {...state, global};
    }),
    on(Actions.sessionToken, (state, {sessionToken }) => {
        return { ...state, sessionToken };
    }),
    on(Actions.bindData, (state, { bindData }) => {

      return {...state, bindData};
  }),

  on(Actions.payPlan, (state, { payPlan }) => {

    return {...state, payPlan};
  }),
  on(Actions.policyFees, (state, { policyFees }) => {
    return { ...state, policyFees };
}),
on(Actions.dynamicValidValues, (state, { dynamicValidValues }) => {
    if (state.dynamicValidValues != null && state.dynamicValidValues.length > 0) return state;
      return { ...state, dynamicValidValues };

  }),

  on(Actions.dynamicDriverValues, (state, { dynamicDriverValues }) => {
    if (state.dynamicDriverValues != null && state.dynamicDriverValues.length > 0) return state;
      return { ...state, dynamicDriverValues };

  }),

  on(Actions.dynamicPolicyInfoValues, (state, { dynamicPolicyInfoValues }) => {
    if (state.dynamicPolicyInfoValues != null && state.dynamicPolicyInfoValues.length > 0) return state;
      return { ...state, dynamicPolicyInfoValues };
  
  }),

on(Actions.routingRules, (state, { routingRules }) => {
  if (state.routingRules != null && !ObjectUtils.isObjectEmpty(state.routingRules)) return state;
    return { ...state, routingRules };

}),
on(Actions.addClueReport, (state, { clueReport }) => {
    return { ...state, clueReport };
}),
 on(Actions.lastVistedPage, (state, { lastVistedPage }) => {
        return { ...state, lastVistedPage };
 }),
 on(Actions.stepperRestriction, (state, { stepperRestriction }) => {
        return { ...state, stepperRestriction };
    }),
on(Actions.priorCarrierInsIndicator, (state, { priorCarrierInsIndicator }) => {
    return { ...state, priorCarrierInsIndicator };
}),
on(Actions.umpdStoredValue, (state, { umpdStoredValue }) => {
    return { ...state, umpdStoredValue };
}),
on(Actions.umbiStoredValue, (state, { umbiStoredValue }) => {
    return { ...state, umbiStoredValue };
}),
on(Actions.setQuoteResponseChannel, (state, { quoteResponseChannel }) => {
    return { ...state, quoteResponseChannel };
}),
on(Actions.setFilingTypeFR44, (state, { filingTypeFR44 }) => {
    return { ...state, filingTypeFR44 };
}),
on(Actions.setFilingTypeSR22, (state, { filingTypeSR22 }) => {
    return { ...state, filingTypeSR22 };
}),
on(Actions.setDUIViolationInd, (state, { duiViolationInd }) => {
    return { ...state, duiViolationInd };
}),
on(Actions.setNotRequiredBylawDisplay, (state, { isNotRequiredBylawDisplay }) => {
    return { ...state, isNotRequiredBylawDisplay };
}),
on(Actions.setIsRequiredConvictionDate, (state, { isRequiredConvictionDate }) => {
    return { ...state, isRequiredConvictionDate };
})
);
