import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { TelegramButtonComponent } from '../../shared/components/telegram-button/telegram-button.component';
import { SeoService } from '../../shared/services/seo.service';

interface FAQ {
  question: string;
  answer: string;
  questionUz: string;
  answerUz: string;
}

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, MatExpansionModule, MatIconModule, TelegramButtonComponent],
  template: `
    <div class="faq-page bg-gray-50 dark:bg-gray-900 min-h-screen py-12">
      <div class="container mx-auto px-4 max-w-4xl">
        <!-- Page Header -->
        <div class="text-center mb-12">
          <mat-icon class="text-6xl text-primary-600 dark:text-primary-400 mb-4">help_outline</mat-icon>
          <h1 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Frequently Asked Questions
          </h1>
          <p class="text-xl text-gray-600 dark:text-gray-400">
            Find answers to commonly asked questions
          </p>
        </div>

        <!-- FAQ Accordion -->
        <mat-accordion class="space-y-4">
          @for (faq of faqs; track faq.question) {
            <mat-expansion-panel class="bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <mat-expansion-panel-header>
                <mat-panel-title class="text-lg font-medium text-gray-900 dark:text-white">
                  {{ faq.question }}
                </mat-panel-title>
              </mat-expansion-panel-header>
              <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
                {{ faq.answer }}
              </p>
            </mat-expansion-panel>
          }
        </mat-accordion>

        <!-- Contact CTA -->
        <div class="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <mat-icon class="text-5xl text-primary-600 dark:text-primary-400 mb-4">support_agent</mat-icon>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Still have questions?
          </h2>
          <p class="text-gray-700 dark:text-gray-300 mb-6">
            Contact us through Telegram and we'll be happy to help!
          </p>
          <app-telegram-button></app-telegram-button>
        </div>
      </div>

      <!-- Floating Telegram Button -->
      <app-telegram-button [floating]="true"></app-telegram-button>
    </div>
  `,
  styles: [`
    :host ::ng-deep .mat-expansion-panel {
      border-radius: 12px !important;
      margin-bottom: 1rem;
    }

    :host ::ng-deep .mat-expansion-panel-header {
      padding: 1.5rem !important;
    }

    :host ::ng-deep .mat-expansion-panel-body {
      padding: 1.5rem !important;
    }

    :host ::ng-deep mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
    }
  `]
})
export class FaqComponent implements OnInit {
  private seoService = inject(SeoService);

  faqs: FAQ[] = [
    {
      question: 'How can I place an order?',
      answer: 'You can place an order by clicking the "Order via Telegram" button on any product page. This will open a chat with our bot where you can complete your order.',
      questionUz: 'Qanday qilib buyurtma berishim mumkin?',
      answerUz: 'Har qanday mahsulot sahifasida "Telegram orqali buyurtma" tugmasini bosish orqali buyurtma berishingiz mumkin. Bu bizning bot bilan suhbatni ochadi, u yerda buyurtmangizni yakunlashingiz mumkin.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept cash on delivery, bank transfers, and popular payment cards. Payment details will be discussed when you place your order via Telegram.',
      questionUz: 'Qanday to\'lov usullarini qabul qilasiz?',
      answerUz: 'Biz naqd pul, bank o\'tkazmalari va mashhur to\'lov kartalarini qabul qilamiz. To\'lov tafsilotlari Telegram orqali buyurtma berganingizda muhokama qilinadi.'
    },
    {
      question: 'Do you offer delivery?',
      answer: 'Yes, we offer delivery throughout Tashkent and other regions of Uzbekistan. Delivery costs and timeframes will be calculated based on your location.',
      questionUz: 'Yetkazib berishni taklif qilasizmi?',
      answerUz: 'Ha, biz Toshkent va O\'zbekistonning boshqa hududlari bo\'ylab yetkazib berishni taklif qilamiz. Yetkazib berish narxi va muddatlari sizning joylashuvingiz asosida hisoblanadi.'
    },
    {
      question: 'What is your return policy?',
      answer: 'We accept returns within 14 days of purchase if the product is in its original condition with all packaging and accessories. Defective items can be returned or exchanged at any time during the warranty period.',
      questionUz: 'Qaytarish siyosatingiz qanday?',
      answerUz: 'Agar mahsulot asl holatida bo\'lsa va barcha qadoq va aksessuarlar bilan birga bo\'lsa, biz xariddan keyin 14 kun ichida qaytarishni qabul qilamiz. Nuqsonli mahsulotlarni kafolat muddati davomida istalgan vaqtda qaytarish yoki almashtirish mumkin.'
    },
    {
      question: 'Do products come with warranty?',
      answer: 'Yes, all our products come with official manufacturer warranty. The warranty period varies by product and manufacturer, typically ranging from 6 months to 2 years.',
      questionUz: 'Mahsulotlar kafolat bilan keladimi?',
      answerUz: 'Ha, bizning barcha mahsulotlarimiz rasmiy ishlab chiqaruvchi kafolati bilan keladi. Kafolat muddati mahsulot va ishlab chiqaruvchiga qarab o\'zgaradi, odatda 6 oydan 2 yilgacha.'
    },
    {
      question: 'Are the products authentic?',
      answer: 'Yes, we only sell 100% authentic products from authorized distributors and official retailers. All products come with original packaging and documentation.',
      questionUz: 'Mahsulotlar aslmi?',
      answerUz: 'Ha, biz faqat vakolatli distribyutorlar va rasmiy sotuvchilardan 100% asl mahsulotlarni sotamiz. Barcha mahsulotlar asl qadoq va hujjatlar bilan keladi.'
    },
    {
      question: 'Can I see the product before purchasing?',
      answer: 'Yes, you can visit our showroom in Tashkent to see and test products before making a purchase. Please contact us via Telegram to schedule a visit.',
      questionUz: 'Xarid qilishdan oldin mahsulotni ko\'rishim mumkinmi?',
      answerUz: 'Ha, xarid qilishdan oldin mahsulotlarni ko\'rish va sinab ko\'rish uchun Toshkentdagi ko\'rgazma zaliga tashrif buyurishingiz mumkin. Tashrifni rejalashtirish uchun Telegram orqali biz bilan bog\'laning.'
    },
    {
      question: 'How can I track my order?',
      answer: 'Once your order is shipped, we will send you tracking information via Telegram. You can use this to monitor your delivery status in real-time.',
      questionUz: 'Buyurtmamni qanday kuzatishim mumkin?',
      answerUz: 'Buyurtmangiz jo\'natilgandan so\'ng, biz sizga Telegram orqali kuzatuv ma\'lumotlarini yuboramiz. Siz buni yetkazib berish holatingizni real vaqtda kuzatish uchun ishlatishingiz mumkin.'
    },
    {
      question: 'What languages do you support?',
      answer: 'We support both Russian and Uzbek languages on our website and in customer communications. You can switch between languages using the language selector in the header.',
      questionUz: 'Qanday tillarni qo\'llab-quvvatlaysiz?',
      answerUz: 'Biz veb-saytimizda va mijozlar bilan muloqotda rus va o\'zbek tillarini qo\'llab-quvvatlaymiz. Sarlavhadagi til tanlash orqali tillar o\'rtasida almashishingiz mumkin.'
    },
    {
      question: 'Do you offer discounts or promotions?',
      answer: 'Yes, we regularly run promotions and offer discounts on selected products. Follow us on social media or check our website regularly to stay updated on current offers.',
      questionUz: 'Chegirmalar yoki aksiyalar taklif qilasizmi?',
      answerUz: 'Ha, biz muntazam ravishda aksiyalar o\'tkazamiz va tanlangan mahsulotlarga chegirmalar taklif qilamiz. Joriy takliflardan xabardor bo\'lish uchun bizni ijtimoiy tarmoqlarda kuzatib boring yoki veb-saytimizni muntazam tekshiring.'
    }
  ];

  ngOnInit(): void {
    this.updateSEO();
  }

  private updateSEO(): void {
    this.seoService.updateMetaTags({
      title: 'FAQ - GGPoint',
      description: 'Frequently asked questions about GGPoint products, ordering, delivery, and warranty.',
      keywords: 'faq, questions, help, support, ggpoint',
      type: 'website'
    });
  }
}
