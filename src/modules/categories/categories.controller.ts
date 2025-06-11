import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
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
  @Roles(ROLES.ADMIN, ROLES.PARTNER)
  create(@Body() createCategoryDto: CategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }
  @Get()
  @Public()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  @Roles(ROLES.ADMIN, ROLES.PARTNER)
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(+id);
  }

  @Patch(':id')
  @Roles(ROLES.ADMIN, ROLES.PARTNER)
  update(@Param('id') id: string, @Body() updateCategoryDto: CategoryDto) {
    return this.categoriesService.update(+id, updateCategoryDto);
  }

  @Delete(':id')
  @Roles(ROLES.ADMIN, ROLES.PARTNER)
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(+id);
  }
}
