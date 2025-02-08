import type { H3Event } from 'h3'
import type { FileRouter } from 'uploadthing/h3'
import { createUploadthing } from 'uploadthing/h3'

const f = createUploadthing()

export const uploadRouter = {
    imageUploader: f({
        image: {
            maxFileSize: '4MB',
            maxFileCount: 1,
        },
    })
        .middleware(async ({ event }: { event: H3Event }) => {
            // running before upload
            const user = event.context.user

            if (!user) {
                throw new Error('Unauthorized')
            }

            // accessible in onUploadComplete as `metadata`
            return { userId: user.id }
        })
        .onUploadComplete(async ({ metadata, file }) => {
            // running after upload
            console.log('Upload complete for userId:', metadata.userId)
            console.log('file url', file.url)
        }),

    pdfUploader: f({
        pdf: {
            maxFileSize: '8MB',
            maxFileCount: 1,
        },
    })
        .middleware(async ({ event }: { event: H3Event }) => {
            const user = event.context.user

            if (!user) {
                throw new Error('Unauthorized')
            }

            return {
                userId: user.id,
                timestamp: new Date().toISOString()
            }
        })
        .onUploadComplete(async ({ metadata, file }) => {
            console.log('PDF upload complete:', {
                userId: metadata.userId,
                url: file.url,
                timestamp: metadata.timestamp,
            })

            return { url: file.url }
        }),
} satisfies FileRouter

export type UploadRouter = typeof uploadRouter
