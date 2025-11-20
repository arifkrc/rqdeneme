# QR Code Creator & Reader

A modern React web application for creating and reading QR codes with a clean, responsive interface.

## Features

### QR Code Generator
- Create QR codes from any text input
- Support for URLs, text, and other data types
- High-quality canvas-based generation
- Download QR codes as PNG images
- Real-time generation with visual feedback

### QR Code Reader
- Upload and scan QR codes from image files
- Support for common image formats (PNG, JPG, etc.)
- Copy results to clipboard
- Auto-detect and open URLs
- Error handling for invalid QR codes

## Technology Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **QRCode** library for QR generation
- **QR-Scanner** library for QR reading
- Modern CSS with responsive design

## Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. Clone or download the project
2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

Build the application:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Usage

### Creating QR Codes
1. Click on the "Create QR Code" tab
2. Enter your text, URL, or any data in the text area
3. Click "Generate QR Code"
4. Download the generated QR code using the "Download QR Code" button

### Reading QR Codes
1. Click on the "Read QR Code" tab
2. Click "Choose Image File" to upload an image containing a QR code
3. The decoded result will appear below
4. Copy the result to clipboard or open URLs directly

## Project Structure

```
src/
├── components/
│   ├── QRGenerator.tsx    # QR code generation component
│   └── QRReader.tsx       # QR code reading component
├── App.tsx                # Main application component
├── App.css                # Application styles
└── main.tsx              # Application entry point
```

## Browser Support

This application works in all modern browsers that support:
- Canvas API (for QR generation)
- File API (for image uploads)
- ES6+ features

## License

This project is open source and available under the MIT License.

## Development Notes

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
