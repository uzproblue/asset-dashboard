#!/bin/bash

# Asset Dashboard Deployment Script
# This script helps deploy the dashboard to various platforms

echo "🚀 Asset Dashboard Deployment Script"
echo "===================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    yarn install
fi

# Build the project
echo "🔨 Building the project..."
yarn build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi

# Check if CSV data exists
if [ ! -f "public/data/assets.csv" ]; then
    echo "⚠️  Warning: No CSV data found at public/data/assets.csv"
    echo "   Please ensure your data file is in the correct location."
fi

echo ""
echo "🎉 Ready for deployment!"
echo ""
echo "Deployment options:"
echo "1. Vercel: vercel --prod"
echo "2. Netlify: netlify deploy --prod --dir=.next"
echo "3. Manual: Upload the .next folder to your hosting provider"
echo ""
echo "Make sure to:"
echo "- Update public/data/assets.csv with your latest data"
echo "- Test the deployment locally with 'yarn start'"
echo "- Check that all filters and charts work correctly"
