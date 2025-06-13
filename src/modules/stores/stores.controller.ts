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
  findAll(@Query('limit') limit: number = 20, @Query('page') page: number = 1) {
    if (limit < 1 || page < 1) {
      throw new BadRequestException('Limit and page must be positive numbers');
    }
    return this.storesService.findAll(+limit, +page);
  }
  
  @Post('filter')
  @Public()
  filterStore(@Body() filterData: FilterStoreDto) {
    return this.storesService.filter(filterData);
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.storesService.findOne(+id);
  }

  @Patch(':id')
  @Roles(ROLES.ADMIN, ROLES.PARTNER)
  update(@Param('id') id: string, @Body() updateStoreDto: StoreDto) {
    return this.storesService.update(+id, updateStoreDto);
  }

  @Delete(':id')
  @Roles(ROLES.ADMIN)
  remove(@Param('id') id: string) {
    return this.storesService.remove(+id);
  }
}
