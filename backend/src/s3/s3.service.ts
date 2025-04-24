import {
	DeleteObjectCommand,
	GetObjectCommand,
	PutObjectCommand,
	S3Client
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class S3Service {
	private s3Client: S3Client
	private bucketName: string

	constructor(private configService: ConfigService) {
		this.s3Client = new S3Client({
			region: this.configService.get('AWS_REGION'),
			credentials: {
				accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
				secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY')
			}
		})
		this.bucketName = this.configService.get('AWS_BUCKET_NAME')
	}

	async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
		const key = `${folder}/${Date.now()}-${file.originalname}`

		await this.s3Client.send(
			new PutObjectCommand({
				Bucket: this.bucketName,
				Key: key,
				Body: file.buffer,
				ContentType: file.mimetype
			})
		)

		return `https://${this.bucketName}.s3.amazonaws.com/${key}`
	}

	async uploadMultipleFiles(
		files: Express.Multer.File[],
		folder: string
	): Promise<string[]> {
		const uploadPromises = files.map(file => this.uploadFile(file, folder))
		return Promise.all(uploadPromises)
	}

	async deleteFile(fileUrl: string): Promise<void> {
		const key = this.getKeyFromUrl(fileUrl)

		await this.s3Client.send(
			new DeleteObjectCommand({
				Bucket: this.bucketName,
				Key: key
			})
		)
	}

	async getSignedUrl(key: string): Promise<string> {
		const command = new GetObjectCommand({
			Bucket: this.bucketName,
			Key: key
		})

		return getSignedUrl(this.s3Client, command, { expiresIn: 3600 })
	}

	private getKeyFromUrl(url: string): string {
		const urlObj = new URL(url)
		return urlObj.pathname.slice(1)
	}
}
