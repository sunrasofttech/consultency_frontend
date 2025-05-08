

import { LandingPageService } from '../services/landing-page.service';
import { environment } from 'src/environments/environment';
import { Component, OnInit, ViewChild, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, ParamMap } from '@angular/router'; // <-- Import 



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
interface VideoSection {
  id: number;
  title: string;
  youtube_link: string | null;
  youtube_link_en?: string | null; // <-- ADD English link (make optional with ?)
  youtube_link_hi?: string | null; // <-- ADD Hindi link (make optional with ?)
  video_file: string | null;
  video_file_en?: string | null; // English uploaded file
  video_file_hi?: string | null; // Hindi uploaded file
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
 




  @ViewChild('daysWrapper') daysWrapper!: ElementRef;
  @ViewChildren('videoRef') videoElements!: QueryList<ElementRef>;
  @ViewChildren('videoRef') videoRefs!: QueryList<ElementRef<HTMLVideoElement>>;




  constructor(private landingService: LandingPageService, private cdr: ChangeDetectorRef, private sanitizer: DomSanitizer, private route: ActivatedRoute) { }

  ngOnInit(): void {

    // --- Language Detection ---
    this.detectUserLanguage();

    // --- Facebook Referrer Detection ---
    this.detectFacebookReferral();


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
      this.isMobile = window.innerWidth <= 600;
    });
    this.isMobile = window.innerWidth <= 480;
  }


  // Modify detectUserLanguage to also update displayable videos
  // detectUserLanguage(): void {
  //   const browserLang = navigator.language || (navigator as any).userLanguage;
  //   if (browserLang && browserLang.toLowerCase().startsWith('hi')) {
  //     this.userLanguage = 'hi';
  //   } else {
  //     this.userLanguage = 'en';
  //   }
  //   console.log('Detected language:', this.userLanguage);
  //   this.updateDisplayableVideos(); // Update when language changes
  // }

  // // New method to filter videos based on language and availability
  // updateDisplayableVideos(): void {
  //   if (!this.videoSections || this.videoSections.length === 0) {
  //     this.displayableVideoSections = [];
  //     return;
  //   }
  //   this.displayableVideoSections = this.videoSections.filter(video => {
  //     if (this.userLanguage === 'hi' && video.youtube_link_hi && video.youtube_link_hi.trim() !== "") {
  //       return true;
  //     } else if (this.userLanguage === 'en' && video.youtube_link_en && video.youtube_link_en.trim() !== "") {
  //       return true;
  //     } else if (video.video_file) { // If it has a self-hosted file, it's displayable
  //       return true;
  //     }
  //     // Optional: Add fallback to generic youtube_link if desired
  //     // else if (video.youtube_link && video.youtube_link.trim() !== "") {
  //     //   return true;
  //     // }
  //     return false; // Otherwise, don't include it for display
  //   });
  //   console.log('Displayable videos for current language:', this.displayableVideoSections);
  // }



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

  // // --- Method to apply discount based on Facebook referral and language ---
  // applyFacebookDiscount(): void {
  //   console.log('Attempting to apply Facebook discount. isFacebookReferral:', this.isFacebookReferral, 'userLanguage:', this.userLanguage);

  //   this.pricingPlans = this.pricingPlans.map((plan: any) => { // Ensure 'plan' has a type, 'any' or a specific interface
  //     // Make sure all price fields from API are numbers
  //     const standardPrice = parseFloat(plan.price);
  //     const fbPriceEn = plan.facebook_price_en !== null && plan.facebook_price_en !== undefined ? parseFloat(plan.facebook_price_en) : null;
  //     const fbPriceHi = plan.facebook_price_hi !== null && plan.facebook_price_hi !== undefined ? parseFloat(plan.facebook_price_hi) : null;

  //     let finalPrice = standardPrice; // Default to standard price
  //     let isActuallyDiscounted = false;
  //     const originalDisplayPrice = standardPrice; // This is the price before any FB logic

  //     if (this.isFacebookReferral) {
  //       console.log(`Plan ${plan.id}: Is Facebook referral. Checking prices...`);
  //       console.log(`   Standard Price: ${standardPrice}`);
  //       console.log(`   FB Price EN: ${fbPriceEn}`);
  //       console.log(`   FB Price HI: ${fbPriceHi}`);

  //       // --- STEP 1: Prioritize facebook_price_hi if from Facebook (as per your latest request) ---
  //       if (fbPriceHi !== null && !isNaN(fbPriceHi)) {
  //         finalPrice = fbPriceHi;
  //         isActuallyDiscounted = finalPrice < standardPrice;
  //         console.log(`   Using facebook_price_hi: ${finalPrice}. Discounted: ${isActuallyDiscounted}`);
  //       }
  //       // --- STEP 2: (LATER) Add language condition here: ---
  //       // else if (this.userLanguage === 'en' && fbPriceEn !== null && !isNaN(fbPriceEn)) {
  //       //   finalPrice = fbPriceEn;
  //       //   isActuallyDiscounted = finalPrice < standardPrice;
  //       //   console.log(`   User lang EN, using facebook_price_en: ${finalPrice}. Discounted: ${isActuallyDiscounted}`);
  //       // }
  //       else {
  //           // If not Hindi FB price, and (later) not English FB price,
  //           // or if FB prices are not valid numbers, it means no specific FB discount applies for this plan/language.
  //           // The finalPrice remains the standardPrice.
  //           // We still mark original_price for consistency if it was a FB referral.
  //           console.log(`   No applicable Facebook price for this language/plan. Using standard price: ${finalPrice}`);
  //       }
  //     } else {
  //       console.log(`Plan ${plan.id}: Not a Facebook referral. Using standard price.`);
  //       // finalPrice is already standardPrice, isActuallyDiscounted is false
  //     }

  //     return {
  //       ...plan, // Spread the original plan
  //       price: finalPrice,                 // The price to be displayed and used for payment
  //       original_price: originalDisplayPrice, // The standard price before any FB-specific logic
  //       is_discounted: isActuallyDiscounted  // True if finalPrice is lower than originalDisplayPrice
  //     };
  //   });

  //   console.log('Pricing Plans AFTER applyFacebookDiscount:', JSON.stringify(this.pricingPlans, null, 2));
  //   this.cdr.detectChanges(); // Notify Angular of the changes
  // }



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

  // loadAvailableTimesForDate(date: string): void {
  //   // Simulate available time slots per date
  //   this.availableTimes = ['10:30 AM', '11:30 AM', '1:00 PM', '2:30 PM', '4:00 PM']
  //     .filter(() => Math.random() > 0.3); // randomly reduce slots
  // }



  // loadAvailableTimesForDate(date: string): void {
  //   // Call the service to get booked slots for the selected date
  //   this.landingService.getBookedSlots(date).subscribe({
  //     next: (res) => {
  //       if (res.status) {
  //         this.bookedTimes = res.bookedTimes;
  //         this.availableTimes = res.remainingTimes;
  //         // // Remove booked times from the available times
  //         // this.availableTimes = this.availableTimes.filter(time => !this.bookedTimes.includes(this.convertTo24HourFormat(time)));
  //          // Filter available times
  //       const finalAvailableTimes = this.availableTimes.filter(time =>
  //         !this.bookedTimes.includes(this.convertTo24HourFormat(time))
  //       );

  //       // Update the selected day's slot text
  //       this.days = this.days.map(day => {
  //         if (day.day.toString() === date) {
  //           const slotCount = finalAvailableTimes.length;
  //           const isAvailable = slotCount > 0;

  //           return {
  //             ...day,
  //             available: isAvailable,
  //             slotsText: isAvailable ? `${slotCount} slot${slotCount > 1 ? 's' : ''}` : '—',
  //             slotsClass: isAvailable ? 'green' : 'gray'
  //           };
  //         }
  //         return day;
  //       });

  //       } else {
  //         console.error('Failed to fetch booked slots');
  //       }
  //     },
  //     error: (err) => {
  //       console.error('Error fetching booked slots:', err);
  //     }
  //   });
  // }

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


  // selectDay(day: number): void {
  //   const selected = this.days.find(d => d.day === day);
  //   if (selected?.available) {
  //     this.selectedDay = day;
  //   }
  // }

  // selectTime(time: string): void {
  //   this.selectedTime = time;
  // }

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


  openDateTimePopup(): void {
    this.bookingError = '';
    if (!this.name || !this.email || !this.phone) {
      this.bookingError = 'Please fill name and email before booking.';
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

  proceedToPayment(): void {
    this.showConfirmPaymentPopup = false;

    this.landingService.createRazorpayOrder(this.pendingBookingData.amount).subscribe({
      next: (res) => {
        if (res.status && res.order) {
          this.startRazorpayPayment(res.order, this.pendingBookingData);
        } else {
          this.bookingError = 'Error creating Razorpay order.';
          this.showErrorSnackbar(this.bookingError);
          this.bookingLoading = false;

        }
      },
      error: (err) => {
        // Display error message from backend (or fallback message)
        this.bookingError = err || 'Error initiating payment.';
        this.showErrorSnackbar(this.bookingError);
        this.bookingLoading = false;

      }
    });
  }

  // Method to show error using Snackbar (or alert)
  showErrorSnackbar(message: string): void {
    // Replace with your actual snackbar implementation
    alert(message); // Simple alert for demonstration
  }


  startRazorpayPayment(order: any, bookingData: any): void {
    const options: any = {
      key: 'rzp_live_0cClDW4rSilf2w', // This is fine to keep on the frontend
      amount: order.amount,
      currency: order.currency,
      name: 'Sunra Softech Pvt Ltd',
      description: 'Booking Payment',
      order_id: order.id,
      handler: (response: any) => {
        // On payment success
        // console.log('Payment Success:', response);

        // Send payment details to backend for verification
        this.verifyPayment(response, bookingData);
      },
      prefill: {
        name: bookingData.name,
        email: bookingData.email,
        contact: bookingData.phone
      },
      notes: {
        bookingTime: `${bookingData.date} ${bookingData.time}`
      },
      theme: {
        color: '#3399cc'
      },
      modal: {
        ondismiss: () => {
          // User closed the payment popup without paying
          // console.log('Payment popup closed by user');
          this.interestedBooking(bookingData); // Call the interested API
          this.bookingLoading = false; // Reset loading spinner
        }
      }
    };

    const rzp = new Razorpay(options);
    rzp.open();

    rzp.on('payment.failed', (response: any) => {
      // console.error('Payment Failed:', response.error);
      this.bookingError = 'Payment failed. Please try again.';
      this.interestedBooking(bookingData); // Log as interested
    });

    // Set a fallback timeout in case the user closes the Razorpay window with confirmation
    setTimeout(() => {
      if (this.bookingLoading) {
        // console.log('Razorpay screen was likely closed or payment not completed');
        this.bookingLoading = false; // Reset loading state after a delay
      }
    }, 5000); // Wait 5 seconds before resetting the loading state
  }

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



  // createBooking(bookingData: any): void {
  //   this.bookingLoading = true;
  //   // this.showDateTimePopup = false;
  //   this.isLoaderOpen();

  //   this.landingService.createBooking(bookingData).subscribe({
  //     next: (res) => {
  //       this.isLoaderClose() // Stop loader
  //       this.bookingLoading = false;
  //       if (res.status) {
  //         this.bookingSuccess = 'Booking successful!';

  //         this.closePopup();
  //         // this.openFinalPopup()
  //         setTimeout(() => this.openFinalPopup(), 200);

  //         this.resetAll();
  //         // setTimeout(() => this.closeDateTimePopup(), 100);
  //       } else {
  //         this.bookingSuccessFlag = false;
  //         this.showFinalStatusPopup = true; // Show popup on error
  //         this.bookingError = 'Booking failed. Try again.';
  //       }
  //     },
  //     error: (err) => {
  //       this.bookingLoading = false;
  //       this.bookingError = 'Something went wrong.';
  //       console.error(err);
  //     }
  //   });
  // }


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


    this.landingService.getSubscriptionAmount().subscribe({
      next: (res) => {
        // console.log("Subscription Amount:", res);
        this.amount = res.data[0].amount;
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

  // New method to fetch and set banners
  fetchLandingPageBanners(): void {
    this.landingService.getLandingPageBanners().subscribe({
      next: (res) => {
        if (res.status && res.data?.length > 0) {
          this.banners = res.data; // Store the banners data
          // console.log('Landing page banners:', this.banners);
        }
      },
      error: (err) => {
        // console.error('Error fetching landing page banners', err);
      }
    });
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


  // Method to fetch videos from your service
  // fetchVideoSections(): void {
  //   this.landingService.getAllVideoSections().subscribe({
  //     next: (res) => {
  //       if (res.status && Array.isArray(res.data)) {
  //         this.videoSections = res.data;
  //       } else {
  //         this.videoSections = [];
  //       }
  //     },
  //     error: (err) => {
  //       console.error('Error fetching video sections:', err);
  //       this.videoSections = [];
  //     }
  //   });
  // }

  // Modified fetchVideoSections to handle language AND optional links
  // fetchVideoSections(): void {
  //   this.landingService.getAllVideoSections().subscribe({
  //     next: (res) => {
  //       if (res.status && Array.isArray(res.data) && res.data.length > 0) {
  //         const firstVideoData = res.data[0] as VideoSection; // Use the updated interface

  //         let targetUrl: string | null = null;

  //         // Prioritize language-specific link if available
  //         if (this.userLanguage === 'hi' && firstVideoData.youtube_link_hi) {
  //           targetUrl = firstVideoData.youtube_link_hi;
  //           console.log('Using Hindi YouTube link:', targetUrl);
  //         } else if (firstVideoData.youtube_link_en) { // Check for English link next
  //           targetUrl = firstVideoData.youtube_link_en;
  //           console.log('Using English YouTube link:', targetUrl);
  //         } else {
  //           // Fallback to the original 'youtube_link' if no language-specific ones found
  //           targetUrl = firstVideoData.youtube_link;
  //           console.log('Using default/fallback YouTube link:', targetUrl);
  //         }

  //         this.displayVideoUrl = this.sanitizeYoutubeUrl(targetUrl);

  //       } else {
  //         this.videoSections = [];
  //         this.displayVideoUrl = null;
  //         console.log('No suitable video data found or API error.');
  //       }
  //       this.cdr.detectChanges();
  //     },
  //     error: (err) => {
  //       console.error('Error fetching video sections:', err);
  //       this.videoSections = [];
  //       this.displayVideoUrl = null;
  //     }
  //   });
  // }




  // fetchVideoSections(): void {
  //   this.landingService.getAllVideoSections().subscribe({
  //     next: (res) => {
  //       if (res.status && Array.isArray(res.data)) {
  //         this.videoSections = res.data.filter((video: VideoSection) => video.status === 'active');
  //         this.updateDisplayableVideos(); // Call new method to filter
  //       } else {
  //         this.videoSections = [];
  //         this.displayableVideoSections = [];
  //       }
  //       this.cdr.detectChanges();
  //     },
  //     error: (err) => { /* ... */ }
  //   });
  // }


  // getVideoUrlForLanguage remains mostly the same, but it assumes the video passed to it IS displayable
  getVideoUrlForLanguage(video: VideoSection): SafeResourceUrl | null {
    let targetUrl: string | null = null;
    if (!video) return null;

    if (this.userLanguage === 'hi' && video.youtube_link_hi && video.youtube_link_hi.trim() !== "") {
      targetUrl = video.youtube_link_hi;
    } else if (this.userLanguage === 'en' && video.youtube_link_en && video.youtube_link_en.trim() !== "") {
      targetUrl = video.youtube_link_en;
    } else if (video.youtube_link && video.youtube_link.trim() !== "") { // Fallback if added in updateDisplayableVideos
       targetUrl = video.youtube_link;
    }
    // No need to check video.video_file here as this function is for YouTube URLs

    if (targetUrl) {
      return this.sanitizeYoutubeUrl(targetUrl);
    }
    return null;
  }



  getDisplayableVideos(): VideoSection[] {
    if (!this.videoSections || this.videoSections.length === 0) {
      return [];
    }
    return this.videoSections.filter(video => {
      // Check if there's a YouTube URL for the current language
      if (this.userLanguage === 'hi' && video.youtube_link_hi && video.youtube_link_hi.trim() !== "") return true;
      if (this.userLanguage === 'en' && video.youtube_link_en && video.youtube_link_en.trim() !== "") return true;
      // Or if there's an uploaded video file (assuming uploaded files are language-agnostic or you handle that differently)
      if (video.video_file) return true;
      // Or if you want to use the fallback youtube_link when specific lang version is missing
      // if (video.youtube_link && video.youtube_link.trim() !== "") return true; 
      return false;
    });
  }



  // Keep sanitizeYoutubeUrl and extractYoutubeVideoId as they are
  sanitizeYoutubeUrl(url: string | null): SafeResourceUrl | null {
    if (!url) return null;
    const videoId = this.extractYoutubeVideoId(url);
    if (!videoId) {
      // console.warn('Could not extract YouTube video ID from:', url);
      return null; // Invalid YouTube URL
    }
    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}`; // Added autoplay, mute, loop
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  extractYoutubeVideoId(url: string): string | null {
    // ...(keep existing implementation)...
    if (!url) return null;
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
    // console.warn('Could not match YouTube ID pattern for:', url);
    return null; // No ID found
  }





  // Helper to securely create YouTube embed URLs for iframes
  // sanitizeYoutubeUrl(url: string | null): SafeResourceUrl | null {
  //   if (!url) return null;
  //   const videoId = this.extractYoutubeVideoId(url);
  //   if (!videoId) return null; // Invalid YouTube URL
  //   const embedUrl = `https://www.youtube.com/embed/${videoId}`;
  //   // Tell Angular this URL is safe to use in an iframe
  //   return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  // }

  // Helper to get the ID from various YouTube URL formats
  // extractYoutubeVideoId(url: string): string | null {
  //   if (!url) return null;
  //   // Regex simplified - look for standard patterns
  //   const patterns = [
  //     /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
  //     /youtu\.be\/([a-zA-Z0-9_-]{11})/,
  //     /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  //     /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/
  //   ];
  //   for (const pattern of patterns) {
  //     const match = url.match(pattern);
  //     if (match && match[1]) {
  //       return match[1];
  //     }
  //   }
  //   return null; // No ID found
  // }



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


  // fetchAllProcessSteps(): void {
  //   this.landingService.getAllProcessSteps().subscribe({
  //     next: (res) => {
  //       if (res.status && res.data?.length > 0) {
  //         this.processSteps = res.data;
  //         console.log('Process Steps:', this.processSteps);
  //       }
  //     },
  //     error: (err) => {
  //       console.error('Error fetching process steps', err);
  //     }
  //   });
  // }


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
      alert("Please fill all required fields.");
      return;
    }

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
    this.showConfirmPricePaymentPopup = true;

    // IMPORTANT: Create user purchase entry *before* initiating payment flow
    // This marks interest even if payment fails/is abandoned.
    this.landingService.createUserPurchase(purchaseData).subscribe({
      next: (response) => {
        // console.log('User Purchase record created/updated:', response);
        if (response && response.data && response.data.id) {
          this.createdPurchaseId = response.data.id; // Store the ID from the response
          // Now the confirmation popup is already visible, user can proceed to pay
        } else {
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









   // --- REVISED fetchVideoSections ---
   fetchVideoSections(): void {
    this.landingService.getAllVideoSections().subscribe({
      next: (res) => {
        
        if (res.status && Array.isArray(res.data)) {
          // Store all active video data from the API
          this.videoSections = res.data.filter((video: VideoSection) => video.status === 'active');
         
          // Filter the videos *after* fetching and *after* detecting language
          this.updateDisplayableVideos();
        } else {
          this.videoSections = [];
          this.displayableVideoSections = []; // Ensure displayable is also cleared
        
        }
        this.cdr.detectChanges(); // May not be needed here if updateDisplayableVideos calls it
      },
      error: (err) => {
       
        this.videoSections = [];
        this.displayableVideoSections = []; // Ensure displayable is also cleared on error
      }
    });
  }

  // --- REVISED detectUserLanguage ---
  detectUserLanguage(): void {
    const browserLang = navigator.language || (navigator as any).userLanguage;
    let newLang: 'en' | 'hi';
    if (browserLang && browserLang.toLowerCase().startsWith('hi')) {
      newLang = 'hi';
    } else {
      newLang = 'en';
    }

    if (newLang !== this.userLanguage) { // Only update if language actually changed
        this.userLanguage = newLang;
        // console.log('Detected language:', this.userLanguage);
        this.updateDisplayableVideos(); // Update display list when language changes
    } else {
        //  console.log('Language detected, no change:', this.userLanguage);
         // Optionally call updateDisplayableVideos here too if videoSections might load after language detection
         if(this.videoSections.length > 0 && this.displayableVideoSections.length === 0){
            this.updateDisplayableVideos();
         }
    }
  }


  // --- REVISED updateDisplayableVideos ---
  // Filters the main videoSections list based on whether a video has *any*
  // suitable source (YouTube or File, Language-specific or Fallback) for the current language.
  updateDisplayableVideos(): void {
    if (!this.videoSections || this.videoSections.length === 0) {
      this.displayableVideoSections = [];
      // console.log('No video sections to process for display filtering.');
      this.cdr.detectChanges();
      return;
    }

    // console.log(`Filtering ${this.videoSections.length} videos for language: ${this.userLanguage}`);

    this.displayableVideoSections = this.videoSections.filter(video => {
      let hasValidSource = false; // Initialize as boolean

      if (this.userLanguage === 'hi') {
        // Use !! to explicitly cast the result to boolean
        hasValidSource = !!(
            (video.youtube_link_hi && video.youtube_link_hi.trim() !== "") ||
            (video.video_file_hi && video.video_file_hi.trim() !== "")
        );
      } else { // Default to 'en'
        // Use !! to explicitly cast the result to boolean
        hasValidSource = !!(
            (video.youtube_link_en && video.youtube_link_en.trim() !== "") ||
            (video.video_file_en && video.video_file_en.trim() !== "")
        );
      }

      // --- Optional Fallback Logic (ensure it also uses !!) ---
      // if (!hasValidSource) {
      //    hasValidSource = !!(
      //        (video.youtube_link && video.youtube_link.trim() !== "") ||
      //        (video.video_file && video.video_file.trim() !== "")
      //    );
      // }
      // --- End Optional Fallback Logic ---


      // Logging for debugging (optional)
    //   if (!hasValidSource) {
    //       console.log(`  -> Video "${video.title}" (ID: ${video.id}) has NO valid source for lang "${this.userLanguage}". Filtering out.`);
    //   } else {
    //       console.log(`  -> Video "${video.title}" (ID: ${video.id}) HAS a valid source for lang "${this.userLanguage}". Including.`);
    //   }

      return hasValidSource; // hasValidSource is now guaranteed to be boolean
    });

    // console.log(`Displayable videos count for ${this.userLanguage}:`, this.displayableVideoSections.length);
    // console.log('Final Displayable videos:', JSON.stringify(this.displayableVideoSections.map(v => v.id), null, 2));
    this.cdr.detectChanges();
  }


  // --- Helper to get the YOUTUBE URL based on language preference ---
  getYouTubeUrlForLanguage(video: VideoSection): SafeResourceUrl | null {
    let targetUrl: string | null = null;
    if (!video) return null;

    if (this.userLanguage === 'hi' && video.youtube_link_hi && video.youtube_link_hi.trim() !== "") {
      targetUrl = video.youtube_link_hi;
    } else if (this.userLanguage === 'en' && video.youtube_link_en && video.youtube_link_en.trim() !== "") {
      targetUrl = video.youtube_link_en;
    }
    // --- Optional Fallback ---
    // Uncomment if you want the generic YouTube link as a fallback
    // else if (video.youtube_link && video.youtube_link.trim() !== "") {
    //   targetUrl = video.youtube_link;
    //   console.log(`  getVideoUrlForLanguage: Using fallback YouTube for "${video.title}"`);
    // }
    // --- End Optional Fallback ---

    if (targetUrl) {
      return this.sanitizeYoutubeUrl(targetUrl);
    }
    return null; // No suitable YouTube link found
  }

  // --- Helper to get the UPLOADED VIDEO FILE PATH based on language preference ---
  getUploadedVideoFileForLanguage(video: VideoSection): string | null {
    let targetPath: string | null = null;
    if (!video) return null;

    if (this.userLanguage === 'hi' && video.video_file_hi && video.video_file_hi.trim() !== "") {
      targetPath = video.video_file_hi;
    } else if (this.userLanguage === 'en' && video.video_file_en && video.video_file_en.trim() !== "") {
      targetPath = video.video_file_en;
    }
    // --- Optional Fallback ---
    // Uncomment if you want the generic video_file as a fallback
    // else if (video.video_file && video.video_file.trim() !== "") {
    //   targetPath = video.video_file;
    //   console.log(`  getUploadedVideoFileForLanguage: Using fallback file for "${video.title}"`);
    // }
    // --- End Optional Fallback ---

    if (targetPath) {
      // Prepend the base URL for uploaded files
      return this.baseUrl + targetPath;
    }
    return null; // No suitable uploaded file found
  }










}
