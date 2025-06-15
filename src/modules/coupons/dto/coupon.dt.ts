import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsString,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
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
  store: number;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({
    type: () => 'boolean',
    default: false,
    description: 'Is coupon exclusive?',
  })
  is_exclusive: boolean;

  @IsDateString()
  @IsNotEmpty()
  @ApiProperty({
    default: '2025-12-05',
    description: 'When does coupon end?',
  })
  expire_date: string;

  @Validate(IsEndAfterStart) private readonly _range!: never;
}
