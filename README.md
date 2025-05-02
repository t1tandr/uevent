# UEvent - Platform for Event Discovery and Connection

UEvent is a comprehensive platform that helps people find interesting events, discover which friends are attending them, and connect with like-minded individuals. From cultural happenings to professional conferences, our service brings people together around shared interests.

## 🚀 Features

### For Attendees

- **Discover Events** - Browse events with advanced filtering by format, theme, location, and price
- **Purchase Tickets** - Secure payment processing with support for promo codes and discounts
- **Mobile-Ready Tickets** - QR code tickets for easy event check-in
- **Social Experience** - See which friends are attending events
- **Discussion** - Comment on events and engage with other attendees

### For Event Organizers

- **Event Management** - Create and manage events with detailed information
- **Company Profiles** - Establish a company presence with branding and a portfolio of events
- **Ticket Management** - View attendee lists and sales statistics
- **Promotional Tools** - Create custom discount codes for your events
- **Marketing Features** - Schedule event publications and notify subscribers

## 🛠️ Technology Stack

### Backend

- Framework: NestJS
- Database: PostgreSQL with Prisma ORM
- Authentication: JWT, OAuth (Google)
- File Storage: AWS S3
- Payment Processing: Stripe
- Email Notifications: NodeMailer
- Documentation: Swagger
- Background Processing: Bull Queue

### Frontend

- Framework: React with React Router
- UI Components: NextUI
- Styling: TailwindCSS
- Forms: React Hook Form with Zod validation
- State Management: Redux
- API Communication: Axios

## 🔧 Getting Started

### Prerequisites

- Node.js (v16+)
- PostgreSQL
- npm or yarn

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/npalii/uevent.git
cd uevent/backend

# Install dependencies
npm install

# Set up environment variables (copy and edit the example)
cp .env.example .env

# Run database migrations
npx prisma migrate dev

# Start the development server
npm run start:dev
```

The API documentation is available at http://localhost:3000/api/docs after starting the server.

### Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Set up environment variables (copy and edit the example)
cp .env.example .env

# Start the development server
npm run dev
```

The frontend application is available at http://localhost:5173 after starting the development server.

## 📝 API Documentation

The API is fully documented using Swagger. When running the backend server, visit `/api/docs` to explore the available endpoints interactively.

Main API categories:

- **Auth** - User registration, login, password recovery, OAuth integration
- **Events** - Event creation, listing, searching, filtering, and details
- **Companies** - Company profile creation, management, and event portfolio
- **Tickets** - Purchase processing, QR code generation, validation
- **Comments** - Discussion threads on events
- **Files** - Upload and management of images and documents
- **Notifications** - Email alerts for event updates and reminders

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📬 Contact

Nikita Palii - npalii.work@gmail.com

Project Link: https://github.com/npalii/uevent

<p align="center"> Made with ❤️ by UEvent Team </p>
