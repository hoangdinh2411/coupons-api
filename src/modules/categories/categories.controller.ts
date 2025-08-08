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
import { ApiQuery, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { CategoryDto } from './dto/category.dto';
import { ROLES } from 'common/constants/enums';
import { Roles } from 'common/decorators/roles.decorator';
@ApiTags('Categories')
@Controller('categories')
@ApiSecurity('bearer')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @HttpCode(201)
  @Roles(ROLES.ADMIN)
  create(@Body() createCategoryDto: CategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @Roles(ROLES.ADMIN, ROLES.PARTNER)
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search_text', required: false, type: String })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search_text') search_text?: string,
  ) {
    return this.categoriesService.findAll(+page, +limit, search_text);
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
