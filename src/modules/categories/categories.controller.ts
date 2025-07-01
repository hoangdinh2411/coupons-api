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
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
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
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'search_text', required: false, type: String })
  findAll(
    @Query('page') page?: number,
    @Query('search_text') search_text?: string,
  ) {
    return this.categoriesService.findAll(+page, search_text);
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
