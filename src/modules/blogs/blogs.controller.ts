import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { Public } from 'common/decorators/public.decorator';
import { CurrentUser } from 'common/decorators/currentUser.decorator';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { BlogService } from './blogs.service';
import { BlogDto } from './dto/blog.dto';
import { UserEntity } from 'modules/users/entities/users.entity';
import { FilterStoreDto } from 'modules/stores/dto/filter.dto';
import { Roles } from 'common/decorators/roles.decorator';
import { ROLES } from 'common/constants/enum/roles.enum';

@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogService) {}

  @Post()
  @Roles(ROLES.ADMIN)
  create(@CurrentUser() user: UserEntity, @Body() createPostDto: BlogDto) {
    return this.blogsService.create(user, createPostDto);
  }

  @Get()
  @Public()
  findAll() {
    return this.blogsService.findAll();
  }
  @Post('filter')
  @Public()
  filterStore(@Body() filterData: FilterStoreDto) {
    return this.blogsService.filter(filterData);
  }
  @Get(':identifier')
  @Public()
  findOne(@Param('identifier') identifier: string) {
    return this.blogsService.findOne(identifier);
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
