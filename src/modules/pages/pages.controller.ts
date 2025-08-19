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
import { PagesService } from './pages.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { Roles } from 'common/decorators/roles.decorator';
import { ROLES } from 'common/constants/enums';

@Controller('pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Post()
  @HttpCode(201)
  @Roles(ROLES.ADMIN, ROLES.PARTNER)
  create(@Body() createPageDto: CreatePageDto) {
    return this.pagesService.create(createPageDto);
  }

  @Get()
  @Roles(ROLES.ADMIN, ROLES.PARTNER)
  async findAll() {
    const [result, total] = await this.pagesService.findAll();
    return {
      result,
      total,
    };
  }

  @Get(':id')
  @Roles(ROLES.ADMIN, ROLES.PARTNER)
  findOne(@Param('id') id: string) {
    return this.pagesService.findOne(id);
  }

  @Patch(':id')
  @Roles(ROLES.ADMIN, ROLES.PARTNER)
  update(@Param('id') id: string, @Body() updatePageDto: UpdatePageDto) {
    return this.pagesService.update(+id, updatePageDto);
  }

  @Delete(':id')
  @Roles(ROLES.ADMIN, ROLES.PARTNER)
  remove(@Param('id') id: string) {
    return this.pagesService.remove(+id);
  }
}
