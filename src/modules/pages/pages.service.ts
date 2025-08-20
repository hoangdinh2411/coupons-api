import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { PageEntity } from './entities/page.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, ILike, QueryFailedError, Repository } from 'typeorm';
import { FilesService } from 'modules/files/files.service';
import { FAQService } from 'modules/faqs/services/faqs.service';
import { isNumeric } from 'common/helpers/number';

@Injectable()
export class PagesService {
  constructor(
    @InjectRepository(PageEntity)
    private readonly pageRepo: Repository<PageEntity>,
    private readonly fileService: FilesService,
    private readonly faqService: FAQService,
    private readonly dataSource: DataSource,
  ) {}
  async create({ faqs, ...createPageDto }: CreatePageDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const new_page = this.pageRepo.create(createPageDto);
      await this.pageRepo.save(new_page);
      const public_ids = createPageDto.images.length
        ? createPageDto.images
            .filter((i) => i.public_id !== '')
            .map((i) => i.public_id)
        : [];
      if (createPageDto.thumbnail.public_id) {
        public_ids.push(createPageDto.thumbnail.public_id);
      }
      if (public_ids.length) {
        await this.fileService.markImageAsUsed(public_ids);
      }

      if (faqs.length) {
        await this.faqService.saveFaqs(
          faqs,
          {
            page: new_page,
          },
          queryRunner.manager,
        );
      }
      if (new_page.content) {
        await this.fileService.updateTagsFOrUsedImagesFromHtml(
          new_page.content,
        );
      }
      await queryRunner.commitTransaction();
      return new_page;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof QueryFailedError) {
        const err = error.driverError;
        if (err.code === '23505') {
          throw new ConflictException('Page already exist');
        }
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
  async findAll(page?: number, limit?: number, search_text?: string) {
    const query = this.pageRepo.createQueryBuilder('page');
    if (page && limit) {
      query.skip((page - 1) * limit).take(limit);
    }

    if (search_text) {
      query.andWhere({
        type: ILike(`%${search_text}%`),
      });
    }
    return await query.orderBy('pages.updated_at', 'ASC').getManyAndCount();
  }

  async findOne(identifier: string) {
    const query = this.pageRepo
      .createQueryBuilder('page')
      .leftJoinAndSelect('page.faqs', 'faqs');
    if (isNumeric(identifier)) {
      query.where('page.id =:id', { id: +identifier });
    } else {
      query.where('page.type ILIKE :type', { type: `%${identifier}%` });
    }
    const page = await query.getOne();
    if (!page) {
      throw new NotFoundException('Page not found');
    }
    return page;
  }

  async update(id: number, updatePageDto: UpdatePageDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const page = await this.findOne(String(id));
      if (!page) {
        throw new NotFoundException('Page not found');
      }
      const { faqs, ...dtoWithoutFaqs } = updatePageDto;
      const data = {
        ...page,
        ...dtoWithoutFaqs,
      };
      if (page?.faqs && page?.faqs?.length !== 0) {
        await this.faqService.deleteFaqs('page', page.id, queryRunner.manager);
      }
      const new_page = await this.pageRepo.save(data);

      if (faqs?.length > 0) {
        await this.faqService.saveFaqs(
          faqs,
          {
            page: new_page,
          },
          queryRunner.manager,
        );
      }

      // handle images
      if (page.images.length) {
        const image_to_delete = page.images.filter(
          (saved_img) =>
            !updatePageDto.images.some(
              (new_img) => new_img.public_id === saved_img.public_id,
            ),
        );

        if (image_to_delete) {
          const public_id_to_delete = image_to_delete.map((i) => i.public_id);
          await this.fileService.deleteImages(public_id_to_delete);
        }
      }

      if (new_page.images.length) {
        const image_to_update = new_page.images.filter(
          (new_img) =>
            !page.images.some(
              (old_img) => old_img.public_id === new_img.public_id,
            ),
        );
        if (image_to_update) {
          const public_id_to_update = image_to_update.map((i) => i.public_id);
          await this.fileService.markImageAsUsed(public_id_to_update);
        }
      }

      const hasNewThumbnail = updatePageDto.thumbnail.public_id;
      const hasAlreadyThumbnail = page.thumbnail.public_id;
      const needToChangeThumbnail =
        hasNewThumbnail &&
        hasAlreadyThumbnail &&
        hasAlreadyThumbnail !== hasAlreadyThumbnail;
      if (needToChangeThumbnail) {
        await this.fileService.deleteImages([hasAlreadyThumbnail]);
      }
      if (hasNewThumbnail) {
        await this.fileService.markImageAsUsed([hasNewThumbnail]);
      }

      if (page.content) {
        await this.fileService.deleteImageFromHTML(page.content);
      }

      if (new_page.content) {
        await this.fileService.updateTagsFOrUsedImagesFromHtml(
          new_page.content,
        );
      }
      await queryRunner.commitTransaction();
      return new_page;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof QueryFailedError) {
        const err = error.driverError;
        if (err.code === '23505') {
          throw new ConflictException('Category already exist');
        }
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const page = await this.findOne(String(id));
      if (!page) {
        throw new NotFoundException('Category not found');
      }
      if (page.content) {
        await this.fileService.deleteImageFromHTML(page.content);
      }
      const ids = page.images.length ? page.images.map((i) => i.public_id) : [];
      if (page.thumbnail.public_id) {
        ids.push(page.thumbnail.public_id);
      }
      if (ids.length) {
        await this.fileService.deleteImages(ids);
      }
      await this.pageRepo.delete(page.id);
      await queryRunner.commitTransaction();
      return true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
