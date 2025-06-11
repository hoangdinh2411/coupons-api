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
import { StoresService } from './stores.service';
import { Roles } from 'common/decorators/roles.decorator';
import { ROLES } from 'common/constants/enum/roles.enum';
import { Public } from 'common/decorators/public.decorator';
import { StoreDto } from './dto/store.dto';

@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Post()
  @HttpCode(201)
  @Roles(ROLES.ADMIN, ROLES.PARTNER)
  create(@Body() createStoreDto: StoreDto) {
    return this.storesService.create(createStoreDto);
  }

  @Get()
  @Public()
  findAll() {
    return this.storesService.findAll();
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
  @Roles(ROLES.ADMIN, ROLES.PARTNER)
  remove(@Param('id') id: string) {
    return this.storesService.remove(+id);
  }
}
