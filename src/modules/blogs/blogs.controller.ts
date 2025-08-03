import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CurrentUser } from 'common/decorators/currentUser.decorator';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { BlogService } from './blogs.service';
import { BlogDto } from './dto/blog.dto';
import { UserEntity } from 'modules/users/entities/users.entity';
import { FilterDto } from 'common/constants/filter.dto';
import { Roles } from 'common/decorators/roles.decorator';
import { ROLES } from 'common/constants/enums';
import { ApiSecurity } from '@nestjs/swagger';

@Controller('blogs')
@ApiSecurity('bearer')
export class BlogsController {
  constructor(private readonly blogsService: BlogService) {}

  @Post()
  @Roles(ROLES.ADMIN)
  create(@CurrentUser() user: UserEntity, @Body() createPostDto: BlogDto) {
    return this.blogsService.create(user, createPostDto);
  }

  @Post('filter')
  @Roles(ROLES.ADMIN)
  filterStore(@Body() filterData: FilterDto) {
    return this.blogsService.filter(filterData);
  }
  @Get(':id')
  @Roles(ROLES.ADMIN)
  findOne(@Param('id') id: string) {
    return this.blogsService.findOne(id);
  }
  @Patch(':id')
  @Roles(ROLES.ADMIN)
  update(
    @CurrentUser() user,
    @Param('id') id: string,
    @Body() updatePostDto: UpdateBlogDto,
  ) {
    return this.blogsService.update(user, +id, updatePostDto);
  }

  @Delete(':id')
  @Roles(ROLES.ADMIN)
  remove(@Param('id') id: string, @CurrentUser() user: UserEntity) {
    return this.blogsService.remove(+id, user);
  }
}
