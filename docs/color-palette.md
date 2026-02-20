# Color Palette

## Core Colors
The Solom application uses the following core color palette:

- **Primary:** `#165BA2`
- **Success:** `#04A24C`

## Tailwind Mapping
These colors are mapped to Tailwind CSS variables to ensure consistent usage across the application. 

### Example Configuration
In your Tailwind configuration file, extend the theme colors as follows:

```typescript
theme: {
  extend: {
    colors: {
      primary: {
        DEFAULT: '#165BA2',
      },
      success: {
        DEFAULT: '#04A24C',
      }
    }
  }
}
```
