import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Roles } from 'common/decorators/roles.decorator';
import { ROLES } from 'common/constants/enums';
import { UserEntity } from 'modules/users/entities/users.entity';
import { CurrentUser } from 'common/decorators/currentUser.decorator';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @Roles(ROLES.USER, ROLES.PARTNER, ROLES.ADMIN)
  create(
    @Body() createCommentDto: CreateCommentDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.commentsService.create(createCommentDto, user);
  }

  @Get(':id')
  @Roles(ROLES.USER, ROLES.PARTNER, ROLES.ADMIN)
  findOne(@Param('id') id: string) {
    return this.commentsService.findOne(+id);
  }

  @Patch(':id')
  @Roles(ROLES.USER, ROLES.PARTNER, ROLES.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.commentsService.update(id, updateCommentDto, user);
  }

  @Delete(':id')
  @Roles(ROLES.USER, ROLES.PARTNER, ROLES.ADMIN)
  remove(@Param('id') id: string, @CurrentUser() user: UserEntity) {
    return this.commentsService.remove(id, user);
  }
}
