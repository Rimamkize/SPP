# SPP Payment System

A modern React TypeScript application for managing school fee payments (SPP - Sumbangan Pembinaan Pendidikan).

## Features

- **Authentication System**: Secure login and registration with role-based access (Admin/Staff)
- **Student Management**: Add, edit, delete, and search student records
- **Payment Tracking**: Monitor payments, track due dates, and manage overdue accounts
- **WhatsApp Notifications**: Automated reminders and payment confirmations
- **Financial Reports**: Generate detailed reports and analytics
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Development**: ESLint, TypeScript

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd spp-payment-system
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Demo Accounts

For testing purposes, you can use these demo accounts:

- **Admin**: 
  - Username: `admin`
  - Password: `admin123`
  
- **Staff**: 
  - Username: `tu_staff`
  - Password: `tu123`

## Project Structure

```
src/
├── components/         # Reusable components
├── hooks/             # Custom React hooks
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
├── main.tsx           # Application entry point
├── App.tsx            # Root component
└── SPPSystemWithAuth.tsx  # Main application component
```

## Features Overview

### Dashboard
- Overview of payment statistics
- Quick access to key metrics
- User account information

### Student Management
- Add new students with complete information
- Edit existing student records
- Delete students (with confirmation)
- Search and filter capabilities
- Class-based organization

### Payment Management
- Record new payments
- Track payment status
- View payment history
- Support for multiple payment methods

### Reports
- Daily payment reports
- Monthly financial summaries
- Overdue payment tracking
- Export capabilities

### WhatsApp Integration
- Automated payment reminders
- Overdue notifications
- Payment confirmations
- Template-based messaging

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please contact the development team or create an issue in the repository.
