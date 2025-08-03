import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  Matches,
  Validate,
  ValidateIf,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { CouponType } from 'common/constants/enums';
import dayjs from 'dayjs';

@ValidatorConstraint({ async: false })
export class IsAfterStartDate implements ValidatorConstraintInterface {
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
    default: 'offer_link',
    description: 'offer link',
  })
  offer_link: string;

  @ValidateIf((o) => o.type.toLowerCase() === CouponType.CODE.toLowerCase())
  @IsString()
  @IsNotEmpty({
    message: 'Code is required if type = Code',
  })
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
    description: 'Discount up to ',
  })
  discount: number;

  @IsArray()
  @ArrayNotEmpty({ message: 'At least one category ID is required' })
  @IsInt({ each: true, message: 'Each category must be an integer' })
  @Type(() => Number)
  @ApiProperty({
    default: [1, 2],
    description: 'Category ids',
  })
  categories: number[];

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
    default: '2025/11/05',
    description: 'When does coupon end?',
  })
  start_date: string;

  @IsString()
  @Matches(/^\d{4}\/\d{2}\/\d{2}$/, {
    message: 'expired date must be in the format YYYY/MM/DD',
  })
  @IsNotEmpty()
  @ApiProperty({
    default: '2025/12/05',
    description: 'When does coupon end?',
  })
  expire_date: string;
  @Validate(IsAfterStartDate) private readonly _range!: never;

  @IsEnum(CouponType, {
    message: 'Not support this type',
  })
  @ApiProperty({
    default: 'code',
    description: 'Coupon type',
  })
  @IsNotEmpty()
  @IsEnum(CouponType, {
    message: 'Just support ' + Object.values(CouponType).join(','),
  })
  type: CouponType;
}
