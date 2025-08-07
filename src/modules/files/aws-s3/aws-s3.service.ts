// aws-s3.service.ts
import { ConflictException, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import { FileAdapter } from '../files.adapter';

@Injectable()
export class AwsS3Service implements FileAdapter {
  private readonly logger = new Logger(AwsS3Service.name);
  constructor(
    @Inject('aws-s3') private readonly s3: AWS.S3,
    private readonly configService: ConfigService,
  ) {}

  async upload(file: Express.Multer.File, folder = 'shared', is_used: boolean) {
    try {
      const payload: AWS.S3.PutObjectRequest = {
        Bucket: this.configService.get<string>('AWS_BUCKET_NAME'),
        Key: `uploads/${folder}/${Date.now()}_${file.originalname}`,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read', // hoặc 'private' nếu không muốn public
      };
      if (!is_used) {
        payload['Tagging'] = 'status=unused';
      }
      const uploadResult = await this.s3.upload(payload).promise();
      return {
        public_id: uploadResult.Key,
        url: uploadResult.Location,
        file_name: file.originalname,
      }; // trả về URL ảnh
    } catch (error) {
      this.logger.error('upload image:', error);
      throw new ConflictException('Could not upload image ' + file);
    }
  }
  async deleteOne(key: string): Promise<boolean> {
    try {
      await this.s3
        .deleteObject({
          Bucket: this.configService.get<string>('AWS_BUCKET_NAME'),
          Key: key,
        })
        .promise();
      return true;
    } catch (error) {
      this.logger.error('Delete image:', error);
      throw new ConflictException('Could not delete image ' + key);
    }
  }

  async getUnusedImages() {
    const unusedKeys: string[] = [];
    let continuationToken: string | undefined = undefined;
    try {
      do {
        const listResponse = await this.s3
          .listObjectsV2({
            Bucket: this.configService.get<string>('AWS_BUCKET_NAME'),
            MaxKeys: 1000, // optional, mặc định là 1000
            ContinuationToken: continuationToken, // 👈 phân trang
            Prefix: 'uploads',
          })
          .promise();

        const contents = listResponse.Contents ?? [];

        for (const obj of contents) {
          if (!obj.Key) continue;

          const tagResult = await this.s3
            .getObjectTagging({
              Bucket: this.configService.get<string>('AWS_BUCKET_NAME'),
              Key: obj.Key,
            })
            .promise();

          const isUnused = tagResult.TagSet.some(
            (tag) => tag.Key === 'status' && tag.Value === 'unused',
          );

          if (isUnused) {
            unusedKeys.push(obj.Key);
          }
        }

        // 👇 tiếp tục phân trang nếu còn
        continuationToken = listResponse.IsTruncated
          ? listResponse.NextContinuationToken
          : undefined;
      } while (continuationToken);

      return unusedKeys;
    } catch (error) {
      this.logger.error('getUnusedImages', error);
      throw new ConflictException('Could not delete unused images today ');
    }
  }
  async markImageAsUsed(keys: string[]): Promise<boolean> {
    try {
      if (keys) {
        await Promise.all(keys.map((k) => this.removeUnusedTagging(k)));
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error('markImageAsUsed', error);
      throw new ConflictException('Could not remove tag on images ' + keys);
    }
  }

  async removeUnusedTagging(key: string): Promise<boolean> {
    if (!key) {
      return false;
    }
    try {
      await this.s3
        .putObjectTagging({
          Bucket: this.configService.get<string>('AWS_BUCKET_NAME'),
          Key: key,
          Tagging: {
            TagSet: [],
          },
        })
        .promise();
      return true;
    } catch (error) {
      this.logger.error('removeUnusedTagging', error);
      throw new ConflictException('Could not remove tag on images ' + key);
    }
  }
}
