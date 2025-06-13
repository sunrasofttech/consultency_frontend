

import { LandingPageService } from '../services/landing-page.service';
import { environment } from 'src/environments/environment';
import { Component, OnInit, ViewChild, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute, ParamMap, Router } from '@angular/router'; // <-- Import 



interface NavbarItem {
  id: number;
  name: string | null;
  type: string | null;
  url: string | null;
  is_visible: number | null;
  is_deleted: number;
  brand_logo?: string | null;
  brand_name?: string | null;
}

interface DayOption {
  weekday: string;
  day: number;
  fullDate: string;
  slotsText: string;
  slotsClass: string;
  available: boolean;
}

// --- Add VideoSection interface (optional but recommended) ---
// interface VideoSection {
//   id: number;
//   title: string;
//   youtube_link: string | null;
//   youtube_link_en?: string | null; // <-- ADD English link (make optional with ?)
//   youtube_link_hi?: string | null; // <-- ADD Hindi link (make optional with ?)
//   video_file: string | null;
//   video_file_en?: string | null; // English uploaded file
//   video_file_hi?: string | null; // Hindi uploaded file
//   status: 'active' | 'inactive';
//   sort_order: number;
//   // Add other fields if needed
// }

// --- Add VideoSection interface (optional but recommended) ---
interface VideoSection {
  id: number;
  title: string;
  youtube_link: string | null;
  video_file: string | null;
  status: 'active' | 'inactive';
  sort_order: number;
  // Add other fields if needed
}




declare var Razorpay: any;

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent implements OnInit {
  navbarOptions: NavbarItem[] = [];
  brandDetails: any;
  brandLogoUrl: string | null = null;
  baseUrl: string = environment.image_url;
  landingInfo: any;
  headingLine1: string = '';
  headingLine2: string = '';
  subheading: string = '';
  buttonText: string = '';
  icon_1_url: string | null = null;
  icon_2_url: string | null = null;
  icon_3_url: string | null = null;
  icon_4_url: string | null = null;

  // New property for landing page banners
  banners: any[] = [];
  displayableBanners: any[] = [];

  features: any[] = [];
  aboutPageData: any = {};

  clientHeading: string = '';
  clientSubheading: string = '';
  clientLogos: string[] = [];

  processSteps: any[] = [];
  groupedProcessSteps: any[][] = [];

  caseStudyTitle: string = 'Case Studies'; // fallback value

  caseStudyImages: any[] = []; // or ideally use an interface (see below)

  currentIndex = 0; // Index of the currently active banner
  contactHeading: string = '';
  contactSubheading: string = '';
  contactButtonText: string = '';
  contactImageUrl: string | null = null;

  techMainPage: any = null;

  techList: any[] = [];
  groupedTechList: any[] = [];  // Initialize as an empty array

  faqTitle: string = '';
  faqSubheading: string = '';
  faqs: any[] = [];
  faqsData: any[] = [];

  expandedIndex: number | null = null;
  isMobile = false;
  isSliderOpen: boolean = false;


  // Step 1 form values
  name: string = '';
  email: string = '';
  phone: string = '';
  message: string = '';

  // Step 2 date & time
  date: string = '';
  time: string = '';

  // UI State
  showDateTimePopup: boolean = false;
  bookingLoading: boolean = false;
  bookingError: string = '';
  bookingSuccess: string = '';


  selectedMonth: string = '';
  availableMonths: string[] = [];
  selectedDay: number | null = null;
  selectedTime: string = '';
  availableTimes: string[] = [];
  bookedTimes: string[] = [];  // Store booked times
  days: DayOption[] = [];

  showConfirmPaymentPopup = false;
  pendingBookingData: any = null;

  amount: number = 0;


  showFinalStatusPopup: boolean = false;
  bookingSuccessFlag: boolean = false;

  isLoading: boolean = false;
  footerContent: any; // Declare the footerContent property here
  socialIcons: any[] = [];  // Array to store social icons

  selectedImageData: any = null;

  videoDurations: number[] = [];
  videoTimes: number[] = [];
  isPlaying: boolean[] = [];

  showLegalPopup = false;
  legalPopupType: 'privacy' | 'terms' = 'privacy';

  // State variable to control Pricing Popup visibility
  showPricingPopup: boolean = false;

  pricingPlans: any[] = [];      // <--- Changed type to any[]
  pricingLoading: boolean = false;
  pricingError: string | null = null;

  isSignupSubmitting: boolean = false;


  showSignupForm: boolean = false;
  signupData = {
    name: '',
    email: '',
    phone: '',
    project_name: '',
    project_description: ''
  };

  selectedPlan: any = null; // To store the chosen plan (optional)
  showConfirmPricePaymentPopup: boolean = false;
  selectedPlanTitle: string = '';
  packageAmount: number = 0;

  showPurchaseStatusPopup: boolean = false;
  purchaseSuccessFlag: boolean = false; // set true or false based on payment result

  createdPurchaseId: string | null = null;
  createdPurchaseData: any = null;



  // +++ ADD Property for Video Sections +++
  videoSections: VideoSection[] = []; // Store fetched video data

  // --- Language Detection ---
  userLanguage: 'en' | 'hi' = 'en'; // Default to English
  displayVideoUrl: SafeResourceUrl | null = null; // URL to display in iframe

  // --- Facebook Referral ---
  isFacebookReferral: boolean = false;

  displayableVideoSections: VideoSection[] = []; // New property

  showFillFormPopup: boolean = false;


  @ViewChild('daysWrapper') daysWrapper!: ElementRef;
  @ViewChildren('videoRef') videoElements!: QueryList<ElementRef>;
  @ViewChildren('videoRef') videoRefs!: QueryList<ElementRef<HTMLVideoElement>>;



  constructor(private landingService: LandingPageService, private cdr: ChangeDetectorRef, private sanitizer: DomSanitizer, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {

    // --- Language Detection ---
    // this.detectUserLanguage();

    // --- Facebook Referrer Detection ---
    this.detectFacebookReferral();

    this.handlePaymentReturn();
    this.fetchNavBar();
    this.fetchLandingPageInfo();
    this.fetchLandingPageBanners(); // Fetch banners on component initialization
    this.fetchFeaturePage(); // <-- Add this
    // Fetch the About Page Data
    this.fetchAboutPageData();
    this.fetchClientPageContent();
    this.fetchClientLogos();
    this.fetchAllProcessSteps();
    this.fetchCaseStudyTitle();
    this.fetchCaseStudyImages();
    this.fetchContactPage();
    this.fetchTechMainPage();  // Fetch Tech main page data
    this.fetchAllTech(); // Add this
    this.fetchFaqPage(); // add this
    this.fetchQuestionAndAnswer()
    this.fetchFooterContent(); // Call the method when the component initializes
    this.generateUpcomingDays(30); // generate 4 weeks by default
    this.generateMonthOptions();

    this.fetchFooterSocialIcons();

    // +++ ADD Call to fetch videos +++
    this.fetchVideoSections();

    this.isMobile = window.innerWidth <= 600;

    // Optional: Update on resize too
    window.addEventListener('resize', () => {
      // this.isMobile = window.innerWidth <= 600;
      this.isMobile = window.innerWidth <= 768;

    });
    this.isMobile = window.innerWidth <= 480;
  }



  // --- Facebook Referral Detection Method ---
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

  toggleAnswer(index: number): void {
    this.expandedIndex = this.expandedIndex === index ? null : index;
  }

  toggleSlider(): void {
    this.isSliderOpen = !this.isSliderOpen;
  }

  ngAfterViewInit(): void {
    this.videoRefs.forEach(videoEl => {
      const video = videoEl.nativeElement;
      video.muted = false;
      video.autoplay = true;
      video.loop = true;
      video.play().catch(err => console.warn('Autoplay error:', err));
    });

    // Initialize playing state
    this.isPlaying = this.banners.map(() => true);
  }

  togglePlayPause(index: number): void {
    const video = this.videoRefs.toArray()[index].nativeElement;
    if (video.paused) {
      video.play();
      this.isPlaying[index] = true;
    } else {
      video.pause();
      this.isPlaying[index] = false;
    }
  }


  openLegalPopup(type: 'privacy' | 'terms') {
    this.legalPopupType = type;
    this.showLegalPopup = true;
  }

  closeLegalPopup() {
    this.showLegalPopup = false;
  }


  // Method to generate the next 6 months dynamically
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




  selectDay(day: number): void {
    const selected = this.days.find(d => d.day === day);
    if (selected?.available) {
      this.selectedDay = day;
      this.date = selected.fullDate;
      // this.loadAvailableTimesForDate(selected.fullDate); 
      this.loadAvailableTimesForDate(selected.fullDate);  // New method call
    }
  }

  selectTime(time: string): void {
    this.selectedTime = time;
    this.time = time; // Store the selected time in the 'time' variable
    // console.log('Selected time:', this.time); 
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





  loadAvailableTimesForDate(date: string): void {
    this.landingService.getBookedSlots(date).subscribe({
      next: (res) => {
        if (res.status) {
          // Convert booked times from 24-hour to 12-hour format
          this.bookedTimes = res.bookedTimes.map((time: string) =>
            this.convertTo12HourFormat(time)
          );

          this.availableTimes = res.remainingTimes;

          const finalAvailableTimes = this.availableTimes.filter(
            time => !this.bookedTimes.includes(time)
          );

          // Update the selected day's slot text
          this.days = this.days.map(day => {
            if (day.fullDate === date) {
              const slotCount = finalAvailableTimes.length;
              const isAvailable = slotCount > 0;

              return {
                ...day,
                available: isAvailable,
                slotsText: isAvailable ? `${slotCount} slot${slotCount > 1 ? 's' : ''}` : '—',
                slotsClass: isAvailable ? 'green' : 'gray'
              };
            }
            return day;
          });
        } else {
          // console.error('Failed to fetch booked slots');
        }
      },
      error: (err) => {
        // console.error('Error fetching booked slots:', err);
      }
    });
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


  closePopup() {
    // console.log("time popup")
    this.showDateTimePopup = false;
    this.cdr.detectChanges()
  }

  submitBooking() {
    alert("Appointment booked!");
    this.closePopup();
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

  // ADD THIS NEW METHOD TO CLOSE THE POPUP
  closeFillFormPopup(): void {
    this.showFillFormPopup = false;
  }


  openDateTimePopup(): void {
    this.bookingError = '';

    // ================== START: ADD VALIDATION LOGIC HERE ==================
    if (!this.name.trim() || !this.email.trim() || !this.phone.trim()) {
      // If any of the required fields are empty (after trimming whitespace)
      this.showFillFormPopup = true; // Show the new "fill form" popup
      return; // Stop the rest of the function from executing
    }
    // ================== END: ADD VALIDATION LOGIC HERE ==================

    if (!this.name || !this.email || !this.phone) {
      this.bookingError = 'Please fill name and email before booking.';
      this.showErrorSnackbar(this.bookingError);
      return;
    }
    this.showDateTimePopup = true;

    this.landingService.getAvailableSlotsForMonth().subscribe(
      (response) => {
        if (response.status) {
          this.days = response.days.map((day: any) => ({
            weekday: day.weekday,
            day: day.date,
            fullDate: day.fullDate,
            slotsText: `${day.freeSlots} Slots`,
            slotsClass: day.freeSlots > 0 ? 'available' : 'full',
            available: day.freeSlots > 0
          }));
        }
      },
      (error) => {
        // console.error('Error fetching available slots:', error);
      }
    );

  }

  closeDateTimePopup(): void {

    // console.log("CLose SETTIme Call")
    this.showDateTimePopup = false;
    this.date = '';
    this.time = '';
  }

  closeConfirmPopup(): void {
    this.showConfirmPaymentPopup = false;
    this.bookingLoading = false;

  }

  closePriceConfirmPopup(): void {
    this.showConfirmPricePaymentPopup = false;

  }


  // Component code

  // This is previous working code
  // proceedToPayment(): void {
  //   this.showConfirmPaymentPopup = false;

  //   this.landingService.createRazorpayOrder(this.pendingBookingData.amount).subscribe({
  //     next: (res) => {
  //       if (res.status && res.order) {
  //         this.startRazorpayPayment(res.order, this.pendingBookingData);
  //       } else {
  //         this.bookingError = 'Error creating Razorpay order.';
  //         this.showErrorSnackbar(this.bookingError);
  //         this.bookingLoading = false;

  //       }
  //     },
  //     error: (err) => {
  //       // Display error message from backend (or fallback message)
  //       this.bookingError = err || 'Error initiating payment.';
  //       this.showErrorSnackbar(this.bookingError);
  //       this.bookingLoading = false;

  //     }
  //   });
  // }


  /**
   * This is the main function that starts the payment process.
   * It now calls the generic `createOrder` service method and handles the dynamic response.
   */
  // proceedToPayment(): void {
  //   this.showConfirmPaymentPopup = false; // Close the confirmation popup
  //   this.bookingLoading = true;           // Show a loading state on the button

  //   // Call the new generic createOrder method from your service
  //   this.landingService.createOrder(this.pendingBookingData.amount).subscribe({
  //     next: (res) => {
  //       if (res.status) {
  //         // --- THIS IS THE NEW DYNAMIC LOGIC ---
  //         // Check which gateway the backend chose to use
  //         if (res.gateway === 'razorpay') {
  //           // If it's Razorpay, call the existing Razorpay payment handler
  //           this.startRazorpayPayment(res.order, res.key_id, this.pendingBookingData);

  //         } else if (res.gateway === 'phonepe') {
  //           // If it's PhonePe, the backend sent a redirectUrl.
  //           // The only job of the frontend is to redirect the user.
  //           if (res.redirectUrl) {
  //             window.location.href = res.redirectUrl;
  //           } else {
  //             // Handle error if the URL is missing
  //             this.showErrorSnackbar('Could not get payment URL from PhonePe. Please try again.');
  //             this.bookingLoading = false; // Stop the loading spinner
  //           }
  //         } else {
  //           // Handle any other unknown gateways or errors
  //           this.showErrorSnackbar('An unsupported payment gateway was returned.');
  //           this.bookingLoading = false;
  //         }
  //       } else {
  //         // Handle error response from your own backend (e.g., "No active gateway")
  //         this.showErrorSnackbar(res.message || 'Error creating payment order.');
  //         this.bookingLoading = false;
  //       }
  //     },
  //     error: (err) => {
  //       // Handle HTTP errors (e.g., server is down)
  //       this.showErrorSnackbar(err || 'A server error occurred while initiating payment.');
  //       this.bookingLoading = false;
  //     }
  //   });
  // }



  // Implement phone pe 
  /**
   * This is the main function that starts the payment process.
   * It now calls the generic `createOrder` service method and handles the dynamic response.
   */
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


  // --- REVISED FUNCTION TO HANDLE THE USER RETURNING FROM PAYMENT ---
  handlePaymentReturn(): void {
    this.route.queryParamMap.subscribe(params => {
        const transactionId = params.get('transaction_id'); 
        
        if (transactionId) {
            this.isLoading = true; 
            
            const bookingDataString = sessionStorage.getItem('pendingBooking');

            this.router.navigate([], {
                relativeTo: this.route,
                queryParams: { transaction_id: null },
                queryParamsHandling: 'merge',
                replaceUrl: true
            });

            if (!bookingDataString) {
                console.error('Returned from payment but no pending booking data was found.');
                this.isLoading = false;
                this.showErrorSnackbar('Could not retrieve booking details after payment. Please contact support.');
                return;
            }

            sessionStorage.removeItem('pendingBooking');
            const bookingData = JSON.parse(bookingDataString);

            this.landingService.checkPaymentStatus(transactionId).subscribe({
                next: (res) => {
                    this.isLoading = false; 
                    
                    if (res.success && res.code === 'PAYMENT_SUCCESS') {
                        // GOAL MET: Payment was successful.
                        // Your createBooking() probably creates a NEW record with 'paid' status.
                        // This is fine, but for advanced systems, you would UPDATE the
                        // 'interested' record to 'paid' instead of creating a new one.
                        bookingData.paymentId = res.data?.transactionId || transactionId;
                        this.createBooking(bookingData);
                    } else {
                        // GOAL MET: Payment failed or was cancelled by user on the PhonePe page.
                        // We ALREADY created an 'interested' record before the redirect.
                        // So, we DO NOT call interestedBooking() again here, to avoid duplicates.
                        // We just inform the user.
                        this.showErrorSnackbar('Your payment was not completed. Your booking interest has been recorded.');
                    }
                },
                error: (err) => {
                    this.isLoading = false; 
                    // An error occurred. The 'interested' record already exists. Just show an error.
                    console.error("Failed to check payment status:", err);
                    this.showErrorSnackbar('We could not verify your payment status. Please contact support if you were charged.');
                }
            });
        }
    });
}


  // Method to show error using Snackbar (or alert)
  showErrorSnackbar(message: string): void {
    // Replace with your actual snackbar implementation
    alert(message); // Simple alert for demonstration
  }



  /**
   * This function handles opening the Razorpay popup.
   * It's now updated to use the dynamic key_id from the backend.
   */
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

  resetAll(): void {
    this.name = '';
    this.email = '';
    this.phone = '';
    this.message = '';
    this.date = '';
    this.time = '';
  }






  fetchNavBar(): void {
    this.landingService.getNavbarOption().subscribe({
      next: (res) => {
        if (res.status) {
          //  Filter only items where name is not null and is_deleted = 0
          this.navbarOptions = res.navbarOptions.filter(
            (opt: NavbarItem) => opt.name !== null && opt.is_deleted === 0
          ).map((opt: NavbarItem) => ({
            ...opt,
            url: opt.url || `#${opt.name?.toLowerCase().replace(/\s+/g, '')}` // fallback url
          }));

          this.brandDetails = res.brandDetails;
          this.brandLogoUrl = res.brandDetails?.brandLogo
            ? `${this.baseUrl}${res.brandDetails.brandLogo}`
            : null;
        }
      },
      error: (err) => {
        // console.error('Failed to load navbar options', err);
      }
    });
  }


  fetchLandingPageInfo(): void {
    this.landingService.getLandingPageInfo().subscribe({
      next: (res) => {
        if (res.status && res.data?.length > 0) {
          const data = res.data[0];
          this.headingLine1 = this.getHeadingPart(data.heading, 0);
          this.headingLine2 = this.getHeadingPart(data.heading, 1);
          this.subheading = data.subheading;
          this.buttonText = data.button_text;

          // Dynamically setting the URLs for icons/images using the correct API keys
          this.icon_1_url = data?.icon_1
            ? `${this.baseUrl}${data?.icon_1}`
            : null;
          this.icon_2_url = data?.icon_2
            ? `${this.baseUrl}${data?.icon_2}`
            : null;
          this.icon_3_url = data?.icon_3
            ? `${this.baseUrl}${data?.icon_3}`
            : null;
          this.icon_4_url = data?.icon_4
            ? `${this.baseUrl}${data?.icon_4}`
            : null;

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

  // Utility to split heading into two parts
  getHeadingPart(heading: string, part: number): string {
    const words = heading?.split(' ') || [];
    const mid = Math.ceil(words.length / 2);
    return part === 0
      ? words.slice(0, mid).join(' ')
      : words.slice(mid).join(' ');
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

  // Method to sanitize YouTube URL
  sanitizeUrl(url: string): SafeUrl {
    const videoId = this.extractYouTubeVideoId(url);
    const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : '';
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  // Extract YouTube Video ID from the URL
  extractYouTubeVideoId(url: string): string | null {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/[^\/]+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  }


  /**
   * Navigates to the next slide.
   */
  nextSlide(): void {
    if (!this.banners || this.banners.length === 0) return;
    this.pauseCurrentVideo();
    const nextIndex = (this.currentIndex + 1) % this.banners.length; // Wrap around
    this.currentIndex = nextIndex;
    // Use setTimeout to allow Angular's change detection to update the [class.active]
    // before we try to play the new video.
    setTimeout(() => this.playCurrentVideo(), 50); // Small delay
  }

  /**
   * Navigates to the previous slide.
   */
  prevSlide(): void {
    if (!this.banners || this.banners.length === 0) return;
    this.pauseCurrentVideo();
    const prevIndex = (this.currentIndex - 1 + this.banners.length) % this.banners.length; // Wrap around correctly for negative
    this.currentIndex = prevIndex;
    setTimeout(() => this.playCurrentVideo(), 50); // Small delay
  }

  /**
   * Pauses the currently active video.
   */
  pauseCurrentVideo(): void {
    const currentVideoElement = this.getVideoElementByIndex(this.currentIndex);
    if (currentVideoElement && !currentVideoElement.paused) {
      try {
        currentVideoElement.pause();
        currentVideoElement.currentTime = 0; // Optional: Reset video to start
        // console.log(`Paused video at index ${this.currentIndex}`);
      } catch (error) {
        // console.warn("Could not pause video: ", error);
      }
    }
  }

  /**
   * Plays the currently active video.
   */
  playCurrentVideo(): void {
    const currentVideoElement = this.getVideoElementByIndex(this.currentIndex);
    if (currentVideoElement) {
      // Mute before playing programmatically if needed, as browsers often block unmuted autoplay
      currentVideoElement.muted = true; // Or ensure controls allow unmuting
      currentVideoElement.play().then(() => {
        // console.log(`Playing video at index ${this.currentIndex}`);
      }).catch(error => {
        // console.warn(`Autoplay prevented for video index ${this.currentIndex}: `, error);
        // You might want to show a play button overlay here if autoplay fails
      });
    } else {
      // console.log("Video element not found for index:", this.currentIndex);
    }
  }

  /**
   * Helper to get the native video element from the QueryList by index.
   */
  private getVideoElementByIndex(index: number): HTMLVideoElement | null {
    const videoElementRef = this.videoRefs?.toArray()[index];
    return videoElementRef?.nativeElement ?? null;
  }




  // Method to handle navbar link clicks
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

  // Method to open the Pricing Popup
  openPricingPopup(): void {
    this.showPricingPopup = true;
    this.fetchPricingData();
    this.isSliderOpen = false;
  }

  // Method to close the Pricing Popup
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

  fetchFeaturePage(): void {
    this.landingService.getFeaturePage().subscribe({
      next: (res) => {
        if (res.status && res.data?.length > 0) {
          this.features = res.data;
          // console.log('Feature Data:', this.features);
        }
      },
      error: (err) => {
        // console.error('Error fetching feature page data', err);
      }
    });
  }

  fetchAboutPageData(): void {
    this.landingService.getAboutPage().subscribe({
      next: (res) => {
        if (res.status && res.data) {
          this.aboutPageData = res.data;

          // Split the description into four lines for display
          const description = this.aboutPageData.description || '';
          this.aboutPageData.formattedDescription = this.splitDescriptionIntoLines(description);
          // console.log('About Page Data:', this.aboutPageData);
        }
      },
      error: (err) => {
        // console.error('Error fetching About page data', err);
      }
    });
  }

  splitDescriptionIntoLines(description: string): string {
    const words = description.split(' ');
    const lines: string[] = [];
    const wordsPerLine = Math.ceil(words.length / 4); // Divide total words into 4 lines

    for (let i = 0; i < 4; i++) {
      const lineWords = words.slice(i * wordsPerLine, (i + 1) * wordsPerLine);
      if (lineWords.length) {
        lines.push(lineWords.join(' '));
      }
    }

    return lines.join('<br>');
  }

  fetchClientPageContent(): void {
    this.landingService.getClientPageContent().subscribe({
      next: (res) => {
        if (res.status && res.data) {
          this.clientHeading = res.data.heading;
          this.clientSubheading = res.data.subheading;
          // console.log('Client Page Data:', res.data);
        }
      },
      error: (err) => {
        // console.error('Error fetching client page content', err);
      }
    });
  }

  fetchClientLogos(): void {
    this.landingService.getClientLogos().subscribe({
      next: (res) => {
        if (res.status && res.data?.length > 0) {
          this.clientLogos = res.data.map((logo: any) => `${this.baseUrl}${logo.logo_url}`);
          // console.log('Client logos:', this.clientLogos);
        }
      },
      error: (err) => {
        // console.error('Error fetching client logos:', err);
      }
    });
  }


  // +++ ADD Placeholder for Popup Logic +++
  openVideoPopup(videoId: number): void {
    // console.log('Open popup requested for video ID:', videoId);
    const selectedVideo = this.videoSections.find(v => v.id === videoId);
    if (selectedVideo) {
      // console.log('Selected Video Data:', selectedVideo);
      // TODO: Implement your popup logic here.
      // You'll likely need to:
      // 1. Have a popup component or modal service.
      // 2. Pass the `selectedVideo.youtube_link` or `selectedVideo.video_file` (prefixed with `baseUrl`) to the popup.
      // 3. Use DomSanitizer to trust the URL if embedding in an iframe.
      // Example:
      // let videoSourceUrl: string | null = null;
      // if (selectedVideo.youtube_link) {
      //    const videoId = this.extractYoutubeVideoId(selectedVideo.youtube_link);
      //    videoSourceUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : null;
      // } else if (selectedVideo.video_file) {
      //    videoSourceUrl = this.baseUrl + selectedVideo.video_file;
      // }
      // if (videoSourceUrl) {
      //    const safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(videoSourceUrl);
      //    // Now open your popup/modal and pass 'safeUrl' or 'videoSourceUrl'
      //    // this.openModal(safeUrl);
      // } else {
      //    console.error("No valid video source found for popup");
      // }
    } else {
      // console.error('Video not found for ID:', videoId);
    }
  }


  fetchAllProcessSteps(): void {
    this.landingService.getAllProcessSteps().subscribe({
      next: (res) => {
        if (res.status && res.data?.length > 0) {
          this.processSteps = res.data;

          this.groupedProcessSteps = this.chunkArray(this.processSteps, 2);
          // console.log('Grouped Process Steps:', this.groupedProcessSteps);
        }
      },
      error: (err) => {
        // console.error('Error fetching process steps', err);
      }
    });
  }

  // Helper to group steps into rows of 2
  chunkArray(arr: any[], chunkSize: number): any[][] {
    const result = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
      result.push(arr.slice(i, i + chunkSize));
    }
    return result;
  }

  // Return step number from index
  stepNumber(step: any): number {
    return this.processSteps.findIndex(s => s.id === step.id) + 1;
  }

  fetchCaseStudyTitle(): void {
    this.landingService.getCaseStudies().subscribe({
      next: (res) => {
        if (res.status && res.data?.length > 0) {
          this.caseStudyTitle = res.data[0].title || 'Case Studies';
          // console.log('Case Study Title:', this.caseStudyTitle);
        }
      },
      error: (err) => {
        // console.error('Error fetching case study title', err);
      }
    });
  }


  fetchCaseStudyImages(): void {
    this.landingService.getCaseStudyImages().subscribe({
      next: (res) => {
        if (res.status && res.data?.length > 0) {
          // this.caseStudyImages = res.data.map((img: any) => `${this.baseUrl}${img.image_url}`);
          this.caseStudyImages = res.data;
          // console.log('Case Study Images:', this.caseStudyImages);
        }
      },
      error: (err) => {
        // console.error('Error fetching case study images:', err);
      }
    });
  }

  fetchContactPage(): void {
    this.landingService.getContactPage().subscribe({
      next: (res) => {
        if (res.status && res.data) {
          this.contactHeading = res.data.heading;
          this.contactSubheading = res.data.subheading;
          this.contactButtonText = res.data.button_text;
          this.contactImageUrl = res.data.image_url
            ? `${this.baseUrl}${res.data.image_url}`
            : null;

          // console.log('Contact Page:', res.data);
        }
      },
      error: (err) => {
        // console.error('Error fetching contact page data', err);
      }
    });
  }

  fetchTechMainPage(): void {
    this.landingService.getTechMainPage().subscribe({
      next: (res) => {
        if (res.status && res.data) {
          this.techMainPage = res.data;  // Store the fetched data
          // console.log('Tech Main Page Data:', this.techMainPage);
        }
      },
      error: (err) => {
        // console.error('Error fetching Tech Main Page data', err);
      }
    });
  }


  fetchAllTech(): void {
    this.landingService.getAllTech().subscribe({
      next: (res) => {
        if (res.status && res.data) {
          const rawData = Array.isArray(res.data) ? res.data : [res.data]; // handle single or array
          this.techList = rawData.filter((tech: any) => tech.is_deleted === 0);
          this.groupedTechList = this.chunkArray(this.techList, 2); // Group in twos
          // console.log('Grouped Tech List:', this.groupedTechList);
        }
      },
      error: (err) => {
        // console.error('Error fetching tech list', err);
      }
    });
  }


  fetchFaqPage(): void {
    this.landingService.getFaqPage().subscribe({
      next: (res) => {
        if (res.status) {
          this.faqTitle = res.data.title;
          this.faqSubheading = res.data.subheading;
          this.faqs = res.data.questions || []; // assuming 'questions' is an array of { question, answer }
          // console.log('FAQ Page Data:', res.data);
        }
      },
      error: (err) => {
        // console.error('Error fetching FAQ page data', err);
      }
    });
  }

  fetchQuestionAndAnswer(): void {
    this.landingService.getFaqQnsAns().subscribe((res) => {
      if (res.status && res.data) {
        this.faqsData = res.data;
      }
    });
  }

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

  // Function to fetch footer social icons
  fetchFooterSocialIcons(): void {
    this.landingService.getFooterSocailIcon().subscribe((response: any) => {
      if (response.status) {
        this.socialIcons = response.data;  // Store the social icons in the array
      }
    }, error => {
      // console.error("Error fetching social icons:", error);
    });
  }

  openBlogPopup(id: number): void {
    this.landingService.getCaseStudyImageById(id).subscribe({
      next: (res) => {
        if (res.status) {
          this.selectedImageData = res.data;
        }
      },
      error: (err) => {
        // console.error("Error fetching case study image by ID:", err);
      }
    });
  }

  closeBlogPopup(): void {
    this.selectedImageData = null;
  }


  // fetchPricingData(): void {
  //   this.pricingLoading = true;
  //   this.pricingError = null;
  //   this.landingService.getPricingPopupContent().subscribe({
  //     next: (response: any) => { // Explicitly receive 'any'
  //       // **Basic Validation is important when using 'any'**
  //       if (response && response.status === true && Array.isArray(response.data)) {
  //         this.pricingPlans = response.data; // Assign the data array
  //         // console.log('Pricing Plans (any):', this.pricingPlans); // Debugging
  //       } else {
  //         // Handle cases where the response structure is not as expected
  //         // console.error('Invalid API response structure for pricing:', response);
  //         this.pricingError = 'Could not load pricing information due to invalid format.';
  //         this.pricingPlans = []; // Reset to empty array
  //       }
  //       this.pricingLoading = false;
  //       this.cdr.detectChanges(); // Trigger change detection if needed
  //     },
  //     error: (err) => {
  //       // console.error('Error fetching pricing data:', err);
  //       this.pricingError = 'Failed to load pricing. Please try again later.';
  //       this.pricingLoading = false;
  //       this.pricingPlans = []; // Reset to empty array
  //       this.cdr.detectChanges(); // Trigger change detection if needed
  //     }
  //   });
  // }


  // fetchPricingData(): void {
  //   this.pricingLoading = true;
  //   this.pricingError = null;
  //   this.landingService.getPricingPopupContent().subscribe({
  //     next: (response: any) => {
  //       console.log('Raw API pricing response:', JSON.stringify(response, null, 2));
  //       if (response && response.status === true && Array.isArray(response.data)) {
  //         // Assign raw data first
  //         this.pricingPlans = response.data;
  //         console.log('Pricing Plans before discount logic:', JSON.stringify(this.pricingPlans, null, 2));

  //         // Now, apply the discount logic. This function will iterate through pricingPlans
  //         // and set 'price', 'original_price', and 'is_discounted' for each plan.
  //         this.applyFacebookDiscount();

  //       } else {
  //         this.pricingError = 'Could not load pricing information due to invalid format.';
  //         this.pricingPlans = [];
  //       }
  //       this.pricingLoading = false;
  //       this.cdr.detectChanges();
  //     },
  //     error: (err) => {
  //       console.error('Error fetching pricing data:', err);
  //       this.pricingError = 'Failed to load pricing. Please try again later.';
  //       this.pricingLoading = false;
  //       this.pricingPlans = [];
  //       this.cdr.detectChanges();
  //     }
  //   });
  // }



  // --- *** REVISED fetchPricingData *** ---
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






  /** Helper to parse "Month YYYY" string */
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

  /** Loads days and slots for the currently selected month */
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


  // selectPlanAndOpenSignup(plan: any): void {
  //   this.selectedPlan = plan; // Store the selected plan details
  //   // console.log('Selected Plan:', this.selectedPlan);

  //   this.packageAmount = plan.price; // Store amount for confirmation popup
  //   this.selectedPlanTitle = plan.title; // Store plan title
  //   this.showSignupForm = true; // Show the signup form
  //   this.showSignupForm = true; // Show the signup form

  //   // Optional: Decide if you want to close the pricing popup when signup opens
  //   // this.showPricingPopup = false;
  // }


  // Ensure the correct price is used when selecting a plan
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

  // submitSignupForm(): void {
  //   if (!this.selectedPlan) {
  //     console.error('No plan selected');
  //     return;
  //   }

  //   this.showConfirmPricePaymentPopup = true

  //   const requestBody = {
  //     name: this.signupData.name,
  //     email: this.signupData.email,
  //     phone: this.signupData.phone,
  //     pricing_popup_id: this.selectedPlan.id,
  //     price: this.selectedPlan.price,
  //     project_name: this.signupData.project_name,
  //     project_description: this.signupData.project_description
  //   };

  //   this.landingService.createUserPurchase(requestBody).subscribe({
  //     next: (response) => {
  //       console.log('Purchase created successfully:', response);
  //       // this.closeSignupForm();
  //       // Optionally show a toast/snackbar message
  //     },
  //     error: (error) => {
  //       console.error('Failed to create purchase:', error);
  //       // Optionally show error to the user
  //     }
  //   });
  // }



  // onSignupFormSubmit(): void {
  //   if (!this.selectedPlan) {
  //     // console.error('No plan selected');
  //     return;
  //   }

  //   if (!this.signupData.name || !this.signupData.email || !this.signupData.phone || !this.signupData.project_name || !this.signupData.project_description) {
  //     alert("Please fill all required fields.");
  //     return;
  //   }

  //   this.packageAmount = this.selectedPlan.price;
  //   this.selectedPlanTitle = this.selectedPlan.title;
  //   this.showConfirmPricePaymentPopup = true;

  //   const purchaseData = {
  //     name: this.signupData.name,
  //     email: this.signupData.email,
  //     phone: this.signupData.phone,
  //     pricing_popup_id: this.selectedPlan.id,
  //     price: this.selectedPlan.price,
  //     project_name: this.signupData.project_name,
  //     project_description: this.signupData.project_description
  //   };

  //   // Create User Purchase (mark as interested, pending payment)
  //   this.landingService.createUserPurchase(purchaseData).subscribe({
  //     next: (response) => {
  //       // console.log('User created:', response);
  //       this.createdPurchaseId = response.data.id;
  //       this.createdPurchaseData = purchaseData;

  //       // 2. Then show popup
  //       this.packageAmount = this.selectedPlan.price;
  //       this.selectedPlanTitle = this.selectedPlan.title;
  //       // this.showConfirmPricePaymentPopup = true;
  //       setTimeout(() => {
  //         this.showConfirmPricePaymentPopup = true;
  //       }, 2000); // 2000 milliseconds = 3 seconds

  //     },

  //   });
  // }

  // Ensure the correct price is passed when submitting the signup form
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


  // proceedToSignupPurchasePayment(): void {

  //   if (!this.createdPurchaseId || !this.createdPurchaseData) {
  //     this.showErrorSnackbar('No purchase data found. Please submit the form again.');
  //     return;
  //   }

  //   // 2. Create Razorpay Order
  //   this.landingService.createRazorpayOrder(this.createdPurchaseData.price).subscribe({
  //     next: (res) => {
  //       if (res.status && res.order) {
  //         this.startRazorpaySignupPayment(res.order, this.createdPurchaseId, this.createdPurchaseData);
  //       } else {
  //         this.showErrorSnackbar('Failed to create Razorpay order.');
  //       }
  //     },
  //     error: () => {
  //       this.showErrorSnackbar('Error creating Razorpay order.');
  //     }
  //   });
  // }


  // Ensure correct price is used when creating the Razorpay order
  proceedToSignupPurchasePayment(): void {
    this.closePriceConfirmPopup(); // Close confirmation popup first

    if (!this.createdPurchaseId || !this.createdPurchaseData) {
      this.showErrorSnackbar('No purchase data found. Please submit the form again.');
      return;
    }

    // Use the price stored in createdPurchaseData (which has the correct final price)
    const paymentAmount = this.createdPurchaseData.price;


    this.landingService.createRazorpayOrder(paymentAmount).subscribe({ // <-- Use correct price
      next: (res) => {
        if (res.status && res.order) {
          this.startRazorpaySignupPayment(res.order, this.createdPurchaseId, this.createdPurchaseData);
        } else {
          this.showErrorSnackbar(`Failed to create Razorpay order. ${res.message || ''}`);
        }
      },
      error: (err) => {
        const errorMsg = err?.error?.message || 'Error creating Razorpay order.';
        this.showErrorSnackbar(errorMsg);
      }
    });
  }



  startRazorpaySignupPayment(order: any, purchaseId: any, data: any): void {
    const options = {
      key: 'rzp_live_0cClDW4rSilf2w', // Use your live Razorpay key
      amount: order.amount,
      currency: order.currency,
      name: 'Sunra Softech Pvt Ltd',
      description: 'Plan Purchase',
      order_id: order.id,
      handler: (response: any) => {
        this.verifySignupPurchasePayment(response, purchaseId, data);
      },
      prefill: {
        name: data.name,
        email: data.email,
        contact: data.phone
      },
      notes: {
        planId: data.pricing_popup_id
      },
      theme: { color: '#3399cc' }
    };

    const rzp = new Razorpay(options);
    rzp.open();
  }

  verifySignupPurchasePayment(response: any, purchaseId: any, data: any): void {
    const payload = {
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature
    };

    this.landingService.verifyRazorpayPayment(payload).subscribe({
      next: (res) => {
        if (res.status) {
          // Add payment details to the purchase and update status to "paid"
          data.payment_id = response.razorpay_payment_id;
          this.updateUserPurchaseStatus(purchaseId, { payment_status: 'paid', payment_id: data.payment_id });
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
      }
    });
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


  // Method to fetch videos from your service
  fetchVideoSections(): void {
    this.landingService.getAllVideoSections().subscribe({
      next: (res) => {
        if (res.status && Array.isArray(res.data)) {
          this.videoSections = res.data;
        } else {
          this.videoSections = [];
        }
      },
      error: (err) => {
        console.error('Error fetching video sections:', err);
        this.videoSections = [];
      }
    });
  }

  // Helper to securely create YouTube embed URLs for iframes
  sanitizeYoutubeUrl(url: string | null): SafeResourceUrl | null {
    if (!url) return null;
    const videoId = this.extractYoutubeVideoId(url);
    if (!videoId) return null; // Invalid YouTube URL
    const embedUrl = `https://www.youtube.com/embed/${videoId}`;
    // Tell Angular this URL is safe to use in an iframe
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  // Helper to get the ID from various YouTube URL formats
  extractYoutubeVideoId(url: string): string | null {
    if (!url) return null;
    // Regex simplified - look for standard patterns
    const patterns = [
      /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
      /youtu\.be\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null; // No ID found
  }


}
