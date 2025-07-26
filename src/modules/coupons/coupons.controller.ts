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
import { ROLES } from 'common/constants/enums';
import { UserEntity } from 'modules/users/entities/users.entity';
import { CurrentUser } from 'common/decorators/currentUser.decorator';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { FilterDto } from 'common/constants/filter.dto';
import { ApiSecurity } from '@nestjs/swagger';

@Controller('coupons')
@ApiSecurity('bearer')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Post()
  @Roles(ROLES.ADMIN, ROLES.USER, ROLES.PARTNER)
  create(@CurrentUser() user: UserEntity, @Body() createCouponDto: CouponDto) {
    return this.couponsService.create(createCouponDto, user);
  }

  @Get(':id')
  @Roles(ROLES.ADMIN, ROLES.USER)
  findOne(@Param('id') id: string) {
    return this.couponsService.findOne(+id);
  }

  @Patch(':id')
  @Roles(ROLES.ADMIN, ROLES.USER)
  update(
    @CurrentUser() user: UserEntity,
    @Param('id') id: string,
    @Body() updateCouponDto: UpdateCouponDto,
  ) {
    return this.couponsService.update(+id, updateCouponDto, user);
  }

  @Delete(':id')
  @Roles(ROLES.ADMIN, ROLES.USER)
  remove(@CurrentUser() user: UserEntity, @Param('id') id: string) {
    return this.couponsService.remove(+id, user);
  }

  @Patch('/submit/:id')
  @Roles(ROLES.ADMIN)
  submit(@Param('id') id: string) {
    return this.couponsService.submitCoupon(+id);
  }

  @Post('filter')
  @Roles(ROLES.ADMIN)
  filterCoupon(@Body() filterData: FilterDto) {
    return this.couponsService.filter(filterData);
  }
}
