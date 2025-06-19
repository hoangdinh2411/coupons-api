import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { ApiTags } from '@nestjs/swagger';
import { CategoryDto } from './dto/category.dto';
import { ROLES } from 'common/constants/enum/roles.enum';
import { Roles } from 'common/decorators/roles.decorator';
import { Public } from 'common/decorators/public.decorator';
@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @HttpCode(201)
  @Roles(ROLES.ADMIN)
  create(@Body() createCategoryDto: CategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }
  @Get()
  @Public()
  findAll(
    @Query('limit') limit: number = 20,
    @Query('page') page: number = 1,
    @Query('search_text') search_text: string = '',
  ) {
    if (limit < 1 || page < 1) {
      throw new BadRequestException('Limit and page must be positive numbers');
    }

    return this.categoriesService.findAll(+limit, +page, search_text);
  }
  @Get('search')
  @Public()
  @Roles(ROLES.ADMIN)
  searchByName(@Query('name') name?: string) {
    return this.categoriesService.search(name);
  }

  @Get(':id')
  @Roles(ROLES.ADMIN)
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOneById(+id);
  }

  @Patch(':id')
  @Roles(ROLES.ADMIN)
  update(@Param('id') id: string, @Body() updateCategoryDto: CategoryDto) {
    return this.categoriesService.update(+id, updateCategoryDto);
  }

  @Delete(':id')
  @Roles(ROLES.ADMIN)
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(+id);
  }
}
