import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { CouponDto } from './dto/coupon.dt';
import { Roles } from 'common/decorators/roles.decorator';
import { ROLES } from 'common/constants/enum/roles.enum';
import { Public } from 'common/decorators/public.decorator';
import { FilterCouponDto } from './dto/filter.dto';

@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Post()
  @Roles(ROLES.ADMIN, ROLES.PARTNER)
  create(@Body() createCouponDto: CouponDto) {
    return this.couponsService.create(createCouponDto);
  }

  @Get()
  @Public()
  findAll() {
    return this.couponsService.findAll();
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.couponsService.findOne(+id);
  }

  @Post('filter')
  @Public()
  filterCoupon(@Body() filterData: FilterCouponDto) {
    return this.couponsService.filter(filterData);
  }

  @Patch(':id')
  @Roles(ROLES.ADMIN, ROLES.PARTNER)
  update(@Param('id') id: string, @Body() updateCouponDto: CouponDto) {
    return this.couponsService.update(+id, updateCouponDto);
  }

  @Delete(':id')
  @Roles(ROLES.ADMIN, ROLES.PARTNER)
  remove(@Param('id') id: string) {
    return this.couponsService.remove(+id);
  }
}
