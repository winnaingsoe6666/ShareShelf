# Community Tool Library — Proposal by @WinNaingSoe

## Gist

A community platform that allows people to share, borrow, and lend rarely used tools and equipment within their neighborhood, apartment, university, or local community.

## Story

Many people own useful items such as drills, ladders, camping tents, projectors, cameras, or toolkits, but they only use them a few times per year. When someone else needs the same item, they often have to buy it, rent it from a business, or spend time asking friends and neighbors.

For example, a university student needs a projector for a one-day presentation. Instead of buying one or searching through social media groups, they can open the Community Tool Library, find a nearby available projector, submit a borrow request, and use it for the day. The owner benefits by helping the community and building trust, while the borrower saves money and time.

## Why

People spend money purchasing items that are used only occasionally. At the same time, many valuable tools remain unused in homes, dormitories, and apartments.

A Community Tool Library helps reduce unnecessary spending, encourages resource sharing, and promotes a more sustainable community. Instead of everyone owning everything, communities can share resources efficiently while building trust and cooperation between members.

## Why Not

- Not building a full e-commerce marketplace.
- Not supporting payment processing in the initial MVP.
- Not targeting nationwide logistics or item delivery services.
- Not building a general second-hand buying and selling platform.

## Tech Spec

### Frontend

- React or Next.js
- Tailwind CSS
- Responsive mobile-first design

### Backend

- Spring Boot REST API
- PostgreSQL
- JWT Authentication

### Main Features

1. User Registration and Authentication
   - User profile
   - Community membership

2. Item Management
   - Create item listings
   - Upload photos
   - Availability status

3. Borrowing Workflow
   - Borrow request
   - Approve / Reject request
   - Borrow history

4. Search and Discovery
   - Search by item name
   - Filter by category
   - View nearby available items

5. Reputation System
   - Ratings
   - Borrowing history
   - Trust score

## Definition of Done

- [ ] Users can create accounts and log in.
- [ ] Users can create, edit, and remove item listings.
- [ ] Users can upload at least one photo per item.
- [ ] Users can search and browse available items.
- [ ] Users can submit borrow requests.
- [ ] Owners can approve or reject requests.
- [ ] Borrow and return status can be tracked.
- [ ] Users can rate each other after completed transactions.
- [ ] Application is deployed and accessible online.
- [ ] Demo scenario can successfully show item listing, borrowing, approval, return, and review flow.
