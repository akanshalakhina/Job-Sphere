# README for Next Agent

This document lists the pending issues and requirements that need to be addressed in the next phase of development for the Job-Sphere project.

## 1. ATS Scanner Issues
- The ATS scanner is currently not showing much data. It needs to be enhanced to display more comprehensive results and insights.
- The AI Resume Scanner tool is not working as expected and needs debugging.

## 2. Print Resume Issue
- When printing the resume from the Candidate Dashboard, the printout includes "localhost:5173" at the bottom and outputs 3 pages total instead of just 1 clean page. This print layout needs to be fixed.

## 3. AI Chatbot (AI Coach)
- There is no loading icon in the AI chatbot when waiting for the Gemini API response. A loading state/indicator needs to be added for better user experience.

## 4. Mock Data to ML Models / Real Database
- Currently, there is a lot of mock data being used (e.g., hashtags, profile metrics, trending data).
- Ensure that this data is eventually driven by ML models.
- For now, store this data in MongoDB:
  - All hashtags used in posts.
  - Profile views (e.g., via a variable).
- **Profile Page:** Create a profile page that looks like the LinkedIn profile page.

## 5. Contact Us & Newsletter Forms
- The "Contact Us" email form and the "Join Newsletter" form are currently fake.
- Ensure they work in real-time and actually send out emails to users.

## 6. Interview Tracker
- The interview tracker is currently using fake/mock data. It needs to be connected to the real backend database.

## 7. UI Polish: Student Workspace Navbar
- The navbar in the student workspace needs more width so that all the links can fit in one single line.
