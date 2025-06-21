import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  Matches,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { CouponType } from 'common/constants/enum/coupon.enum';
import dayjs from 'dayjs';

@ValidatorConstraint({ async: false })
export class IsEndAfterStart implements ValidatorConstraintInterface {
  validate(_value: any, validationArguments?: ValidationArguments) {
    const { expire_date } = validationArguments.object as CouponDto;
    if (!expire_date) return true;
    return dayjs(expire_date).isAfter(dayjs(), 'day');
  }

  defaultMessage(): string {
    return 'End date must be after today';
  }
}
export class IsEfterStartDate implements ValidatorConstraintInterface {
  validate(_value: any, validationArguments?: ValidationArguments) {
    const { expire_date, start_date } = validationArguments.object as CouponDto;
    if (!expire_date || !start_date) return true;
    return dayjs(expire_date).isAfter(start_date, 'day');
  }

  defaultMessage(): string {
    return 'End date must be after start date';
  }
}

export class CouponDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: () => 'string',
    default: 'Coupon title',
    description: 'Coupon title',
  })
  title: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: () => 'string',
    default: 'ABC123',
    description: 'Code of coupon',
  })
  code: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: () => 'string',
    default: 'Offer detail ',
    description: 'Detail of offer',
  })
  offer_detail: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    type: () => 'number',
    default: 1,
    description: 'Store id',
  })
  store_id: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    type: () => 'number',
    default: 1,
    description: 'Category id',
  })
  category_id: number;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({
    type: () => 'boolean',
    default: false,
    description: 'Is coupon exclusive?',
  })
  is_exclusive: boolean;

  @IsString()
  @Matches(/^\d{4}\/\d{2}\/\d{2}$/, {
    message: 'start date must be in the format YYYY/MM/DD',
  })
  @IsNotEmpty()
  @ApiProperty({
    default: '2025-12-05',
    description: 'When does coupon end?',
  })
  start_date: string;

  @IsString()
  @Matches(/^\d{4}\/\d{2}\/\d{2}$/, {
    message: 'expired date must be in the format YYYY/MM/DD',
  })
  @IsNotEmpty()
  @ApiProperty({
    default: '2025-12-05',
    description: 'When does coupon end?',
  })
  expire_date: string;
  @Validate(IsEndAfterStart) private readonly _range!: never;

  @IsEnum(CouponType, {
    message: 'Not support this type',
  })
  @IsNotEmpty()
  type: CouponType;
}
