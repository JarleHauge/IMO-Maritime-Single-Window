import { Injectable } from '@angular/core';
import { Http, RequestOptions } from '@angular/http';
import { BehaviorSubject } from 'rxjs';
import { Observable } from 'rxjs/Observable';
import { FormMetaData } from '../models/form-meta-data.interface';
import { PortCallDetailsModel } from '../models/port-call-details-model';
import { PortCallModel } from '../models/port-call-model';
import { AuthRequest } from './auth.request.service';

@Injectable()
export class PortCallService {

  // Global overview
  private getPortCallsByLocationUrl: string;
  // Global port call
  private getPortCallUrl: string;
  private registerNewPortCallUrl: string;
  private getPortCallsByUserIdUrl: string;
  private updatePortCallUrl: string;
  private updatePortCallStatusActiveUrl: string;
  private updatePortCallStatusCancelledUrl: string;
  private deletePortCallUrl: string;
  // Global purpose
  private getPurposeUrl: string;
  private getOtherNameUrl: string;
  private setPurposeForPortCallUrl: string;
  private removePurposeForPortCallUrl: string;
  // Global details
  private saveDetailsUrl: string;
  private getDetailsByPortCallIdUrl: string;
  // Global clearance
  private getClearanceUrl: string;
  private saveClearanceUrl: string;
  private getClearanceListByPortCallUrl: string;
  private registerClearanceAgenciesForPortCallUrl: string;
  // Subjects
  private detailsPristine = new BehaviorSubject<boolean>(true);
  detailsPristine$ = this.detailsPristine.asObservable();

  constructor(private http: Http, private authRequestService: AuthRequest) {
    // Port call
    this.getPortCallUrl = "api/portcall/get";
    this.registerNewPortCallUrl = "api/portcall/register";
    this.getPortCallsByUserIdUrl = "api/portcall/user";
    this.updatePortCallUrl = "api/portcall/update";
    this.updatePortCallStatusActiveUrl = "api/portcall/updatestatus/active"
    this.updatePortCallStatusCancelledUrl = 'api/portcall/updatestatus/cancelled';
    this.deletePortCallUrl = 'api/portcall/delete';
    // Purpose
    this.getPurposeUrl = "api/purpose/portcall";
    this.getOtherNameUrl = "api/purpose/getothername";
    this.setPurposeForPortCallUrl = "api/purpose/setpurposeforportcall";
    this.removePurposeForPortCallUrl = "api/purpose/removepurposeforportcall";
    // Details
    this.saveDetailsUrl = "api/portcalldetails/register";
    this.getDetailsByPortCallIdUrl = "api/portcalldetails/portcall";
    // Overview
    this.getPortCallsByLocationUrl = 'api/portcall/location';
    // Clearance
    this.saveClearanceUrl = "api/organizationportcall/save";
    this.getClearanceListByPortCallUrl = "api/organizationportcall/portcall";
    this.registerClearanceAgenciesForPortCallUrl = "api/organizationportcall/register";
  }



  // Helper method for ETA/ETD formatting
  etaEtdDataFormat(arrival, departure) {
    let etaData = new Date(arrival);
    let etdData = new Date(departure);
    return {
      eta: {
        year: etaData.getFullYear(), month: etaData.getMonth() + 1, day: etaData.getDate(),
        hour: etaData.getHours(), minute: etaData.getMinutes()
      },
      etd: {
        year: etdData.getFullYear(), month: etdData.getMonth() + 1, day: etdData.getDate(),
        hour: etdData.getHours(), minute: etdData.getMinutes()
      }
    };
  }

  private updateOverviewSource = new BehaviorSubject<any>(null);
  updateOverview$ = this.updateOverviewSource.asObservable();
  setUpdateOverview(data) {
    this.updateOverviewSource.next(data);
  }

  /* * * * * * * * * * * * *
   *                       *
   *  == NEW PORT CALL ==  *
   *                       *
   * * * * * * * * * * * * */
  // setPortCall: sets values for: Ship, Location, ETA/ETD, and Clearance list
  setPortCall(overview: any) {
    // Ship Location Time
    this.setShipData(overview.ship);
    this.setLocationData(overview.location);
    var etaEtd = this.etaEtdDataFormat(overview.portCall.locationEta, overview.portCall.locationEtd);
    this.setEtaEtdData(etaEtd);
    // Clearance list
    this.setClearanceListData(overview.clearanceList);
    this.setPortCallStatus(overview.status);
  }

  updatePortCall(portCall: PortCallModel) {
    console.log("Updating port call...");
    let authHeaders = this.authRequestService.GetHeaders();
    let options = new RequestOptions({ headers: authHeaders });
    this.http.post(this.registerNewPortCallUrl, portCall, options)
      .map(res => res.json()).subscribe(
        data => {
          console.log("Success");
          console.log(data);
        }
      )
  }
  private shipDataSource = new BehaviorSubject<any>(null);
  shipData$ = this.shipDataSource.asObservable();
  setShipData(data) {
    this.shipDataSource.next(data);
  }
  // Location
  private locationDataSource = new BehaviorSubject<any>(null);
  locationData$ = this.locationDataSource.asObservable();
  setLocationData(data) {  // NEW
    this.locationDataSource.next(data);
  }
  // ETA / ETD
  private etaEtdDataSource = new BehaviorSubject<any>(null);
  etaEtdData$ = this.etaEtdDataSource.asObservable();
  setEtaEtdData(data) {  // NEW
    this.etaEtdDataSource.next(data);
  }
  // Status
  private portCallStatusSource = new BehaviorSubject<any>(null);
  portCallStatusData$ = this.portCallStatusSource.asObservable();
  setPortCallStatus(data) {
    this.portCallStatusSource.next(data);
  }

  // REGISTER NEW PORT CALL
  registerNewPortCall(portCall: PortCallModel) {  // NEW
    console.log("Registering new port call...");
    let authHeaders = this.authRequestService.GetHeaders();
    let options = new RequestOptions({ headers: authHeaders });
    let uri: string = this.registerNewPortCallUrl;
    this.setPortCallStatus("Draft");
    return this.http.post(uri, portCall, options).map(res => res.json());
  }
  // Set port call status to actual
  updatePortCallStatusActive(portCallId: number) {
    let uri = [this.updatePortCallStatusActiveUrl, portCallId].join('/');
    console.log("Updating port call status to active...");
    return this.http.post(uri, null).map(res => res.json());
  }
  // Set port call status to cancelled
  updatePortCallStatusCancelled(portCallId: number) {
    let uri = [this.updatePortCallStatusCancelledUrl, portCallId].join('/');
    console.log("Updating port call status to cancelled...");
    this.http.post(uri, null).map(res => res.json()).subscribe(
      updateStatusResponse => {
        console.log("Port call successfully cancelled.");
      }
    );
  }
  // Delete port call draft
  deletePortCallDraft(portCall: PortCallModel) {
    console.log("Deleting port call...");
    let authHeaders = this.authRequestService.GetHeaders();
    let options = new RequestOptions({ headers: authHeaders });
    let uri: string = this.deletePortCallUrl;

    return this.http.post(uri, portCall, options).map(res => res.json());
  }
  // Get methods
  getPortCallById(portCallId: number) {
    let uri: string = [this.getPortCallUrl, portCallId].join('/');

    return this.http.get(uri)
      .map(res => res.json());
  }

  getPortCallsByUserId(userId: number) {
    let uri: string = [this.getPortCallsByUserIdUrl, userId].join('/');
    return this.http.get(uri)
      .map(res => res.json());
  }


  /* * * * * * * * * * * * * * * 
   *                           *
   * == PORT CALL DETAILS ==   *
   *                           *
   * * * * * * * * * * * * * * */
  setDetails(details: PortCallDetailsModel) {  // NEW
    this.setCrewPassengersAndDimensionsData(details);
    this.setReportingForThisPortCallData(details);
    this.setDetailsIdentificationData(details);
    this.detailsPristine.next(true);
  }
  private detailsIdentificationSource = new BehaviorSubject<any>(null);
  detailsIdentificationData$ = this.detailsIdentificationSource.asObservable();
  setDetailsIdentificationData(data) {
    this.detailsPristine.next(false);
    this.detailsIdentificationSource.next(data);
  }
  // Crew, passengers and dimensions
  private crewPassengersAndDimensionsSource = new BehaviorSubject<any>(null);
  crewPassengersAndDimensionsData$ = this.crewPassengersAndDimensionsSource.asObservable();
  setCrewPassengersAndDimensionsData(data) { // NEW
    this.detailsPristine.next(false);
    this.crewPassengersAndDimensionsSource.next(data);
  }
  private crewPassengersAndDimensionsMeta = new BehaviorSubject<FormMetaData>({ valid: true });
  crewPassengersAndDimensionsMeta$ = this.crewPassengersAndDimensionsMeta.asObservable();
  setCrewPassengersAndDimensionsMeta(metaData: FormMetaData) {
    this.crewPassengersAndDimensionsMeta.next(metaData);
  }
  // Reporting
  // This is a list of checkboxes that specify which FAL forms to include in this port call registration 
  private reportingForThisPortCallSource = new BehaviorSubject<any>(null);
  reportingForThisPortCallData$ = this.reportingForThisPortCallSource.asObservable();
  setReportingForThisPortCallData(data) {  // NEW
    this.detailsPristine.next(false);
    this.reportingForThisPortCallSource.next(data);
  }
  // Purpose
  private portCallPurposeDataSource = new BehaviorSubject<any>(null);
  portCallPurposeData$ = this.portCallPurposeDataSource.asObservable();
  setPortCallPurposeData(data) { // NEW
    this.detailsPristine.next(false);
    this.portCallPurposeDataSource.next(data);
  }
  // User-specified purpose of type "Other"
  private otherPurposeNameSource = new BehaviorSubject<string>("");
  otherPurposeName$ = this.otherPurposeNameSource.asObservable();
  setOtherPurposeName(data) {
    this.detailsPristine.next(false);
    this.otherPurposeNameSource.next(data);
  }
  // Not used yet:
  private otherPurposeDataSource = new BehaviorSubject<any>(null);
  otherPurposeData$ = this.otherPurposeDataSource.asObservable();
  setOtherPurposeData(data) { // NEW - try to use otherpurpose object instead of just name string, for easier id handling etc.
    this.otherPurposeDataSource.next(data);
  }
  // SAVE DETAILS
  saveDetails(details: any, purposes: any, otherName: string) { // NEW
    details.portCallDetailsId = details.portCallId; // To ensure one-to-one in DB
    console.log("Saving port call details...");
    this.http.post(this.saveDetailsUrl, details).map(res => res.json()).subscribe(
      detailsResponse => {
        console.log("Successfully saved port call details.");
        this.savePurposesForPortCall(details.portCallId, purposes, otherName);
      }
    );
  }
  savePurposesForPortCall(pcId: number, purposes: any, otherName: string) { // NEW
    if (purposes.length === 0) {
      let uri = [this.removePurposeForPortCallUrl, pcId.toString()].join('/');
      this.http.post(uri, null).map(res => res.json()).subscribe(
        removePurposeResponse => {
          if (removePurposeResponse) this.detailsPristine.next(true);
        }
      );
    } else {
      var pcHasPurposeList = purposes.map(p => {
        return {
          portCallId: pcId,
          portCallPurposeId: p.portCallPurposeId,
          purposeIfUnknown: (p.name == "Other") ? otherName : null
        }
      });
      console.log("Saving port call purposes to database...");
      this.http.post(this.setPurposeForPortCallUrl, pcHasPurposeList).map(res => res.json()).subscribe(
        purposeResponse => {
          if (purposeResponse) this.detailsPristine.next(true);
          console.log("Purposes successfully saved.");
        }
      );
    }

  }

  // Get methods
  getDetailsByPortCallId(portCallId: number) {
    let uri: string = [this.getDetailsByPortCallIdUrl, portCallId].join('/');
    return this.http.get(uri).map(res => {
      if (res && res.ok) {
        return res.json();
      } else {
        return res.status;
      }
    }).catch(e => {
      return Observable.of(e);
    });
  }

  getPurposeByPortCallId(portCallId: number) {
    let uri: string = [this.getPurposeUrl, portCallId].join('/');
    return this.http.get(uri).map(res => {
      return res.json();
    }).catch(e => {
      console.log(e);
      return Observable.of(e);
    });
  }

  getOtherName(portCallId: number) {
    let uri: string = [this.getOtherNameUrl, portCallId].join('/');
    return this.http.get(uri).map(res => {
      return res.json();
    }).catch(e => {
      console.log(e);
      return Observable.of(e);
    });
  }



  /* * * * * * * * * * *  
   *                   *
   *  == CLEARANCE ==  *
   *                   *
   * * * * * * * * * * */
  private clearanceDataSource = new BehaviorSubject<any>(null);
  clearanceData$ = this.clearanceDataSource.asObservable();
  setClearance(data) {
    this.clearanceDataSource.next(data);
  }

  // Clearance agencies list
  private clearanceListDataSource = new BehaviorSubject<any>(null);
  clearanceListData$ = this.clearanceListDataSource.asObservable();
  setClearanceListData(data) {  // NEW
    this.clearanceListDataSource.next(data);
  }

  saveClearance(clearanceModel: any) {
    console.log('Saving clearance to database...');
    this.http.post(this.saveClearanceUrl, clearanceModel).map(res => res.json()).subscribe(
      data => {
        console.log("Clearance saved successfully.");
      },
      error => {
        console.log("ERROR: ", error);
      }
    );
  }

  getClearanceListForPortCall(portCallId: number) {
    let uri: string = [this.getClearanceListByPortCallUrl, portCallId].join('/');

    return this.http.get(uri).map(
      res => res.json().catch(
        error => {
          return Observable.of(error);
        }
      )
    );
  }

  // REGISTER CLEARANCE AGENCIES FOR NEW PORT CALL
  registerClearanceAgenciesForPortCall(portCall: PortCallModel) { // NEW
    this.http.post(this.registerClearanceAgenciesForPortCallUrl, portCall).map(res => res.json()).subscribe(
      clearanceData => {
        console.log("Clearance agency information successfully added to port call.");
        this.clearanceListDataSource.next(clearanceData);
      }
    )
  }



  // Wipe methods
  wipeServiceData() {
    this.shipDataSource.next(null);
    this.locationDataSource.next(null);
    this.etaEtdDataSource.next(null);
    this.clearanceListDataSource.next(null);
    // Details
    this.wipeDetailsData();
  }


  wipeDetailsData() {
    this.reportingForThisPortCallSource.next(null);
    this.crewPassengersAndDimensionsSource.next(null);
    this.portCallPurposeDataSource.next(null);
    this.otherPurposeNameSource.next("");
    this.detailsPristine.next(true);
  }
}

