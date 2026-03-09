/**
 * Image Upload API
 *
 * POST /api/upload
 *
 * Accepts a multipart form-data request with an "image" file field.
 * Uploads the image to Cloudinary and returns the secure URL.
 *
 * Requires authentication (any logged-in user).
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import cloudinary from '@/lib/cloudinary'

// Max file size: 5 MB
const MAX_FILE_SIZE = 5 * 1024 * 1024

// Allowed MIME types
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
]

export async function POST(request: NextRequest) {
  try {
    // ─── Auth check ───
    const auth = await getAuthUser(request)
    if (!auth) {
      return NextResponse.json(
        { error: 'Authentication required.' },
        { status: 401 }
      )
    }

    // ─── Parse multipart form data ───
    const formData = await request.formData()
    const file = formData.get('image')

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'No image file provided. Send a "image" field in form data.' },
        { status: 400 }
      )
    }

    // ─── Validate file type ───
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type "${file.type}". Allowed: JPEG, PNG, WebP, GIF, AVIF.` },
        { status: 400 }
      )
    }

    // ─── Validate file size ───
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is 5 MB.` },
        { status: 400 }
      )
    }

    // ─── Check Cloudinary configuration ───
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return NextResponse.json(
        { error: 'Image upload service is not configured. Please set Cloudinary environment variables.' },
        { status: 503 }
      )
    }

    // ─── Convert File to buffer and upload ───
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const result = await new Promise<{ secure_url: string; public_id: string }>(
      (resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'agrovault/products',
            resource_type: 'image',
            transformation: [
              { width: 1200, height: 1200, crop: 'limit' },
              { quality: 'auto', fetch_format: 'auto' },
            ],
          },
          (error, result) => {
            if (error || !result) {
              reject(error ?? new Error('Upload failed'))
            } else {
              resolve({
                secure_url: result.secure_url,
                public_id: result.public_id,
              })
            }
          }
        )
        uploadStream.end(buffer)
      }
    )

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
    })
  } catch (error) {
    console.error('[Upload API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to upload image.' },
      { status: 500 }
    )
  }
}
