import { NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * API route that returns a signature and timestamp for a Cloudinary upload.
 * Cloudinary signed uploads require a signature computed using the API secret.
 * The client can call this endpoint to get a signature prior to uploading.
 */
export async function GET() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json({ error: 'Cloudinary not configured' }, { status: 500 });
  }
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = crypto
    .createHash('sha1')
    .update(`timestamp=${timestamp}${apiSecret}`)
    .digest('hex');
  return NextResponse.json({ signature, timestamp, cloudName, apiKey });
}