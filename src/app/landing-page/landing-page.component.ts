

import { LandingPageService } from '../services/landing-page.service';
import { environment } from 'src/environments/environment';
import { Component, OnInit, ViewChild, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute, ParamMap, Router } from '@angular/router'; // <-- Import


interface NavbarItem{
id:number;
name:string;
url:string;
is_deleted:number;
}
declare var Razorpay: any;

@Component({
selector:'app-landing-page',
templateUrl:'./landing-page.component.html',
styleUrls:['./landing-page.component.css']
})

export class LandingPageComponent implements OnInit{

menuOpen=false;

navbarOptions:any[]=[];

brandDetails:any;

brandLogoUrl:any;

// POPUP VARIABLES
showPricingPopup: boolean = false;

// SLIDER VARIABLE
isSliderOpen: boolean = false;
apiUrl='https://scratchtosuccess.com/api'; // backend domain

baseUrl=this.apiUrl;

  @ViewChild('daysWrapper') daysWrapper!: ElementRef;


constructor(

private landingService: LandingPageService,

private route: ActivatedRoute,

private router: Router,

private cdr: ChangeDetectorRef

){}

ngOnInit(): void {

this.fetchNavBar();

this.fetchLandingPageInfo();

this.fetchLandingPageBanners();

this.fetchStats();

this.fetchClientLogos();

this.fetchExpertise();
this.fetchWhySection();
this.fetchCaseStudyTitle();

this.fetchCaseStudyImages();
this.fetchProcessSection();

this.fetchTechMainPage();

this.fetchAllTech();


this.handlePaymentReturn();
this.generateMonthOptions();
    this.generateUpcomingDays(30); // generate 4 weeks by default

this.fetchFooterContent();

this.fetchFooterSocialIcons();

}

toggleMenu(){

this.menuOpen=!this.menuOpen;

}

fetchNavBar(): void {

this.landingService.getNavbarOption().subscribe({

next:(res)=>{

if(res.status){

this.navbarOptions=
res.navbarOptions
.filter(
(opt:NavbarItem)=>
opt.name!==null &&
opt.is_deleted===0
)
.map(
(opt:NavbarItem)=>({

...opt,

url:
opt.url ||
`#${opt.name
?.toLowerCase()
.replace(/\s+/g,'')
}`

})
);

this.brandDetails=
res.brandDetails;

this.brandLogoUrl=
res.brandDetails?.brandLogo
?
`${this.baseUrl}${res.brandDetails.brandLogo}`
:null;

}

}

})

}


headingLine1='';

headingLine2='';

subheading='';

buttonText='';

banners:any[]=[];

activityText='';

activityAvg='';

barTotal='';

barAvg='';

barsCount:number=7;


fetchLandingPageInfo(): void {
    this.landingService.getLandingPageInfo().subscribe({
      next: (res) => {
        if (res.status && res.data?.length > 0) {
          const data = res.data[0];
          this.headingLine1 = this.getHeadingPart(data.heading, 0);
          this.headingLine2 = this.getHeadingPart(data.heading, 1);
          this.subheading = data.subheading;
          this.buttonText = data.button_text;
          this.activityText =
          data.activity_text;

          this.activityAvg =
          data.activity_avg;

          this.barTotal =
          data.bar_total;

          this.barAvg =
          data.bar_avg;

          this.barsCount =
          data.bars_count;
          // Dynamically setting the URLs for icons/images using the correct API keys


          // Log the URLs
          // console.log('icon_1_url:', this.icon_1_url);
          // console.log('icon_2_url:', this.icon_2_url);
        }
      },
      error: (err) => {
        // console.error('Error fetching landing page info', err);
      }
    });
  }

  fetchLandingPageBanners(): void {
    this.landingService.getLandingPageBanners().subscribe({
      next: (res) => {
        if (res.status && res.data?.length > 0) {
          const path = window.location.pathname;

          if (path.startsWith('/en')) {
            this.banners = res.data.filter((b: any) =>
              b.status === 'active' && b.lang_type === 'en'
            );
          } else if (path.startsWith('/hi')) {
            this.banners = res.data.filter((b: any) =>
              b.status === 'active' && b.lang_type === 'hi'
            );
          } else {
            // Default case: show all active banners (for root path)
            this.banners = res.data.filter((b: any) =>
              b.status === 'active'
            );
          }

          console.log('Filtered banners:', this.banners);
        }
      },
      error: (err) => {
        console.error('Error fetching landing page banners', err);
      }
    });
  }


getHeadingPart(
heading:string,
index:number
){

if(!heading)
return '';

const words=
heading.split(' ');

const middle=
Math.ceil(
words.length/2
);

return index===0
?
words
.slice(0,middle)
.join(' ')
:
words
.slice(middle)
.join(' ');

}


getVideoUrl(
file:string
){

return this.baseUrl + file;

}


stats:any[]=[];

fetchStats(){

this.landingService
.getStats()
.subscribe({

next:(res:any)=>{

if(res.status){

this.stats=res.data;

}

}

})

}


clientLogos:string[]=[];

duplicatedLogos:string[]=[];


fetchClientLogos(): void {

this.landingService
.getClientLogos()
.subscribe({

next:(res)=>{

if(
res.status &&
res.data?.length>0
){

this.clientLogos=
res.data.map(

(logo:any)=>

`${this.baseUrl}${logo.logo_url}`

);

this.duplicatedLogos=[

...this.clientLogos,

...this.clientLogos

];

}

}

})

}

expertiseData:any[]=[];



fetchExpertise(){

this.landingService
.getExpertise()
.subscribe({

next:(res:any)=>{

if(res.status){

this.expertiseData=
res.data;

}

}

})

}


whyData:any;

whyFeatures:any[]=[];

whyImage='';

fetchWhySection(){

this.landingService
.getWhySection()
.subscribe({

next:(res:any)=>{

if(res.status){

this.whyData=
res.section;

this.whyFeatures=
res.features;

this.whyImage=

this.baseUrl +

res.section.image_url;

}

}

})


}


caseStudyTitle=
'Case Studies';

caseStudyImages:any[]=[];

selectedImageData:any=
null;

fetchCaseStudyTitle():void{

this.landingService
.getCaseStudies()
.subscribe({

next:(res:any)=>{

if(

res.status &&

res.data?.length>0

){

this.caseStudyTitle=

res.data[0].title ||

'Case Studies';

}

}

})

}



fetchCaseStudyImages():void{

this.landingService
.getCaseStudyImages()
.subscribe({

next:(res:any)=>{

if(

res.status &&

res.data?.length>0

){

this.caseStudyImages=
res.data;

}

}

})

}



openBlogPopup(id:number){

const selected=

this.caseStudyImages.find(

(item:any)=>

item.id===id

);

if(selected){

this.selectedImageData=
selected;

}

}



closeBlogPopup(){

this.selectedImageData=
null;

}

processSection:any;

processSteps:any[]=[];

fetchProcessSection(){

this.landingService
.getProcessSection()
.subscribe({

next:(res:any)=>{

if(res.status){

this.processSection=
res.section;

this.processSteps=
res.steps;

}

}

})

}


techMainPage:any;

techList:any[]=[];

duplicatedTechList:any[]=[];

fetchTechMainPage(): void {

this.landingService
.getTechMainPage()
.subscribe({

next:(res)=>{

if(res.status){

this.techMainPage=res.data;

}

}

})

}

fetchAllTech(): void {

this.landingService
.getAllTech()
.subscribe({

next:(res)=>{

if(res.status){

this.techList=
res.data.filter(
(x:any)=>
x.is_deleted===0
);

this.duplicatedTechList=[
...this.techList,
...this.techList
];

}

}

})

}

getTechImage(path:string){

return `${this.baseUrl}${path}`;

}


scrollToContact(){

const section=document.getElementById('contact');

if(section){

section.scrollIntoView({

behavior:'smooth',

block:'start'

});

}

}


name='';

email='';

phone='';

message='';

date: string = '';
  time: string = '';


showDateTimePopup=false;

selectedMonth='';

availableMonths:any[]=[];

days:any[]=[];

selectedDay:any='';

selectedTime='';

availableTimes:any[]=[];

bookedTimes:any[]=[];
  isLoading: boolean = false;

bookingLoading=false;

pendingBookingData:any={};

  amount: number = 0;


showConfirmPaymentPopup=false;

showFinalStatusPopup=false;

bookingSuccessFlag=false;

purchaseSuccessFlag=false;

showPurchaseStatusPopup=false;


bookingError='';
  showFillFormPopup: boolean = false;



openDateTimePopup(){

if(
!this.name ||
!this.email ||
!this.phone
){

alert("Fill all fields");

return;

}

this.showDateTimePopup=true;

this.landingService
.getAvailableSlotsForMonth()
.subscribe(res=>{

if(res.status){

this.days=res.days.map((day:any)=>({

weekday:day.weekday,

day:day.date,

fullDate:day.fullDate,

available:true

}));

}

});

}

scrollDays(direction: 'left' | 'right') {
    const scrollAmount = 100; // pixels
    const container = this.daysWrapper.nativeElement;
    if (direction === 'left') {
      container.scrollLeft -= scrollAmount;
    } else {
      container.scrollLeft += scrollAmount;
    }
  }


  loadDaysForSelectedMonth(): void {
    this.days = []; // Clear previous days
    this.selectedDay = null; // Reset selections
    this.selectedTime = '';
    this.availableTimes = [];
    this.bookedTimes = [];
    this.date = '';
    this.time = '';

    const parsedDate = this.parseMonthYear(this.selectedMonth);
    if (!parsedDate) {
      // this.showSnackbar("Invalid month selected.");
      return;
    }

    // Optional: Add loading indicator specific to days loading
    this.landingService.getAvailableSlotsForSpecificMonth(parsedDate.month, parsedDate.year)
      .subscribe({
        next: (response) => {
          if (response.status && Array.isArray(response.days)) {
            // Map the response to the DayOption interface
            this.days = response.days.map((day: any) => ({
              weekday: day.weekday,
              day: day.date, // Day number
              fullDate: day.fullDate, // YYYY-MM-DD
              available: day.freeSlots > 0,
              slotsText: day.freeSlots > 0 ? `${day.freeSlots} slot${day.freeSlots > 1 ? 's' : ''}` : '—',
              slotsClass: day.freeSlots > 0 ? 'green' : 'gray' // Or 'available'/'full'
            }));
          } else {
            this.days = []; // Ensure days is empty if API fails or returns no days
            // console.error('Failed to fetch available slots or invalid data:', response?.message);
            // Optionally show snackbar
          }
          this.cdr.detectChanges(); // Update the view with new days
        },
        error: (error) => {
          // console.error('Error fetching available slots:', error);
          // this.showSnackbar('Error loading slots for the selected month.');
          this.days = []; // Clear days on error
          this.cdr.detectChanges(); // Update view
        }
      });
  }

  /** Triggered when the month dropdown selection changes */
  onMonthChange(): void {
    // console.log("Month changed to:", this.selectedMonth);
    this.loadDaysForSelectedMonth(); // Reload days for the new month
  }

closePopup(){

this.showDateTimePopup=false;

}

convertTo24HourFormat(time: string): string {
    const [hour, minute, period] = time.split(/[:\s]/);
    let newHour = parseInt(hour, 10);

    if (period === 'PM' && newHour !== 12) {
      newHour += 12;
    }
    if (period === 'AM' && newHour === 12) {
      newHour = 0;
    }

    return `${newHour.toString().padStart(2, '0')}:${minute}`;
  }
selectDay(day:number){

const selected=
this.days.find(
(x:any)=>x.day===day
);

this.selectedDay=day;

this.date=
selected.fullDate;

this.loadAvailableTimesForDate(
selected.fullDate
);

}

submitBooking() {
    alert("Appointment booked!");
    this.closePopup();
  }



selectTime(time:string){

this.selectedTime=time;

this.time=time;

}



bookAppointment(): void {

    // console.log("this.date", this.date)
    // console.log("this.date", this.time)

    if (!this.date || !this.time) {
      alert("Please select date and time.")
      this.bookingError = 'Please select date and time.';
      return;
    }

    const bookingData = {
      name: this.name,
      email: this.email,
      phone: this.phone,
      message: this.message,
      date: this.date,
      time: this.time
    };

    // Save bookingData for payment confirmation
    this.pendingBookingData = bookingData;

    this.bookingLoading = true;
    this.bookingError = '';
    // this.bookingSuccess = '';

    this.showConfirmPaymentPopup = true;

    // Get the current URL path to determine the language (if any)
    const path = window.location.pathname;

    this.landingService.getSubscriptionAmount().subscribe({
      next: (res) => {
        // console.log("Subscription Amount:", res);
        // this.amount = res.data[0].amount;
        // this.pendingBookingData.amount = this.amount;

        const plan = res.data[0]; // Assuming only one subscription plan is returned

        if (path.startsWith('/en')) {
          // For English language path
          this.amount = plan.amount_en;
        } else if (path.startsWith('/hi')) {
          // For Hindi language path
          this.amount = plan.amount_hi;
        } else {
          // Default case: for root path
          this.amount = plan.amount;
        }

        // Assign the selected amount to the booking data
        this.pendingBookingData.amount = this.amount;
      },
      error: (err) => {
        // console.error("Error fetching subscription amount", err);
      }
    });

    // this.landingService.createBooking(bookingData).subscribe({
    //   next: (res) => {
    //     this.bookingLoading = false;
    //     if (res.status) {
    //       this.bookingSuccess = 'Booking successful!';
    //       this.resetAll();
    //       setTimeout(() => this.closeDateTimePopup(), 1000);
    //     } else {
    //       this.bookingError = 'Booking failed. Try again.';
    //     }
    //   },
    //   error: (err) => {
    //     this.bookingLoading = false;
    //     this.bookingError = 'Something went wrong.';
    //     console.error(err);
    //   }
    // });
  }

handlePaymentReturn(): void {
    this.route.queryParamMap.subscribe(params => {
      const transactionId = params.get('transaction_id');
      if (!transactionId) {
        return; // Exit if no transaction ID is present
      }

      this.isLoading = true;

      // Clean the URL immediately to prevent re-triggering on refresh
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { transaction_id: null },
        queryParamsHandling: 'merge',
        replaceUrl: true
      });

      // --- NEW LOGIC: Check if this is a Purchase or a Booking return ---

      const purchaseDataString = sessionStorage.getItem('pendingPurchase');
      const bookingDataString = sessionStorage.getItem('pendingBooking');

      if (purchaseDataString) {
        // === IT'S A PURCHASE RETURN ===
        sessionStorage.removeItem('pendingPurchase');
        const { purchaseId } = JSON.parse(purchaseDataString);

        this.landingService.checkPaymentStatus(transactionId).subscribe({
          next: (res) => {
            this.isLoading = false;
            if (res.success && res.code === 'PAYMENT_SUCCESS') {
              // Payment successful, update the purchase status to 'paid'
              this.updateUserPurchaseStatus(purchaseId, {
                payment_status: 'paid',
                payment_id: res.data?.transactionId || transactionId
              });
              this.purchaseSuccessFlag = true;
              this.showPurchaseStatusPopup = true;
            } else {
              // Payment failed. The record already exists as 'pending'.
              this.showErrorSnackbar('Your payment was not completed. Please try again.');
            }
          },
          error: (err) => {
            this.isLoading = false;
            console.error("Failed to check purchase payment status:", err);
            this.showErrorSnackbar('We could not verify your payment status.');
          }
        });

      } else if (bookingDataString) {
        // === IT'S A BOOKING RETURN ===
        sessionStorage.removeItem('pendingBooking');
        const bookingData = JSON.parse(bookingDataString);

        this.landingService.checkPaymentStatus(transactionId).subscribe({
          next: (res) => {
            this.isLoading = false;
            if (res.success && res.code === 'PAYMENT_SUCCESS') {
              // Payment successful, create the final booking record
              bookingData.paymentId = res.data?.transactionId || transactionId;
              this.createBooking(bookingData);
            } else {
              // Payment failed. The 'interested' record already exists.
              this.showErrorSnackbar('Your payment was not completed. Your booking interest has been recorded.');
            }
          },
          error: (err) => {
            this.isLoading = false;
            console.error("Failed to check booking payment status:", err);
            this.showErrorSnackbar('We could not verify your payment status.');
          }
        });

      } else {
        // Edge case: Transaction ID is in URL, but no session data found.
        this.isLoading = false;
        console.error('Returned from payment but no pending data was found in session storage.');
        this.showErrorSnackbar('Could not retrieve your session details after payment.');
      }
    });
  }
openFinalPopup(): void {

    // console.log("Call final popup")
    this.bookingSuccessFlag = true;
    this.showFinalStatusPopup = true;
    this.cdr.detectChanges()
  }

  isLoaderOpen(): void {
    this.isLoading = true; // Start loader
    this.cdr.detectChanges()
  }

  isLoaderClose(): void {
    this.isLoading = false; // Start loader
    this.cdr.detectChanges()
  }
 showErrorSnackbar(message: string): void {
    // Replace with your actual snackbar implementation
    alert(message); // Simple alert for demonstration
  }

loadAvailableTimesForDate(date:string){

this.landingService
.getBookedSlots(date)
.subscribe({

next:(res)=>{

if(res.status){

this.bookedTimes=res.bookedTimes;

this.availableTimes=
res.remainingTimes;

}

},

error:(err)=>{

console.log(err)

}

})

}

createBooking(bookingData: any): void {
    this.bookingLoading = true;
    this.isLoaderOpen(); // Show loader

    // Show loader for 1 second, then hide and show success popup
    setTimeout(() => {
      this.isLoaderClose();   // Hide loader
      this.bookingLoading = false;
      this.openFinalPopup();  // Show success popup

      // Optimistically reset UI (user thinks booking is done)
      this.resetAll();
      this.closePopup();

      // API call happens in background
      this.landingService.createBooking(bookingData).subscribe({
        next: (res) => {
          if (!res.status) {
            this.bookingSuccessFlag = false;
            this.bookingError = 'Booking failed. Try again.';
            this.showFinalStatusPopup = true; // Optional: overwrite optimistic UI
          }
        },
        error: (err) => {
          // console.error('Booking error:', err);
          this.bookingError = 'Something went wrong.';
          this.showFinalStatusPopup = true;
        }
      });

    }, 1000); // 1 second loader
  }
updateUserPurchaseStatus(purchaseId: any, data: any): void {
    this.landingService.updateUserPurchaseStatus(purchaseId, data).subscribe({
      next: (response) => {
        // console.log('Purchase status updated successfully:', response);
      },
      error: (error) => {
        // console.error('Failed to update purchase status:', error);
        this.showErrorSnackbar('Could not update purchase status.');
      }
    });
  }

  closePurchaseStatusPopup() {
    this.showPurchaseStatusPopup = false;
  }


  closeConfirmPopup(): void {
    this.showConfirmPaymentPopup = false;
    this.bookingLoading = false;

  }

  proceedToPayment(): void {
    this.showConfirmPaymentPopup = false; // Close the confirmation popup
    this.bookingLoading = true;           // Show a loading state on the button

    // Call the new generic createOrder method from your service
    this.landingService.createOrder(this.pendingBookingData.amount).subscribe({
      next: (res) => {
        if (res.status) {
          // --- THIS IS THE NEW DYNAMIC LOGIC ---
          // Check which gateway the backend chose to use
          if (res.gateway === 'razorpay') {
            // If it's Razorpay, call the existing Razorpay payment handler
            this.startRazorpayPayment(res.order, res.key_id, this.pendingBookingData);

          } else if (res.gateway === 'phonepe') {
            // If it's PhonePe, the backend sent a redirectUrl.
            this.interestedBooking(this.pendingBookingData);
            // --- MODIFICATION START ---
            // Store booking data in session storage before redirecting
            if (this.pendingBookingData) {
              sessionStorage.setItem('pendingBooking', JSON.stringify(this.pendingBookingData));
            }
            // --- MODIFICATION END ---

            if (res.redirectUrl) {
              window.location.href = res.redirectUrl;
            } else {
              // Handle error if the URL is missing
              this.showErrorSnackbar('Could not get payment URL from PhonePe. Please try again.');
              this.bookingLoading = false; // Stop the loading spinner
            }
          } else {
            // Handle any other unknown gateways or errors
            this.showErrorSnackbar('An unsupported payment gateway was returned.');
            this.bookingLoading = false;
          }
        } else {
          // Handle error response from your own backend (e.g., "No active gateway")
          this.showErrorSnackbar(res.message || 'Error creating payment order.');
          this.bookingLoading = false;
        }
      },
      error: (err) => {
        // Handle HTTP errors (e.g., server is down)
        this.showErrorSnackbar(err?.error?.message || 'A server error occurred while initiating payment.');
        this.bookingLoading = false;
      }
    });
  }

  closeFillFormPopup(): void {
    this.showFillFormPopup = false;
  }

   closeFinalStatusPopup(): void {
    this.showFinalStatusPopup = false;
    this.cdr.detectChanges()
  }
convertTo12HourFormat(time: string): string {
    const [hourStr, minute, _] = time.split(':'); // handle "14:30:00"
    let hour = parseInt(hourStr, 10);
    const period = hour >= 12 ? 'PM' : 'AM';

    if (hour > 12) {
      hour -= 12;
    } else if (hour === 0) {
      hour = 12;
    }

    return `${hour}:${minute} ${period}`;
  }
  parseMonthYear(monthString: string): { month: number, year: number } | null {
    try {
      const date = new Date(monthString + " 1"); // Add day 1 to make it parseable
      if (isNaN(date.getTime())) { // Check if parsing failed
        throw new Error("Invalid date string");
      }
      const month = date.getMonth() + 1; // getMonth is 0-11, need 1-12
      const year = date.getFullYear();
      return { month, year };
    } catch (e) {
      // console.error("Error parsing month string:", monthString, e);
      return null;
    }
  }


interestedBooking(bookingData: any): void {
    this.bookingLoading = true;
    // Optimistically reset UI (user thinks booking is done)
    this.resetAll();

    // API call happens in background
    this.landingService.interetedBooking(bookingData).subscribe({
      next: (res) => {

      },
      error: (err) => {
        // console.error('Booking error:', err);
        this.bookingError = 'Something went wrong.';
      }
    });

  }

  startRazorpayPayment(order: any, key_id: string, bookingData: any): void {
    const options: any = {
      key: key_id, // <-- USES DYNAMIC KEY FROM BACKEND
      amount: order.amount,
      currency: order.currency,
      name: 'Sunra Softech Pvt Ltd',
      description: 'Booking Payment',
      order_id: order.id,
      handler: (response: any) => {
        // On success, call your verify function
        this.verifyRazorpayPayment(response, bookingData);
      },
      prefill: {
        name: bookingData.name,
        email: bookingData.email,
        contact: bookingData.phone
      },
      modal: {
        ondismiss: () => {
          // User closed the popup without paying
          this.interestedBooking(bookingData);
          this.bookingLoading = false;
        }
      }
    };

    const rzp = new Razorpay(options);
    rzp.open();

    rzp.on('payment.failed', (response: any) => {
      this.interestedBooking(bookingData);
      this.bookingLoading = false;
    });
  }

  // This is previous working code
  verifyPayment(response: any, bookingData: any): void {
    const paymentPayload = {
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature
    };

    this.landingService.verifyRazorpayPayment(paymentPayload).subscribe({
      next: (verifyRes) => {
        if (verifyRes.status) {
          // Payment is verified, proceed with booking
          bookingData.paymentId = response.razorpay_payment_id;
          this.createBooking(bookingData);
        } else {
          this.bookingError = 'Payment verification failed.';
        }
      },
      error: () => {
        this.bookingError = 'Payment verification failed.';
      }
    });
  }

  /**
   * This function verifies the Razorpay payment with the backend.
   * It now sends the gateway_name along with the payment data.
   */
  verifyRazorpayPayment(response: any, bookingData: any): void {
    const paymentPayload = {
      gateway_name: 'razorpay', // We know this is Razorpay because this function was called
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature
    };

    // Call the new generic verifyPayment method
    this.landingService.verifyPayment(paymentPayload).subscribe({
      next: (verifyRes) => {
        if (verifyRes.status) {
          bookingData.paymentId = response.razorpay_payment_id;
          this.createBooking(bookingData);
        } else {
          this.bookingError = 'Payment verification failed.';
          this.showErrorSnackbar(this.bookingError);
          this.bookingLoading = false;
        }
      },
      error: () => {
        this.bookingError = 'Payment verification failed.';
        this.showErrorSnackbar(this.bookingError);
        this.bookingLoading = false;
      }
    });
  }




resetAll(): void {
    this.name = '';
    this.email = '';
    this.phone = '';
    this.message = '';
    this.date = '';
    this.time = '';
  }

 generateMonthOptions(): void {
    const currentMonth = new Date();
    this.availableMonths = [];

    for (let i = 0; i < 12; i++) {
      const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + i, 1);
      const monthString = newDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
      this.availableMonths.push(monthString);
    }

    // Set default month to the first month in the list
    this.selectedMonth = this.availableMonths[0];
  }


  generateUpcomingDays(numberOfDays: number): void {
    const today = new Date();
    this.days = [];

    for (let i = 0; i < numberOfDays; i++) {
      const day = new Date(today);
      day.setDate(today.getDate() + i);

      const weekday = day.toLocaleDateString('en-US', { weekday: 'short' });
      const dateNum = day.getDate();

      this.days.push({
        weekday,
        day: dateNum,
        fullDate: day.toISOString().split('T')[0], // e.g., 2025-04-16
        slotsText: this.getSlotText(),
        slotsClass: this.getRandomSlotClass(),
        available: true
      });
    }
  }

  getSlotText(): string {
    const slotCount = Math.floor(Math.random() * 10); // simulate slot count
    return slotCount === 0 ? '—' : `${slotCount} slot${slotCount > 1 ? 's' : ''}`;
  }

  getRandomSlotClass(): string {
    const classes = ['green', 'purple', 'red', ''];
    return classes[Math.floor(Math.random() * classes.length)];
  }



    selectedPlan: any = null; // To store the chosen plan (optional)
  showConfirmPricePaymentPopup: boolean = false;
  selectedPlanTitle: string = '';
  packageAmount: number = 0;
signupData = {
    name: '',
    email: '',
    phone: '',
    project_name: '',
    project_description: ''
  };

pricingPlans: any[] = [];      // <--- Changed type to any[]
  pricingLoading: boolean = false;
  pricingError: string | null = null;
  isSignupSubmitting: boolean = false;
showSignupForm: boolean = false;
  createdPurchaseId: string | null = null;
  createdPurchaseData: any = null;
  // Facebook referral tracking
isFacebookReferral:boolean=false;

// User language tracking
userLanguage:string='';

// Optional if using pricing
fbPrice:any=null;
fbPriceEn:any=null;
fbPriceHi:any=null;

  onSignupFormSubmit(): void {
    if (!this.selectedPlan) {
      // console.error('No plan selected');
      return;
    }
    if (!this.signupData.name || !this.signupData.email || !this.signupData.phone || !this.signupData.project_name || !this.signupData.project_description) {
      // alert("Please fill all required fields.");
      return;
    }

    this.isSignupSubmitting = true; // <<< START LOADER

    // Use the price from the selectedPlan (which might be discounted)
    const finalPrice = this.selectedPlan.price;
    this.packageAmount = finalPrice; // Update confirmation amount
    this.selectedPlanTitle = this.selectedPlan.title;


    const purchaseData = {
      name: this.signupData.name,
      email: this.signupData.email,
      phone: this.signupData.phone,
      pricing_popup_id: this.selectedPlan.id,
      price: finalPrice, // <-- IMPORTANT: Use the potentially discounted price
      original_price: this.selectedPlan.original_price ?? finalPrice, // Send original price too if available
      project_name: this.signupData.project_name,
      project_description: this.signupData.project_description,
      referral_source: this.isFacebookReferral ? 'facebook' : null // Optional: Track referral source
    };

    this.createdPurchaseData = purchaseData; // Store data before API call

    // Show confirmation *after* storing data, *before* API call for creation
    // this.showConfirmPricePaymentPopup = true;

    // IMPORTANT: Create user purchase entry *before* initiating payment flow
    // This marks interest even if payment fails/is abandoned.
    this.landingService.createUserPurchase(purchaseData).subscribe({
      next: (response) => {
        // console.log('User Purchase record created/updated:', response);
        this.isSignupSubmitting = false; // <<< STOP LOADER
        if (response && response.data && response.data.id) {
          this.createdPurchaseId = response.data.id; // Store the ID from the response
          this.showConfirmPricePaymentPopup = true; // <<<< THIS LINE IS MOVED HERE
          // Now the confirmation popup is already visible, user can proceed to pay

          // Clear form data on successful API call
          this.signupData = {
            name: '',
            email: '',
            phone: '',
            project_name: '',
            project_description: ''
          };

        } else {
          this.isSignupSubmitting = false; // <<< STOP LOADER
          this.showErrorSnackbar('Failed to record purchase interest. Please try again.');
          this.closePriceConfirmPopup(); // Close confirmation if initial recording failed
        }
      },
      error: (error) => {

        this.showErrorSnackbar('Error recording purchase interest. Please try again.');
        this.closePriceConfirmPopup();
      }
    });
  }
   closePriceConfirmPopup(): void {
    this.showConfirmPricePaymentPopup = false;

  }

selectPlanAndOpenSignup(plan: any): void {
    this.selectedPlan = plan; // plan already has the potentially discounted price
    // console.log('Selected Plan (Price might be discounted):', this.selectedPlan);

    this.packageAmount = plan.price; // Use the current price (discounted or not)
    this.selectedPlanTitle = plan.title;
    this.showSignupForm = true;
  }

  closeSignupForm(): void {
    this.showSignupForm = false; // Hide the signup form
    this.selectedPlan = null; // Clear selected plan when closing signup (optional)
    // Reset signup form fields if needed
    // this.signupData = { name: '', email: '', password: '' };
    // Reset signup form fields when closing
    this.signupData = {
      name: '',
      email: '',
      phone: '',
      project_name: '',
      project_description: ''
    };
    this.isSignupSubmitting = false; // <<< RESET LOADER STATE if form is
  }

  detectFacebookReferral(): void {
    this.route.queryParamMap.subscribe(params => {
      const source = params.get('utm_source'); // Check for 'utm_source'
      const medium = params.get('utm_medium'); // Optional: check medium too
      // Add more specific checks if needed (e.g., campaign)
      if (source && source.toLowerCase() === 'facebook') {
        this.isFacebookReferral = true;
        console.log('Facebook referral detected!');
        // If prices are already loaded, adjust them now
        if (this.pricingPlans.length > 0) {
          this.applyFacebookDiscount();
        }
      } else {
        this.isFacebookReferral = false;
      }
    });
  }


  // --- *** REVISED applyFacebookDiscount *** ---
  applyFacebookDiscount(): void {
    // console.log('Applying discount logic. isFacebookReferral:', this.isFacebookReferral, 'userLanguage:', this.userLanguage);

    this.pricingPlans = this.pricingPlans.map((plan: any) => {
      // Ensure prices are numbers
      const standardPrice = parseFloat(plan.price);
      const fbPriceEn = plan.facebook_price_en !== null && plan.facebook_price_en !== undefined ? parseFloat(plan.facebook_price_en) : null;
      const fbPriceHi = plan.facebook_price_hi !== null && plan.facebook_price_hi !== undefined ? parseFloat(plan.facebook_price_hi) : null;

      let finalPrice = standardPrice;
      let isActuallyDiscounted = false;
      const originalDisplayPrice = standardPrice; // Base price before FB logic

      if (this.isFacebookReferral) {
        // console.log(`Plan ${plan.id}: Is FB referral. Lang: ${this.userLanguage}`);

        if (this.userLanguage === 'hi' && fbPriceHi !== null && !isNaN(fbPriceHi)) {
          finalPrice = fbPriceHi;
          isActuallyDiscounted = finalPrice < standardPrice;
          // console.log(` -> Using FB Hindi price: ${finalPrice}. Discounted: ${isActuallyDiscounted}`);
        } else if (this.userLanguage === 'en' && fbPriceEn !== null && !isNaN(fbPriceEn)) {
          finalPrice = fbPriceEn;
          isActuallyDiscounted = finalPrice < standardPrice;
          // console.log(` -> Using FB English price: ${finalPrice}. Discounted: ${isActuallyDiscounted}`);
        } else {
          // From FB, but no specific valid price for this language, use standard
          finalPrice = standardPrice;
          isActuallyDiscounted = false; // Not discounted compared to standard
          // console.log(` -> No specific FB price for lang ${this.userLanguage}. Using standard price: ${finalPrice}`);
        }
      } else {
        // Not from FB, use standard price
        finalPrice = standardPrice;
        isActuallyDiscounted = false;
        //  console.log(`Plan ${plan.id}: Not FB referral. Using standard price: ${finalPrice}`);
      }

      return {
        ...plan,
        price: finalPrice,
        original_price: originalDisplayPrice, // Store the standard price for display if discounted
        is_discounted: isActuallyDiscounted
      };
    });

    // console.log('Pricing Plans AFTER discount logic:', JSON.stringify(this.pricingPlans, null, 2));
    this.cdr.detectChanges();
  }

fetchPricingData(): void {
    this.pricingLoading = true;
    this.pricingError = null;
    this.landingService.getPricingPopupContent().subscribe({
      next: (response: any) => {
        // console.log('Raw API pricing response:', JSON.stringify(response, null, 2));
        if (response && response.status === true && Array.isArray(response.data)) {
          // Assign raw data first
          this.pricingPlans = response.data;
          // console.log('Pricing Plans before discount logic:', JSON.stringify(this.pricingPlans, null, 2));
          // Apply the discount logic (which now handles FB + language)
          this.applyFacebookDiscount(); // This sets price, original_price, is_discounted
        } else {
          this.pricingError = 'Could not load pricing info.';
          this.pricingPlans = [];
        }
        this.pricingLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        // console.error('Error fetching pricing data:', err);
        this.pricingError = 'Failed to load pricing.';
        this.pricingLoading = false;
        this.pricingPlans = [];
        this.cdr.detectChanges();
      }
    });
  }

proceedToSignupPurchasePayment(): void {
    this.closePriceConfirmPopup(); // Close confirmation popup first

    if (!this.createdPurchaseId || !this.createdPurchaseData) {
      this.showErrorSnackbar('No purchase data found. Please submit the form again.');
      return;
    }

    // Use the price stored in createdPurchaseData for the payment
    const paymentAmount = this.createdPurchaseData.price;

    // *** KEY CHANGE: Call the generic createOrder service method ***
    this.landingService.createOrder(paymentAmount).subscribe({
      next: (res) => {
        if (res.status) {
          // --- DYNAMIC GATEWAY LOGIC ---
          if (res.gateway === 'razorpay') {
            // If Razorpay is active, start the Razorpay popup flow
            // Pass the dynamic key_id from the backend response
            this.startRazorpaySignupPayment(res.order, res.key_id, this.createdPurchaseId, this.createdPurchaseData);

          } else if (res.gateway === 'phonepe') {
            // If PhonePe is active, prepare for redirect

            // 1. Store the necessary purchase info in session storage.
            //    This is how we'll remember what to update when the user returns.
            const purchaseSessionData = {
              purchaseId: this.createdPurchaseId,
              purchaseData: this.createdPurchaseData
            };
            sessionStorage.setItem('pendingPurchase', JSON.stringify(purchaseSessionData));

            // 2. Redirect the user to the PhonePe payment page
            if (res.redirectUrl) {
              window.location.href = res.redirectUrl;
            } else {
              this.showErrorSnackbar('Could not get payment URL from PhonePe. Please try again.');
            }
          } else {
            this.showErrorSnackbar('An unsupported payment gateway was returned.');
          }
        } else {
          this.showErrorSnackbar(`Failed to create payment order. ${res.message || ''}`);
        }
      },
      error: (err) => {
        const errorMsg = err?.error?.message || 'Error creating payment order.';
        this.showErrorSnackbar(errorMsg);
      }
    });
  }


  startRazorpaySignupPayment(order: any, key_id: string, purchaseId: any, data: any): void {
    const options = {
      // *** KEY CHANGE: Use the dynamic key from the backend ***
      key: key_id,
      amount: order.amount,
      currency: order.currency,
      name: 'Sunra Softech Pvt Ltd',
      description: 'Plan Purchase',
      order_id: order.id,
      handler: (response: any) => {
        // On success, this calls the verification function
        this.verifySignupPurchasePayment(response, purchaseId, data);
      },
      prefill: {
        name: data.name,
        email: data.email,
        contact: data.phone
      },
      notes: {
        purchaseId: purchaseId, // Store our internal purchase ID
        planId: data.pricing_popup_id
      },
      modal: {
        ondismiss: () => {
          // User closed the popup without paying.
          // The 'pending' record already exists in the database, so we don't need to do anything here.
          // You could optionally show a message.
          this.showErrorSnackbar('Payment was cancelled.');
        }
      },
      theme: { color: '#3399cc' }
    };

    const rzp = new Razorpay(options);
    rzp.open();
  }

  verifySignupPurchasePayment(response: any, purchaseId: any, data: any): void {
    // *** KEY CHANGE: Create a payload for the generic verifyPayment endpoint ***
    const payload = {
      gateway_name: 'razorpay', // We know this is razorpay because this function was called
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature
    };

    // *** KEY CHANGE: Call the generic verifyPayment service method ***
    this.landingService.verifyPayment(payload).subscribe({
      next: (res) => {
        if (res.status) {
          // Verification successful, update the purchase record to "paid"
          this.updateUserPurchaseStatus(purchaseId, {
            payment_status: 'paid',
            payment_id: response.razorpay_payment_id
          });
          this.purchaseSuccessFlag = true;
          this.showPurchaseStatusPopup = true;
        } else {
          this.showErrorSnackbar('Payment verification failed.');
          this.purchaseSuccessFlag = false;
          this.showPurchaseStatusPopup = true;
        }
      },
      error: () => {
        this.showErrorSnackbar('Payment verification failed.');
        this.purchaseSuccessFlag = false;
        this.showPurchaseStatusPopup = true;
      }
    });
  }

  footerContent: any; // Declare the footerContent property here
  socialIcons: any[] = [];  // Array to store social icons


showLegalPopup=false;

legalPopupType='';

fetchFooterContent(): void {
    this.landingService.getFooterContent().subscribe((response) => {
      if (response.status && response.footerContent) {
        this.footerContent = response.footerContent; // Store the footer content
      } else {
        // console.error('Failed to retrieve footer content');
      }
    }, (error) => {
      // console.error('Error fetching footer content:', error);
    });
  }

  fetchFooterSocialIcons(): void {
    this.landingService.getFooterSocailIcon().subscribe((response: any) => {
      if (response.status) {
        this.socialIcons = response.data;  // Store the social icons in the array
      }
    }, error => {
      // console.error("Error fetching social icons:", error);
    });
  }
openLegalPopup(type:string){

this.legalPopupType=type;

this.showLegalPopup=true;

}

closeLegalPopup(){

this.showLegalPopup=false;

}
 closePricingPopup(): void {
    this.showPricingPopup = false;
  }


  scrollToSection(event: Event, sectionId: string | null): void {
    if (sectionId?.startsWith('#')) {
      event.preventDefault();
      // console.log('Scrolling to:', sectionId);
      const element = document.querySelector(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      // console.log('Invalid or missing section ID:', sectionId);
    }
    this.isSliderOpen = false;
  }
onNavLinkClick(event: Event, item: any): void {
    event.preventDefault(); // Prevent default link behavior

    if (item.name === 'Pricing') {
      // Open the Pricing Popup when the "Pricing" option is clicked
      this.openPricingPopup();
    } else {
      // Handle other navbar links (e.g., scrolling to sections)
      this.scrollToSection(event, item.url);
    }
  }

  openPricingPopup(): void {
    this.showPricingPopup = true;
    this.fetchPricingData();
    this.isSliderOpen = false;
  }

}




