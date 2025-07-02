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
import { StoreDto } from './dto/store.dto';
import { FilterDto } from '../../common/constants/filter.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { ApiQuery } from '@nestjs/swagger';

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
  @Roles(ROLES.ADMIN)
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'search_text', required: false, type: String })
  findAll(
    @Query('page') page: number,
    @Query('search_text') search_text: string,
  ) {
    return this.storesService.findAll(+page, search_text);
  }

  @Post('filter')
  @Roles(ROLES.ADMIN)
  filterStore(@Body() filterData: FilterDto) {
    return this.storesService.filter(filterData);
  }

  @Get(':id')
  @Roles(ROLES.ADMIN)
  findOneById(@Param('id') id: string) {
    return this.storesService.findOne(id);
  }

  @Patch(':id')
  @Roles(ROLES.ADMIN)
  update(@Param('id') id: string, @Body() updateStoreDto: UpdateStoreDto) {
    return this.storesService.update(+id, updateStoreDto);
  }

  @Delete(':id')
  @Roles(ROLES.ADMIN)
  remove(@Param('id') id: string) {
    return this.storesService.remove(+id);
  }
}
