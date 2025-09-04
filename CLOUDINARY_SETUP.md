# Cloudinary Setup Instructions

## Environment Variables Required

Add these environment variables to your `.env.local` file:

```bash
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset_here
```

## How to Get Cloudinary Credentials

1. **Sign up for Cloudinary**: Go to [https://cloudinary.com](https://cloudinary.com) and create a free account
2. **Get Cloud Name**: 
   - Go to your [Cloudinary Dashboard](https://cloudinary.com/console)
   - Your cloud name is displayed at the top of the dashboard
3. **Create Upload Preset**:
   - Go to Settings → Upload
   - Click "Add upload preset"
   - Set the following:
     - **Preset name**: `mandaya-upload` (or any name you prefer)
     - **Signing Mode**: `Unsigned` (for client-side uploads)
     - **Folder**: `mandaya-awards` (optional, for organization)
     - **Resource Type**: `Auto` (to handle both images and documents)
     - **Access Mode**: `Public` (IMPORTANT: This allows public access to uploaded files)
   - Click "Save"

4. **Enable PDF Delivery** (CRITICAL for PDF files):
   - Go to Settings → Security
   - Scroll down to "PDF and ZIP files delivery"
   - **Enable** "Allow delivery of PDF and ZIP files"
   - Click "Save"

## Supported File Types

The upload system now supports:

### Images
- JPEG/JPG
- PNG
- GIF
- WebP
- SVG

### Documents
- PDF
- DOC
- DOCX
- TXT
- RTF

## File Size Limits

- Maximum file size: 10MB per file
- Files larger than 10MB will be rejected with an error message

## How It Works

1. **Client-side validation**: Files are validated before upload (size, type)
2. **Cloudinary upload**: Files are uploaded directly to Cloudinary from the browser
3. **URL return**: Cloudinary returns a secure URL that can be stored in your database
4. **Error handling**: Comprehensive error messages for various failure scenarios

## Testing the Upload

1. Set up your environment variables
2. Start your development server
3. Go to any form with file upload (assessment forms or submission page)
4. Try uploading different file types to test the functionality

## Troubleshooting

### "Cloudinary credentials not configured" error
- Make sure your environment variables are set correctly
- Restart your development server after adding environment variables

### "Upload failed" error
- Check your Cloudinary upload preset settings
- Ensure the upload preset is set to "Unsigned" mode
- Verify your cloud name is correct

### "Failed to load PDF document" or "ACL failure" error
- **CRITICAL**: Enable PDF delivery in Cloudinary Settings → Security
- Set your upload preset Access Mode to "Public"
- Make sure "Allow delivery of PDF and ZIP files" is enabled
- The error `x-cld-error: deny or ACL failure` means the file is not publicly accessible

### File type not supported
- Check the allowed file types in the code
- Ensure your file extension matches the MIME type

### Images work but PDFs don't upload or display correctly
**This is the most common issue!** There are two possible causes:

**Cause 1: Upload Preset Configuration**
- Your upload preset is configured to only allow images
- **Solution**: Set Resource Type to "Auto" and Access Mode to "Public"

**Cause 2: URL Extension Issue (Most Common)**
- Cloudinary raw uploads often return URLs without `.pdf` extension
- Our PDF detection logic can't identify them as PDFs
- **Solution**: The code now automatically constructs proper PDF URLs with extensions

**Updated Solution:**
1. Go to Cloudinary Dashboard → Settings → Upload
2. Find your upload preset and click "Edit"
3. **CRITICAL**: Set **Resource Type** to **"Auto"** (not just "Image")
4. Set **Access Mode** to **"Public"**
5. Go to Settings → Security
6. Enable **"Allow delivery of PDF and ZIP files"**
7. Save both settings
8. Try uploading a new PDF file

**Why this happens:**
- Images upload to `/image/upload` endpoint ✅
- PDFs upload to `/raw/upload` endpoint but may return URLs without `.pdf` extension
- The updated code now ensures PDF URLs always have proper extensions

### PDF uploads work but can't be viewed
1. Go to Cloudinary Dashboard → Settings → Security
2. Enable "Allow delivery of PDF and ZIP files"
3. Go to Settings → Upload → Your Upload Preset
4. Set Access Mode to "Public"
5. Save both settings
6. Try uploading a new PDF file
