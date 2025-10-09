# Logo Setup for Invoice

## Instructions:

1. **Save your Voyage Eyewear logo** as `logo.png` in this folder
2. **Recommended size**: 300x300 pixels or similar square format
3. **Format**: PNG with transparent background (preferred) or JPG
4. **File name**: Must be exactly `logo.png`

## Current Path:
```
backend/src/assets/logo.png
```

## How the logo appears:
- The logo will appear on the left side of the invoice header
- It will be 60x60 points in size on the PDF
- Company name "SS ENTERPRISES" will appear next to the logo
- If no logo is found, the system will fallback to text-only header

## To add your logo:
1. Take the Voyage Eyewear logo (rose gold "V" design)
2. Save it as PNG format
3. Rename to `logo.png`
4. Place it in this `backend/src/assets/` folder
5. Restart the backend server
6. Generate a new invoice to see the logo

## Note:
- The logo replaces the "V" that appeared before "SS ENTERPRISES"
- Make sure the logo has good contrast and is clearly visible when printed

