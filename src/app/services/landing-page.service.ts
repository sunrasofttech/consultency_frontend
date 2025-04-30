import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LandingPageService {

  // private baseUrl = 'http://localhost:3000/api/admin'; // Adjust the URL as needed

  private baseUrl = `${environment.baseurl}`;

  constructor(private http: HttpClient) { }

  getNavbarOption(): Observable<any> {
    return this.http.post(`${this.baseUrl}/admin/getNavbarOption`, {});
  }

  getLandingPageInfo(): Observable<any> {
    return this.http.post(`${this.baseUrl}/admin/getLandingPageInfo`, {});
  }

  getLandingPageBanners(): Observable<any> {
    return this.http.post(`${this.baseUrl}/admin/getLandingPageBanners`, {});
  }

  getFeaturePage(): Observable<any> {
    return this.http.post(`${this.baseUrl}/admin/getFeaturePage`, {});
  }

  getAboutPage(): Observable<any> {
    return this.http.post(`${this.baseUrl}/admin/getAboutPage`, {});
  }

  getClientPageContent(): Observable<any> {
    return this.http.post(`${this.baseUrl}/admin/getClientPageContent`, {});
  }

  getClientLogos(): Observable<any> {
    return this.http.post(`${this.baseUrl}/admin/getClientLogos`, {});
  }


  getAllProcessSteps(): Observable<any> {
    return this.http.post(`${this.baseUrl}/admin/getAllProcessSteps`, {});
  }

  getCaseStudies(): Observable<any> {
    return this.http.post(`${this.baseUrl}/admin/getCaseStudies`, {});
  }

  getCaseStudyImages(): Observable<any> {
    return this.http.post(`${this.baseUrl}/admin/getCaseStudyImages`, {});
  }


  getContactPage(): Observable<any> {
    return this.http.post(`${this.baseUrl}/admin/getContactPage`, {});
  }

  getTechMainPage(): Observable<any> {
    return this.http.post(`${this.baseUrl}/admin/getTechMainPage`, {});
  }

  getAllTech(): Observable<any> {
    return this.http.post(`${this.baseUrl}/admin/getTech`, {});
  }

  getFaqPage(): Observable<any> {
    return this.http.post(`${this.baseUrl}/admin/getFaqPage`, {});
  }

  getFaqQnsAns(): Observable<any> {
    return this.http.post(`${this.baseUrl}/admin/getFaqQnsAns`, {});
  }

  createBooking(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/booking/createBooking`, data);
  }

  getBookedSlots(date: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/booking/getBookedSlot`, { date });
  }

  getAvailableSlotsForMonth() {
    return this.http.post<any>(`${this.baseUrl}/booking/getAvailableSlotsForMonth`, {});
  }

  getSubscriptionAmount(): Observable<any> {
    return this.http.post(`${this.baseUrl}/admin/getSubscriptionAmount`, {});
  }

  // createRazorpayOrder(amount: number): Observable<any> {
  //   return this.http.post(`${this.baseUrl}/payment/createRazorpayOrder`, { amount });
  // }

  createRazorpayOrder(amount: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/payment/createRazorpayOrder`, { amount }).pipe(
      catchError((error) => {
        // Pass the error message from the backend to the component
        return throwError(error.error?.message || 'Error initiating payment');
      })
    );
  }


  verifyRazorpayPayment(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/payment/verifyRazorpayPayment`, payload);
  }

  // New method to get footer content
  getFooterContent(): Observable<any> {
    return this.http.post(`${this.baseUrl}/admin/getFooterContent`, {});
  }

  getFooterSocailIcon(): Observable<any> {
    return this.http.post(`${this.baseUrl}/admin/getFooterSocailIcon`, {});
  }

  getCaseStudyImageById(id: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/admin/getCaseStudyImageById/${id}`, {});
  }


  interetedBooking(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/booking/interestedBooking`, data);
  }


  getPricingPopupContent(): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/admin/getPricePopupContant`, {});
  }



  /**
   * Fetches available days and slot counts for a specific month and year.
   * @param month Month number (1-12)
   * @param year Year (e.g., 2025)
   */
  getAvailableSlotsForSpecificMonth(month: number, year: number): Observable<any> {
    const body = { month, year };
    // Use the SAME endpoint, but now send month/year in the body
    return this.http.post<any>(`${this.baseUrl}/booking/getAvailableSlotsForMonth`, body);
  }

  createUserPurchase(data: any): Observable<any> {
    const url = `${this.baseUrl}/userPurchase/createUserPurchase`;
    return this.http.post(url, data).pipe(
      catchError((error) => {
        console.error('Error creating user purchase:', error);
        return throwError(() => error);
      })
    );
  }

  // Method to update user purchase status
  updateUserPurchaseStatus(purchaseId: any, data: any): Observable<any> {
    const url = `${this.baseUrl}/userPurchase/updateUserPurchaseStatus/${purchaseId}`;
    return this.http.post<any>(url, data);
  }


}
