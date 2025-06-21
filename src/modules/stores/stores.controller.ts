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
import { StoresService } from './stores.service';
import { Roles } from 'common/decorators/roles.decorator';
import { ROLES } from 'common/constants/enum/roles.enum';
import { Public } from 'common/decorators/public.decorator';
import { StoreDto } from './dto/store.dto';
import { FilterStoreDto } from './dto/filter.dto';

@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Post()
  @HttpCode(201)
  @Roles(ROLES.ADMIN)
  create(@Body() createStoreDto: StoreDto) {
    return this.storesService.create(createStoreDto);
  }

  @Get()
  @Public()
  findAll(
    @Query('limit') limit: number,
    @Query('page') page: number,
    @Query('search_text') search_text: string,
  ) {
    return this.storesService.findAll(+limit, +page, search_text);
  }

  @Post('filter')
  @Public()
  filterStore(@Body() filterData: FilterStoreDto) {
    return this.storesService.filter(filterData);
  }

  @Get(':identifier')
  @Public()
  findOne(@Param('identifier') identifier: string) {
    return this.storesService.findOneBySlug(identifier);
  }

  @Patch(':id')
  @Roles(ROLES.ADMIN)
  update(@Param('id') id: string, @Body() updateStoreDto: StoreDto) {
    return this.storesService.update(+id, updateStoreDto);
  }

  @Delete(':id')
  @Roles(ROLES.ADMIN)
  remove(@Param('id') id: string) {
    return this.storesService.remove(+id);
  }
}
