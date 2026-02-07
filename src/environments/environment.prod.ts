/**
 * Client-side environment configuration for production
 * These values should be replaced during build/deployment with actual production values
 */
export const environment = {
  production: true,
  apiUrl: 'https://gg-point.uz',
  domain: 'https://gg-point.uz',
  contact: {
    phone: '+998-XX-XXX-XXXX',
    email: 'info@gg-point.uz',
    address: 'Tashkent, Uzbekistan\nAmir Temur Avenue',
    hours: 'Monday - Sunday\n9:00 - 20:00',
    // Schema.org specific fields
    streetAddress: 'Amir Temur Avenue',
    city: 'Tashkent',
    region: 'Tashkent',
    country: 'UZ',
    openTime: '09:00',
    closeTime: '20:00',
  },
};
