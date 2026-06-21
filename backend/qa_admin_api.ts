import fs from 'fs';

const API_BASE = 'http://127.0.0.1:3000/api';

async function runTests() {
  console.log('=== STARTING ADMIN QA ===\n');

  try {
    // 1. Create an Offer
    const offerPayload = {
      title: 'QA Launch Special',
      description: '50% off for QA testers!',
      discountPercentage: 50,
      applicablePlan: 'Premium Plan',
      expiresAt: '2027-12-31'
    };
    const offerRes = await fetch(`${API_BASE}/admin/offers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(offerPayload)
    });
    console.log('Offer creation:', offerRes.status, await offerRes.text());

    // 2. Fetch active Offers
    const getOffersRes = await fetch(`${API_BASE}/offers/active`);
    console.log('Get Offers:', getOffersRes.status, await getOffersRes.text());

    // 3. Create a Course
    const coursePayload = {
      title: 'Advanced QA with Cypress',
      platform: 'Udemy',
      targetSkill: 'Cypress',
      discountCode: 'QA50',
      url: 'https://udemy.com/cypress'
    };
    const courseRes = await fetch(`${API_BASE}/admin/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(coursePayload)
    });
    console.log('Course creation:', courseRes.status, await courseRes.text());

    // 4. Fetch Courses
    const getCoursesRes = await fetch(`${API_BASE}/courses`);
    console.log('Get Courses:', getCoursesRes.status, await getCoursesRes.text());

    // 5. Blast a Notification
    const notifPayload = {
      targetRole: 'All',
      title: 'QA System Online',
      message: 'The new notification system is now online.',
      type: 'popup'
    };
    const notifRes = await fetch(`${API_BASE}/admin/notifications/blast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notifPayload)
    });
    console.log('Notification Blast:', notifRes.status, await notifRes.text());

    // 6. Fetch user notifications (mocking candidate query)
    const userNotifRes = await fetch(`${API_BASE}/notifications?role=Candidate`);
    console.log('Get User Notifications:', userNotifRes.status, await userNotifRes.text());

  } catch (error) {
    console.error('QA Error:', error);
  }
}

runTests();
