# Asset Value Dashboard

A modern, responsive web dashboard for tracking asset values over time with multi-language support and interactive filtering.

## Features

- 📊 **Interactive Charts**: Line charts showing asset values and indexed performance
- 🌍 **Multi-language Support**: English, German, and French
- 🔍 **Advanced Filtering**: Filter by category, subcategory, expert, and specific assets
- 📱 **Responsive Design**: Works on desktop and mobile devices
- ⚡ **Fast Performance**: Optimized for <2s load times
- 📈 **Indexed Values**: Track performance relative to initial values

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Charts**: Chart.js with react-chartjs-2
- **Styling**: Tailwind CSS
- **Data**: CSV-based data source
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+
- Yarn package manager

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd asset-dashboard
```

2. Install dependencies:

```bash
yarn install
```

3. Start the development server:

```bash
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Data Management

### Updating CSV Data

The dashboard reads data from `public/data/assets.csv`. To update the data:

1. **Replace the CSV file**:

   - Place your new `assets.csv` file in `public/data/`
   - Ensure the CSV has the same column structure as the original

2. **Expected CSV format**:

```csv
asset_id,price_date,value_eur,release_date,issuance_value_eur,number_of_splints,Round indexed_at 100,asset_en,asset_de,asset_fr,category_en,category_de,category_fr,subcategory_en,subcategory_de,subcategory_fr,expert
```

3. **Date format**: Excel date numbers are automatically converted to JavaScript dates

### Converting from Excel

If you have an Excel file instead of CSV:

1. Use the provided conversion script:

```bash
yarn node -e "const xlsx = require('xlsx'); const workbook = xlsx.readFile('path/to/your/data.xlsx'); const sheetName = workbook.SheetNames[0]; const worksheet = workbook.Sheets[sheetName]; const csv = xlsx.utils.sheet_to_csv(worksheet); require('fs').writeFileSync('public/data/assets.csv', csv);"
```

2. Or manually export from Excel as CSV and place in `public/data/`

## Deployment

### Vercel (Recommended)

1. **Connect to Vercel**:

   - Push your code to GitHub/GitLab
   - Connect your repository to Vercel
   - Vercel will automatically detect Next.js and deploy

2. **Manual deployment**:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# For production
vercel --prod
```

3. **Environment variables**: No environment variables required for basic functionality

### Other Platforms

The app can be deployed to any platform that supports Next.js:

- Netlify
- AWS Amplify
- Railway
- Render

## Adding Filters

### Adding New Filter Types

1. **Update the data interface** in `src/lib/data.ts`:

```typescript
export interface AssetData {
  // ... existing fields
  new_field: string;
}
```

2. **Add filter state** in `src/app/page.tsx`:

```typescript
const [selectedNewField, setSelectedNewField] = useState<string[]>([]);
```

3. **Update filter logic** in `src/lib/data.ts`:

```typescript
export function filterData(
  data: ProcessedAssetData[],
  filters: {
    // ... existing filters
    newField: string[];
  }
): ProcessedAssetData[] {
  return data.filter((item) => {
    // ... existing filters
    const newFieldMatch =
      filters.newField.length === 0 ||
      filters.newField.includes(item.new_field);

    return (
      categoryMatch &&
      subcategoryMatch &&
      expertMatch &&
      assetMatch &&
      newFieldMatch
    );
  });
}
```

4. **Add UI component** in `src/app/page.tsx`:

```tsx
<FilterSelect
  options={newFieldOptions}
  selectedValues={selectedNewField}
  onSelectionChange={setSelectedNewField}
  label={t.newField}
  language={language}
  placeholder="All new fields"
/>
```

### Customizing Filter Behavior

- **Search functionality**: Built into FilterSelect component
- **Select All/Clear All**: Automatically included
- **Multi-select**: Default behavior
- **Styling**: Customize in `src/components/FilterSelect.tsx`

## Performance Optimization

### Current Optimizations

- **Data caching**: CSV data cached for 1 hour
- **Memoized calculations**: Expensive operations cached with useMemo
- **Lazy loading**: Components load only when needed
- **Optimized charts**: Chart.js configured for performance

### Further Optimizations

1. **Data pagination**: For very large datasets
2. **Virtual scrolling**: For long asset lists
3. **Service worker**: For offline functionality
4. **CDN**: For static assets

## Troubleshooting

### Common Issues

1. **Data not loading**:

   - Check CSV file exists in `public/data/assets.csv`
   - Verify CSV format matches expected structure
   - Check browser console for errors

2. **Charts not rendering**:

   - Ensure Chart.js dependencies are installed
   - Check for JavaScript errors in console
   - Verify data format is correct

3. **TypeScript errors**:

   - Run `yarn build` to check for compilation errors
   - Ensure all dependencies are properly installed

4. **Performance issues**:
   - Check data size (large datasets may be slow)
   - Enable browser dev tools performance tab
   - Consider data pagination for very large datasets

### Development Tips

- Use `yarn dev` for development with hot reload
- Check `yarn build` before deploying
- Use browser dev tools for debugging
- Test on different screen sizes for responsiveness

## Project Structure

```
src/
├── app/
│   ├── api/data/          # API routes for data
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main dashboard page
├── components/
│   ├── ChartArea.tsx      # Interactive chart component
│   ├── FilterSelect.tsx   # Multi-select filter component
│   ├── Header.tsx         # Header with logo
│   ├── LanguageSelector.tsx # Language switcher
│   └── ValueToggle.tsx    # Value/Indexed toggle
├── lib/
│   ├── csv-parser.ts      # CSV parsing utilities
│   ├── data.ts            # Data types and processing
│   └── utils.ts           # General utilities
└── data/
    └── assets.csv         # Data source (moved to public/data/)
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions or issues:

1. Check the troubleshooting section
2. Review the code documentation
3. Create an issue in the repository
4. Contact the development team

---

**Note**: This dashboard is designed for monthly data updates. For real-time data, consider implementing a backend API with database integration.
