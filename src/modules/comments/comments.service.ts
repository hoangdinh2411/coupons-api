import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentEntity } from './entities/comment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from 'modules/users/entities/users.entity';
import { BlogService } from 'modules/blogs/blogs.service';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentEntity)
    private readonly commentRepo: Repository<CommentEntity>,
    private readonly blogService: BlogService,
  ) {}

  async create(createCommentDto: CreateCommentDto, user: UserEntity) {
    const blog = await this.blogService.findOne(
      createCommentDto.blog_id.toString(),
    );
    const new_comment = this.commentRepo.create({
      ...createCommentDto,
      user,
      blog,
    });
    await this.commentRepo.save(new_comment);
    return {
      ...createCommentDto,
      id: new_comment.id,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
      },
    };
  }

  findAll(blog_id: number, page?: number, limit?: number) {
    const query = this.commentRepo
      .createQueryBuilder('comment')
      .where('comment.blog_id=:blog_id', { blog_id });

    if (page && limit) {
      query.skip((page - 1) * limit).take(limit);
    }

    return query
      .orderBy('comment.created_at', 'DESC')
      .leftJoin('comment.user', 'user')
      .addSelect([
        'user.email',
        'user.first_name',
        'user.last_name',
        'user.id',
        // 'user.image',
      ])
      .leftJoin('comment.blog', 'blog')
      .addSelect(['blog.id'])
      .getManyAndCount();
  }

  async findOne(id: number) {
    return await this.commentRepo
      .createQueryBuilder('comment')
      .where('comment.id=:id', { id })
      .leftJoin('comment.user', 'user')
      .addSelect(['user.email', 'user.first_name', 'user.last_name', 'user.id'])
      .leftJoin('comment.blog', 'blog')
      .addSelect(['blog.id'])
      .getOne();
  }

  async update(
    id: string,
    updateCommentDto: UpdateCommentDto,
    user: UserEntity,
  ) {
    const comment = await this.findOne(+id);
    if (comment.user.id !== user.id) {
      throw new ForbiddenException('You do not have permission to update it');
    }

    return this.commentRepo.save({
      ...comment,
      ...updateCommentDto,
    });
  }

  async remove(id: string, user: UserEntity) {
    const result = await this.commentRepo.delete({
      id: +id,
      user: {
        id: user.id,
      },
    });
    if (result.affected === 0) {
      throw new ForbiddenException(
        'Comment not found or you do not have permission to delete it',
      );
    }
    return true;
  }
}
