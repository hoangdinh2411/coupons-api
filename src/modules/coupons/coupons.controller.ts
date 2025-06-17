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
import { UserEntity } from 'modules/users/entities/users.entity';
import { CurrentUser } from 'common/decorators/currentUser.decorator';

@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Post()
  @Roles(ROLES.ADMIN, ROLES.USER)
  create(@CurrentUser() user: UserEntity, @Body() createCouponDto: CouponDto) {
    return this.couponsService.create(createCouponDto, user);
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

  @Patch(':id')
  @Roles(ROLES.ADMIN, ROLES.USER)
  update(
    @CurrentUser() user: UserEntity,
    @Param('id') id: string,
    @Body() updateCouponDto: CouponDto,
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
  @Public()
  filterCoupon(@Body() filterData: FilterCouponDto) {
    return this.couponsService.filter(filterData);
  }
}
