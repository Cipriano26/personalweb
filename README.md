# Personal Web

This project is an Angular application with Tailwind CSS and Preline UI components.

## Features

- **Angular 20.3** - Latest Angular framework
- **Tailwind CSS** - Modern utility-first CSS framework
- **Preline UI** - Beautiful pre-built components
- **Routing** - Angular Router configured
- **PostCSS** - With autoprefixer for browser compatibility

## Prerequisites

- Node.js (version 18 or higher)
- npm (comes with Node.js)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd personalweb
```

2. Install dependencies:
```bash
npm install
```

## Development

To start a local development server:

```bash
npm start
# or
ng serve
```

Open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Building

To build the project for production:

```bash
npm run build
# or
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory.

## Project Structure

```
src/
├── app/                 # Angular components and services
│   ├── app.html        # Main application template
│   ├── app.ts          # Main application component
│   └── app.routes.ts   # Application routes
├── main.ts             # Application entry point (includes Preline import)
├── styles.css          # Global styles with Tailwind directives
└── index.html          # Main HTML file
```

## Configuration Files

- `tailwind.config.js` - Tailwind CSS configuration with Preline plugin
- `postcss.config.js` - PostCSS configuration with autoprefixer
- `angular.json` - Angular CLI configuration with routing and CSS setup

## Using Preline Components

Preline components are ready to use in your templates. Example:

```html
<button type="button" class="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700">
  Button
</button>
```

Visit [Preline documentation](https://preline.co/docs/index.html) for more components and examples.

## Additional Commands

Generate a new component:
```bash
ng generate component component-name
```

Run tests:
```bash
ng test
```

For more Angular CLI commands:
```bash
ng help
```
